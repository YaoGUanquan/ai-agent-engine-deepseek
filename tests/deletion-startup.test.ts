import { createHash } from 'node:crypto'
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
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

function fingerprint(headers: readonly { id: string; createdAt: number; cwd?: string; parentSession?: string; origin?: string }[]): string {
  return createHash('sha256').update(JSON.stringify(headers.map(header =>
    [header.id, header.createdAt, header.cwd, header.parentSession, header.origin]))).digest('hex')
}

describe('conversation deletion startup isolation', () => {
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
    const directory = join(root, '.ai-agent-engine', 'deletions')
    await mkdir(directory, { recursive: true })
    const badName = `${'b'.repeat(64)}.json`
    await writeFile(join(directory, badName), '{"version":1}', 'utf8')
    const warn = vi.fn()
    const ctx = new Context()
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
      agents: { create: vi.fn(), resume: vi.fn() },
      sessions: { list: vi.fn(() => []) },
      storageDomain: { get: vi.fn(() => undefined) },
      logger: Object.assign(vi.fn(), { warn, info: vi.fn(), error: vi.fn(), debug: vi.fn() }),
      effect: vi.fn(() => () => {}),
      on: vi.fn(),
    })
    const service = new ConversationDeletion(ctx as never, { enabled: () => true })
    await expect((service as unknown as { ready: Promise<void> }).ready).resolves.toBeUndefined()
    const names = await readdir(directory)
    expect(names).toContain(`${badName}.corrupt`)
    expect(names).not.toContain(badName)
    expect(warn.mock.calls.some(call => String(call[0]).includes('Quarantined corrupt'))).toBe(true)
    await rm(root, { recursive: true, force: true })
  })
})
