import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import {
  BUILTIN_ROLES,
  RoleOverlayValidationError,
  diffRolesAgainstBuiltin,
  mergeRoleCatalog,
  validateRolesFile,
} from '../src/role-catalog.ts'
import {
  deleteRolesFile,
  readOverlayDocument,
  resolveRoleCatalog,
  writeRolesFile,
} from '../src/role-catalog-io.ts'

vi.mock('node:fs/promises', async importOriginal => {
  const original = await importOriginal<typeof import('node:fs/promises')>()
  return { ...original, readFile: vi.fn(original.readFile) }
})

describe('role overlay write path', () => {
  it('writes atomically and rejects invalid payloads without persisting', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'ae-roles-write-'))
    const path = join(directory, 'roles.json')
    try {
      await expect(writeRolesFile(path, { version: 2, roles: [] })).rejects.toBeInstanceOf(RoleOverlayValidationError)
      await expect(writeRolesFile(path, {
        version: 1,
        roles: [{ id: 'lead', responsibility: 'nope' }],
      })).rejects.toBeInstanceOf(RoleOverlayValidationError)
      await expect(readFile(path, 'utf8')).rejects.toMatchObject({ code: 'ENOENT' })

      const written = await writeRolesFile(path, {
        version: 1,
        roles: [{ id: 'frontend', responsibility: 'Custom UI brief.' }],
      })
      expect(written.roles).toEqual([{ id: 'frontend', responsibility: 'Custom UI brief.' }])
      const onDisk = JSON.parse(await readFile(path, 'utf8'))
      expect(onDisk).toEqual({
        version: 1,
        roles: [{ id: 'frontend', responsibility: 'Custom UI brief.' }],
      })
      const merged = await resolveRoleCatalog({ enabled: true, path })
      expect(merged.source).toBe('merged')
      expect(merged.roles.find(role => role.id === 'frontend')?.responsibility).toBe('Custom UI brief.')
      expect(merged.roles.find(role => role.id === 'frontend')?.skill).toBe('ae-frontend')
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })

  it('deleteRolesFile restores builtin and treats missing file as success', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'ae-roles-del-'))
    const path = join(directory, 'roles.json')
    try {
      await writeRolesFile(path, {
        version: 1,
        roles: [{ id: 'backend', responsibility: 'Custom backend' }],
      })
      await deleteRolesFile(path)
      await deleteRolesFile(path)
      const catalog = await resolveRoleCatalog({ enabled: true, path })
      expect(catalog.source).toBe('builtin')
      expect(catalog.roles.map(role => role.id)).toEqual(BUILTIN_ROLES.map(role => role.id))
      expect(await readOverlayDocument(path)).toBeUndefined()
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })

  it('diffRolesAgainstBuiltin records only dirty fields and custom ids', () => {
    const edited = mergeRoleCatalog(BUILTIN_ROLES, [
      { id: 'frontend', responsibility: 'Custom frontend' },
      { id: 'security', skill: 'ae-grill', responsibility: 'Threat model' },
    ])
    expect(diffRolesAgainstBuiltin(edited)).toEqual([
      { id: 'frontend', responsibility: 'Custom frontend' },
      { id: 'security', skill: 'ae-grill', responsibility: 'Threat model' },
    ])
    expect(diffRolesAgainstBuiltin(BUILTIN_ROLES)).toEqual([])
    expect(() => validateRolesFile({ version: 1, roles: [{ id: 'Bad_Id' }] })).toThrow(RoleOverlayValidationError)
  })

  it.each([
    ['corrupt JSON', '{broken'],
    ['unsupported version', '{"version":2,"roles":[]}'],
    ['invalid root', 'null'],
    ['missing roles', '{"version":1}'],
    ['invalid sibling', '{"version":1,"roles":[{"id":"frontend","responsibility":"Keep me"},{"id":"lead"}]}'],
    ['duplicate identities', '{"version":1,"roles":[{"id":"frontend"},{"id":"frontend"}]}'],
  ])('refuses editing %s without changing the original document', async (_name, text) => {
    const directory = await mkdtemp(join(tmpdir(), 'ae-roles-read-'))
    const path = join(directory, 'roles.json')
    try {
      await writeFile(path, text, 'utf8')
      await expect(readOverlayDocument(path)).rejects.toBeInstanceOf(RoleOverlayValidationError)
      expect(await readFile(path, 'utf8')).toBe(text)
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })

  it.each(['EIO', 'EACCES'])('propagates %s for editing while the policy resolver still falls back', async code => {
    const directory = await mkdtemp(join(tmpdir(), 'ae-roles-read-io-'))
    const path = join(directory, 'roles.json')
    const document = { version: 1, roles: [{ id: 'frontend', responsibility: 'Preserved custom brief' }] }
    const text = JSON.stringify(document)
    try {
      await writeFile(path, text, 'utf8')
      const failure = Object.assign(new Error(`Synthetic ${code}`), { code })
      vi.mocked(readFile).mockRejectedValueOnce(failure)
      await expect(readOverlayDocument(path)).rejects.toBe(failure)
      expect(await readFile(path, 'utf8')).toBe(text)
      vi.mocked(readFile).mockRejectedValueOnce(failure)
      await expect(resolveRoleCatalog({ enabled: true, path })).resolves.toMatchObject({ source: 'builtin', roles: BUILTIN_ROLES })
      await expect(readOverlayDocument(path)).resolves.toEqual(document)
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })
})
