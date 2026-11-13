import { createHash } from 'node:crypto'
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { DatabaseSync } from 'node:sqlite'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import { remoteErrorOf } from '@deepseek-ai/dsh-typert-protocol'
import {
  ConversationDeletion,
  loadDeletionJournalFile,
  supportsConversationDeletionPersistence,
} from '../src/conversation-deletion.ts'
import type { SessionId } from '@deepseek-ai/dsh-session'

vi.mock('node:fs/promises', async importOriginal => {
  const original = await importOriginal<typeof import('node:fs/promises')>()
  return { ...original, readFile: vi.fn(original.readFile) }
})

function fingerprint(headers: readonly { id: string; createdAt: number; cwd?: string; parentSession?: string; origin?: string }[]): string {
  return createHash('sha256').update(JSON.stringify(headers.map(header =>
    [header.id, header.createdAt, header.cwd, header.parentSession, header.origin]))).digest('hex')
}

describe('conversation deletion startup isolation', () => {
  it('refuses an unknown index before journal recovery, wrappers, or session writes', async () => {
    const root = await mkdtemp(join(tmpdir(), 'ae-deletion-index-'))
    const path = join(root, 'foreign.sqlite')
    const db = new DatabaseSync(path)
    db.exec('CREATE TABLE preserved (id INTEGER); INSERT INTO preserved VALUES (1)')
    const ctx = new Context()
    const create = vi.fn()
    const onUnsupported = vi.fn()
    Object.assign(ctx, {
      typert: { register: vi.fn() },
      sessionPersistence: {
        name: 'session-persistence-jsonl', config: { root },
        create: vi.fn(), open: vi.fn(), stat: vi.fn(), list: vi.fn(),
      },
      agents: { create, resume: vi.fn(), get: vi.fn() },
      sessions: { list: vi.fn(), get: vi.fn() },
      sessionQuery: { searchSessions: vi.fn(), config: { path } },
      storageDomain: { get: vi.fn() },
      workspaceRegistry: { list: vi.fn(() => []), unarchiveSession: vi.fn(), unpinSession: vi.fn() },
      remoteAccess: { allows: vi.fn() },
    })
    try {
      const service = new ConversationDeletion(ctx, { enabled: () => true, onUnsupported })
      await expect((service as unknown as { ready: Promise<void> }).ready).rejects.toThrow('not a recognized')
      expect(ctx.agents.create).toBe(create)
      expect(ctx.sessionPersistence.create).not.toHaveBeenCalled()
      expect(ctx.sessionPersistence.open).not.toHaveBeenCalled()
      expect(onUnsupported).toHaveBeenCalledOnce()
      expect(await readdir(root)).toEqual(['foreign.sqlite'])
      expect(db.prepare('SELECT id FROM preserved').all()).toEqual([{ id: 1 }])
    } finally {
      db.close()
      await ctx.fiber.dispose()
      await rm(root, { recursive: true, force: true })
    }
  })
  it('rejects missing methods before creating journals or wrapping agents', async () => {
    const root = await mkdtemp(join(tmpdir(), 'ae-deletion-preflight-'))
    const ctx = new Context()
    const create = vi.fn()
    Object.assign(ctx, {
      typert: { register: vi.fn() },
      sessionPersistence: { name: 'session-persistence-jsonl', config: { root } },
      agents: { create, resume: vi.fn(), get: vi.fn() },
      sessions: { list: vi.fn(), get: vi.fn() },
    })
    try {
      const service = new ConversationDeletion(ctx as never, { enabled: () => true })
      await expect((service as unknown as { ready: Promise<void> }).ready).rejects.toThrow('sessionPersistence.create')
      expect(ctx.agents.create).toBe(create)
      expect(await readdir(root)).toEqual([])
    } finally {
      await ctx.fiber.dispose()
      await rm(root, { recursive: true, force: true })
    }
  })
  it('recognizes only jsonl persistence with a configured root', () => {
    expect(supportsConversationDeletionPersistence({
      name: 'session-persistence-jsonl', config: { root: '/tmp/sessions' },
    })).toBe(true)
    expect(supportsConversationDeletionPersistence({ name: 'session-persistence-sqlite', config: { root: '/tmp' } })).toBe(false)
    expect(supportsConversationDeletionPersistence({ name: 'session-persistence-jsonl', config: {} })).toBe(false)
  })

  it('quarantines a corrupt journal and still loads a valid sibling', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'ae-deletion-journal-'))
    const logs: unknown[][] = []
    try {
      const headers = [{ id: 'root' as SessionId, createdAt: 1 }]
      const key = fingerprint(headers)
      const valid = {
        version: 1 as const,
        rootId: 'root' as SessionId,
        fingerprint: key,
        headers,
        complete: true,
      }
      await writeFile(join(directory, `${key}.json`), JSON.stringify(valid), 'utf8')
      const badName = `${'a'.repeat(64)}.json`
      await writeFile(join(directory, badName), '{not-json', 'utf8')

      const loaded = await loadDeletionJournalFile(directory, `${key}.json`, (...args) => logs.push(args))
      const quarantined = await loadDeletionJournalFile(directory, badName, (...args) => logs.push(args))

      expect(loaded).toEqual(valid)
      expect(quarantined).toBeUndefined()
      expect(logs.some(entry => String(entry[0]).includes('Quarantined corrupt'))).toBe(true)
      const names = await readdir(directory)
      expect(names).toContain(`${key}.json`)
      expect(names).toContain(`${badName}.corrupt`)
      expect(names).not.toContain(badName)
      await expect(readFile(join(directory, `${badName}.corrupt`), 'utf8')).resolves.toBe('{not-json')
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })

  it.each(['EACCES', 'EIO', 'ENOENT'])('preserves a journal after %s and loads its tombstones on retry', async code => {
    const directory = await mkdtemp(join(tmpdir(), 'ae-deletion-read-error-'))
    const logs = vi.fn()
    try {
      const headers = [{ id: 'deleted-root' as SessionId, createdAt: 1 }]
      const key = fingerprint(headers)
      const record = { version: 1, rootId: headers[0]!.id, fingerprint: key, headers, complete: true }
      const filename = `${key}.json`
      const text = JSON.stringify(record)
      await writeFile(join(directory, filename), text, 'utf8')
      const failure = Object.assign(new Error(`Synthetic journal read failure: ${code}`), { code })
      vi.mocked(readFile).mockRejectedValueOnce(failure)

      await expect(loadDeletionJournalFile(directory, filename, logs)).rejects.toBe(failure)
      expect(await readdir(directory)).toEqual([filename])
      expect(await readFile(join(directory, filename), 'utf8')).toBe(text)
      expect(logs.mock.calls.some(call => String(call[0]).includes('Failed to read'))).toBe(true)
      await expect(loadDeletionJournalFile(directory, filename, logs)).resolves.toEqual(record)
    } finally {
      vi.mocked(readFile).mockReset().mockImplementation((await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises')).readFile)
      await rm(directory, { recursive: true, force: true })
    }
  })

  it('fails initialization on a journal read error and restores deletion guards after a clean reload', async () => {
    const root = await mkdtemp(join(tmpdir(), 'ae-deletion-reload-'))
    const directory = join(root, '.ai-agent-engine', 'deletions')
    const contexts: Context[] = []
    const onUnsupported = vi.fn()
    const createContext = () => {
      const ctx = new Context()
      contexts.push(ctx)
      Object.assign(ctx, {
        typert: { register: vi.fn() },
        sessionPersistence: {
          name: 'session-persistence-jsonl', config: { root },
          create: vi.fn(), open: vi.fn(), stat: vi.fn(), list: vi.fn(async () => []),
        },
        agents: { create: vi.fn(), resume: vi.fn(), get: vi.fn() },
        sessions: { list: vi.fn(() => []), get: vi.fn() },
        sessionQuery: { searchSessions: vi.fn() },
        storageDomain: { get: vi.fn() },
        workspaceRegistry: { list: vi.fn(() => []), unarchiveSession: vi.fn(), unpinSession: vi.fn() },
        remoteAccess: { allows: vi.fn() },
        logger: Object.assign(vi.fn(), { warn: vi.fn(), info: vi.fn(), error: vi.fn(), debug: vi.fn() }),
      })
      return ctx
    }
    try {
      await mkdir(directory, { recursive: true })
      const id = 'deleted-root' as SessionId
      const headers = [{ id, createdAt: 1 }]
      const key = fingerprint(headers)
      const filename = `${key}.json`
      await writeFile(join(directory, filename), JSON.stringify({
        version: 1, rootId: id, fingerprint: key, headers, complete: true,
      }))
      const failed = createContext()
      const originalResume = failed.agents.resume
      const originalOpen = failed.sessionPersistence.open
      const failure = Object.assign(new Error('Synthetic unavailable journal'), { code: 'EIO' })
      vi.mocked(readFile).mockRejectedValueOnce(failure)
      const service = new ConversationDeletion(failed, { enabled: () => true, onUnsupported })
      await expect((service as unknown as { ready: Promise<void> }).ready).rejects.toBe(failure)
      expect(onUnsupported).toHaveBeenCalledOnce()
      expect(originalOpen).not.toHaveBeenCalled()
      expect(await readdir(directory)).toEqual([filename])
      // Module isolation disposes the failed scope and restores the Host APIs.
      // While unavailable, this plugin cannot enforce unreadable tombstones.
      await failed.fiber.dispose()
      expect(failed.agents.resume).toBe(originalResume)

      const reloaded = createContext()
      const restored = new ConversationDeletion(reloaded, { enabled: () => true })
      await (restored as unknown as { ready: Promise<void> }).ready
      await expect(reloaded.agents.resume({ resumeSessionId: id })).rejects.toThrow('deleted')
      await expect(reloaded.sessionPersistence.open(id, 'read')).rejects.toThrow('deleted')
      await expect(reloaded.sessionPersistence.stat(id)).resolves.toBeUndefined()
      expect(await readdir(directory)).toEqual([filename])
    } finally {
      await Promise.all(contexts.map(ctx => ctx.fiber.dispose()))
      await rm(root, { recursive: true, force: true })
    }
  })

  it('starts on a non-jsonl mock and returns delete-unsupported without crashing', async () => {
    const ctx = new Context()
    const warn = vi.fn()
    Object.assign(ctx, {
      typert: { register: vi.fn() },
      sessionPersistence: { name: 'session-persistence-memory', config: { root: 'unused' } },
      logger: Object.assign(vi.fn(), { warn, info: vi.fn(), error: vi.fn(), debug: vi.fn() }),
    })
    const service = new ConversationDeletion(ctx as never, { enabled: () => true })
    await expect((service as unknown as { ready: Promise<void> }).ready).resolves.toBeUndefined()
    expect(warn).toHaveBeenCalled()

    await expect(service.deletePreview({ sessionId: 'root' as SessionId })).rejects.toSatisfy((error: unknown) => {
      const remote = remoteErrorOf(error)
      return remote?.code === 'ae-conversations/delete-unsupported'
    })
    await expect(service.delete({
      sessionId: 'root' as SessionId,
      sessionIds: ['root' as SessionId],
      fingerprint: '0'.repeat(64),
      runningSessionIds: [],
      stopRunning: true,
    })).rejects.toSatisfy((error: unknown) => {
      const remote = remoteErrorOf(error)
      return remote?.code === 'ae-conversations/delete-unsupported'
    })
  })

  it('completes initialize when the deletions directory contains only a corrupt journal', async () => {
    const root = await mkdtemp(join(tmpdir(), 'ae-deletion-root-'))
    const ctx = new Context()
    try {
      const directory = join(root, '.ai-agent-engine', 'deletions')
      await mkdir(directory, { recursive: true })
      const badName = `${'b'.repeat(64)}.json`
      await writeFile(join(directory, badName), '{"version":1}', 'utf8')
      const warn = vi.fn()
      Object.assign(ctx, {
        typert: { register: vi.fn() },
        sessionPersistence: {
          name: 'session-persistence-jsonl',
          config: { root },
          create: vi.fn(),
          open: vi.fn(),
          stat: vi.fn(),
          list: vi.fn(async () => []),
        },
        agents: { create: vi.fn(), resume: vi.fn(), get: vi.fn() },
        sessions: { list: vi.fn(() => []), get: vi.fn() },
        sessionQuery: { searchSessions: vi.fn() },
        workspaceRegistry: { list: vi.fn(() => []), unarchiveSession: vi.fn(), unpinSession: vi.fn() },
        remoteAccess: { allows: vi.fn() },
        storageDomain: { get: vi.fn(() => undefined) },
        logger: Object.assign(vi.fn(), { warn, info: vi.fn(), error: vi.fn(), debug: vi.fn() }),
      })
      const service = new ConversationDeletion(ctx as never, { enabled: () => true })
      await expect((service as unknown as { ready: Promise<void> }).ready).resolves.toBeUndefined()
      const names = await readdir(directory)
      expect(names).toContain(`${badName}.corrupt`)
      expect(names).not.toContain(badName)
      expect(warn.mock.calls.some(call => String(call[0]).includes('Quarantined corrupt'))).toBe(true)
    } finally {
      await ctx.fiber.dispose()
      await rm(root, { recursive: true, force: true })
    }
  })
})
