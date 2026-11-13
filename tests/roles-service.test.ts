import { mkdtemp, readFile, readdir, rename, rm, unlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import { remoteErrorOf } from '@deepseek-ai/dsh-typert-protocol'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BUILTIN_ROLES } from '../src/role-catalog.ts'
import { RoleCatalogService } from '../src/roles-service.ts'

// Keep the actual Host service, validators, and on-disk files. Inject only the
// OS read failures and observe that reading never invokes filesystem writes.
vi.mock('node:fs/promises', async importOriginal => {
  const original = await importOriginal<typeof import('node:fs/promises')>()
  return {
    ...original,
    readFile: vi.fn(original.readFile), writeFile: vi.fn(original.writeFile),
    rename: vi.fn(original.rename), unlink: vi.fn(original.unlink),
  }
})

beforeEach(() => { vi.clearAllMocks() })

async function withService(
  run: (fixture: { principal: { kind: string }; service: RoleCatalogService; directory: string; path: string; updated: ReturnType<typeof vi.fn> }) => Promise<void>,
  enabled = true,
) {
  const directory = await mkdtemp(join(tmpdir(), 'ae-role-service-'))
  const path = join(directory, 'roles.json')
  const ctx = new Context()
  const updated = vi.fn()
  const principal = { kind: 'owner' }
  Object.assign(ctx, {
    typert: { register: vi.fn() },
    invocation: { peer: { principal } },
    logger: Object.assign(vi.fn(), { warn: vi.fn(), info: vi.fn(), error: vi.fn(), debug: vi.fn() }),
  })
  ctx.on('ai-agent-engine/roles-updated', updated)
  try {
    const service = new RoleCatalogService(ctx, { enabled: () => enabled, rolesPath: path })
    await run({ principal, service, directory, path, updated })
  } finally {
    try { await ctx.fiber.dispose() } finally { await rm(directory, { recursive: true, force: true }) }
  }
}

function expectNoWrites() {
  expect(writeFile).not.toHaveBeenCalled()
  expect(rename).not.toHaveBeenCalled()
  expect(unlink).not.toHaveBeenCalled()
}

describe('role editor Host read boundary', () => {
  it('returns the saved overlay for editing even when the policy is disabled', async () => {
    await withService(async ({ service, path, updated }) => {
      const document = { version: 1, roles: [{ id: 'frontend', responsibility: 'Saved brief' }, { id: 'security', skill: 'ae-grill' }] }
      const text = `${JSON.stringify(document, null, 2)}\n`
      await writeFile(path, text)
      vi.mocked(writeFile).mockClear()
      await expect(service.getCatalog()).resolves.toMatchObject({ enabled: false, source: 'builtin', roles: BUILTIN_ROLES })
      await expect(service.getOverlay()).resolves.toEqual({ ...document, path, exists: true })
      expectNoWrites()
      expect(updated).not.toHaveBeenCalled()
      expect(await readFile(path, 'utf8')).toBe(text)
    }, false)
  })

  it('reports a genuinely missing file as an empty overlay without creating it', async () => {
    await withService(async ({ service, directory, path, updated }) => {
      await expect(service.getOverlay()).resolves.toEqual({ version: 1, roles: [], path, exists: false })
      expect(await readdir(directory)).toEqual([])
      expectNoWrites()
      expect(updated).not.toHaveBeenCalled()
    })
  })

  it.each(['EIO', 'EACCES'])('rejects editor loading after %s, preserves the file, and supports a clean retry', async code => {
    await withService(async ({ service, directory, path, updated }) => {
      const document = { version: 1, roles: [{ id: 'frontend', responsibility: 'Must not be overwritten' }] }
      const text = JSON.stringify(document)
      await writeFile(path, text)
      vi.mocked(writeFile).mockClear()
      const failure = Object.assign(new Error(`Synthetic temporary read failure: ${code}`), { code })
      // Policy generation may fall back, but this must never turn into a
      // successful empty editor load that the UI could then submit.
      vi.mocked(readFile).mockRejectedValueOnce(failure)
      await expect(service.getCatalog()).resolves.toMatchObject({ enabled: true, source: 'builtin', roles: BUILTIN_ROLES })
      vi.mocked(readFile).mockRejectedValueOnce(failure)
      const rejected = await service.getOverlay().then(() => undefined, error => error)
      expect(remoteErrorOf(rejected)).toMatchObject({
        code: 'ae-roles/rejected', message: expect.stringContaining(code),
      })
      expectNoWrites()
      expect(updated).not.toHaveBeenCalled()
      expect(await readdir(directory)).toEqual(['roles.json'])
      expect(await readFile(path, 'utf8')).toBe(text)
      await expect(service.getOverlay()).resolves.toEqual({ ...document, path, exists: true })
      expectNoWrites()
    })
  })

  it.each([
    ['corrupt JSON', '{broken'],
    ['unsupported schema', '{"version":2,"roles":[]}'],
    ['invalid sibling', '{"version":1,"roles":[{"id":"frontend","responsibility":"Preserve valid sibling"},{"id":"lead"}]}'],
    ['duplicate identities', '{"version":1,"roles":[{"id":"frontend"},{"id":"frontend"}]}'],
  ])('rejects %s instead of exposing a partial or empty editable overlay', async (_name, text) => {
    await withService(async ({ service, directory, path, updated }) => {
      await writeFile(path, text)
      vi.mocked(writeFile).mockClear()
      const rejected = await service.getOverlay().then(() => undefined, error => error)
      expect(remoteErrorOf(rejected)).toMatchObject({ code: 'ae-roles/invalid-overlay', message: expect.any(String) })
      expectNoWrites()
      expect(updated).not.toHaveBeenCalled()
      expect(await readdir(directory)).toEqual(['roles.json'])
      expect(await readFile(path, 'utf8')).toBe(text)
    })
  })

  it('does not read or write the overlay for an unauthorized caller', async () => {
    await withService(async ({ principal, service, directory, updated }) => {
      principal.kind = 'guest'
      const rejected = await service.getOverlay().then(() => undefined, error => error)
      expect(remoteErrorOf(rejected)).toMatchObject({ code: 'ae-roles/rejected', message: expect.stringContaining('Host owner') })
      expect(readFile).not.toHaveBeenCalled()
      expectNoWrites()
      expect(updated).not.toHaveBeenCalled()
      expect(await readdir(directory)).toEqual([])
    })
  })

  it('preserves an existing overlay when a submitted edit fails validation', async () => {
    await withService(async ({ service, directory, path, updated }) => {
      const text = '{"version":1,"roles":[{"id":"frontend","responsibility":"Saved before failed edit"}]}\n'
      await writeFile(path, text)
      vi.mocked(writeFile).mockClear()
      const rejected = await service.putOverlay({ version: 1, roles: [{ id: 'lead' }] }).then(() => undefined, error => error)
      expect(remoteErrorOf(rejected)).toMatchObject({ code: 'ae-roles/invalid-overlay' })
      expectNoWrites()
      expect(updated).not.toHaveBeenCalled()
      expect(await readdir(directory)).toEqual(['roles.json'])
      expect(await readFile(path, 'utf8')).toBe(text)
    })
  })
})
