import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from '@deepseek-ai/cordis'
import type { AgentHandle, CreateAgentOptions } from '@deepseek-ai/dsh-agent'
import { Session, SessionId, SessionLogOffset, type SessionHeader } from '@deepseek-ai/dsh-session'
import { remoteErrorOf } from '@deepseek-ai/dsh-typert-protocol'
import { describe, expect, it, vi } from 'vitest'
import { ConversationDeletion } from '../src/conversation-deletion.ts'

function deferred() {
  let resolve!: () => void
  const promise = new Promise<void>(done => { resolve = done })
  return { promise, resolve }
}

function header(id: string, meta: Partial<SessionHeader> = {}): SessionHeader {
  return { version: 4, id: SessionId(id), createdAt: 1, isSeeded: false, ...meta }
}

/** Synthetic factory/persistence boundaries; all artifacts live under one disposable temp root. */
async function withFixture(run: (fixture: Awaited<ReturnType<typeof createFixture>>) => Promise<void>) {
  const root = await mkdtemp(join(tmpdir(), 'ae-conversation-deletion-'))
  let fixture: Awaited<ReturnType<typeof createFixture>> | undefined
  try {
    fixture = await createFixture(root)
    await run(fixture)
  } finally {
    try { await fixture?.close() } finally { await rm(root, { recursive: true, force: true }) }
  }
}

async function createFixture(root: string) {
  const ctx = new Context()
  const persisted = new Map<SessionId, SessionHeader>()
  const handles = new Map<SessionId, AgentHandle>()
  const hooks: {
    persist?: (header: SessionHeader) => Promise<void>
    dispose?: (id: SessionId) => Promise<void>
  } = {}
  const artifact = (id: SessionId) => join(root, '_no-cwd', id, 'events.jsonl')
  const rawPut = vi.fn(async (_id: SessionId, _value: unknown) => {})
  const cache = { put: rawPut, delete: vi.fn(async () => {}) }
  const persistence = {
    name: 'session-persistence-jsonl', config: { root },
    create: vi.fn(async (value: SessionHeader) => {
      await hooks.persist?.(value)
      await mkdir(join(root, '_no-cwd', value.id), { recursive: true })
      await writeFile(artifact(value.id), `Synthetic history for ${value.id}`)
      persisted.set(value.id, value)
    }),
    open: vi.fn(async () => ({ close: vi.fn(async () => {}) })),
    stat: vi.fn(async (id: SessionId) => persisted.has(id) ? { header: persisted.get(id)! } : undefined),
    list: vi.fn(async () => [...persisted.values()].map(value => ({ header: value }))),
  }
  const makeHandle = (value: SessionHeader): AgentHandle => {
    const session = Session.create(value.id, [], value, value.isSeeded ? SessionLogOffset(0) : undefined)
    const agent = { id: value.id, session, status: 'idle', cancel: vi.fn() } as unknown as AgentHandle['agent']
    const handle: AgentHandle = {
      agent,
      dispose: vi.fn(async () => {
        await hooks.dispose?.(value.id)
        handles.delete(value.id)
        ctx.emit('agent/disposed', { agent })
      }),
    }
    return handle
  }
  const publish = (handle: AgentHandle) => {
    ctx.emit('session/created', handle.agent.session)
    handles.set(handle.agent.id, handle)
  }
  const agents = {
    create: vi.fn(async (options: CreateAgentOptions) => {
      const handle = makeHandle(header(options.sessionId, options.meta))
      // Announcement can precede an awaited persistence listener. The plugin
      // must drain both this creation and any subsequent handle rollback.
      ctx.emit('session/created', handle.agent.session)
      await persistence.create(handle.agent.session.header)
      handles.set(handle.agent.id, handle)
      return handle
    }),
    resume: vi.fn(async ({ resumeSessionId }: { resumeSessionId: SessionId }) => {
      const value = persisted.get(resumeSessionId)
      if (!value) throw new Error('Unknown synthetic session')
      const handle = makeHandle(value)
      publish(handle)
      return handle
    }),
    get: vi.fn((id: SessionId) => handles.get(id)?.agent),
  }
  Object.assign(ctx, {
    typert: { register: vi.fn() }, agents, sessionPersistence: persistence,
    sessions: {
      list: () => [...handles.values()].map(handle => handle.agent.session),
      get: (id: SessionId) => handles.get(id)?.agent.session,
    },
    sessionQuery: { searchSessions: vi.fn(async () => ({ items: [] })) },
    storageDomain: { get: () => ({ table: () => cache }) },
    workspaceRegistry: { list: () => [], unarchiveSession: vi.fn(), unpinSession: vi.fn() },
    remoteAccess: { allows: () => true },
    invocation: { peer: { principal: { kind: 'owner' } } },
  })
  const raw = { create: agents.create, resume: agents.resume, open: persistence.open }
  const service = new ConversationDeletion(ctx, { enabled: () => true })
  await (service as unknown as { ready: Promise<void> }).ready
  return {
    ctx, root, service, raw, persisted, hooks, artifact, cache,
    journals: () => readdir(join(root, '.ai-agent-engine', 'deletions')),
    // Observe the public projection-write guard to establish that deletion
    // entered its pending phase. The held factory gates keep that phase stable.
    async pending(id: SessionId) {
      await vi.waitFor(async () => {
        const writes = rawPut.mock.calls.length
        await cache.put(id, {})
        expect(rawPut).toHaveBeenCalledTimes(writes)
      })
    },
    async close() {
      await ctx.fiber.dispose()
      hooks.dispose = undefined
      await Promise.all([...handles.values()].map(handle => handle.dispose()))
    },
  }
}

describe('conversation deletion lifecycle', () => {
  it('collects only owned descendants and keeps independent forks resumable while the parent is pending or deleted', async () => {
    await withFixture(async fixture => {
      const { ctx, service, artifact, raw } = fixture
      const root = await ctx.agents.create({ sessionId: SessionId('root') })
      const child = await ctx.agents.create({
        sessionId: SessionId('child'), meta: { parentSession: root.agent.id, origin: 'subagent' },
      })
      const grandchild = await ctx.agents.create({
        sessionId: SessionId('grandchild'), meta: { parentSession: child.agent.id, origin: 'subagent' },
      })
      const fork = await ctx.agents.create({
        sessionId: SessionId('fork'), meta: { parentSession: root.agent.id, isSeeded: true },
      })
      const forkChild = await ctx.agents.create({
        sessionId: SessionId('fork-child'), meta: { parentSession: fork.agent.id, origin: 'subagent' },
      })
      await fork.dispose()
      const preview = await service.deletePreview({ sessionId: root.agent.id })
      expect(preview.sessionIds).toEqual([child.agent.id, grandchild.agent.id, root.agent.id])
      const stopped = deferred()
      const release = deferred()
      ctx.on('workspace/session-stop', async ({ sessionId }) => {
        if (sessionId === root.agent.id) { stopped.resolve(); await release.promise }
      })
      const deletion = service.delete({ ...preview, stopRunning: true })
      try {
        await stopped.promise
        const resumed = await ctx.agents.resume({ resumeSessionId: fork.agent.id })
        expect(resumed.agent.session.header.parentSession).toBe(root.agent.id)
        await resumed.dispose()
        const lateFork = await ctx.agents.create({
          sessionId: SessionId('late-fork'), meta: { parentSession: root.agent.id, isSeeded: true },
        })
        expect(lateFork.agent.id).toBe('late-fork')
        const owned = header('late-child', { parentSession: root.agent.id, origin: 'subagent' })
        await expect(ctx.agents.create({ sessionId: owned.id, meta: owned })).rejects.toThrow('deleted')
        await expect(ctx.sessionPersistence.create(owned)).rejects.toThrow('deleted')
        expect(() => ctx.emit('session/created', Session.create(owned.id, [], owned))).toThrow('deleted')
      } finally { release.resolve(); await deletion }
      for (const id of preview.sessionIds) await expect(readFile(artifact(id))).rejects.toMatchObject({ code: 'ENOENT' })
      for (const id of [fork.agent.id, forkChild.agent.id, SessionId('late-fork')]) {
        await expect(readFile(artifact(id), 'utf8')).resolves.toContain('Synthetic history')
      }
      const resumed = await ctx.agents.resume({ resumeSessionId: fork.agent.id })
      expect(resumed.agent.session.header.origin).toBeUndefined()
      const nextFork = header('next-fork', { parentSession: root.agent.id, isSeeded: true })
      await expect(ctx.sessionPersistence.create(nextFork)).resolves.toBeUndefined()
      const next = await ctx.agents.create({
        sessionId: SessionId('created-after-delete'), meta: { parentSession: root.agent.id, isSeeded: true },
      })
      expect(next.agent.id).toBe('created-after-delete')
      const owned = header('deleted-parent-child', { parentSession: root.agent.id, origin: 'subagent' })
      await expect(ctx.agents.create({ sessionId: owned.id, meta: owned })).rejects.toThrow('deleted')
      await expect(ctx.sessionPersistence.create(owned)).rejects.toThrow('deleted')
      expect(() => ctx.emit('session/created', Session.create(owned.id, [], owned))).toThrow('deleted')
      await expect(ctx.agents.resume({ resumeSessionId: root.agent.id })).rejects.toThrow('deleted')
      await expect(ctx.sessionPersistence.open(root.agent.id, 'write')).rejects.toThrow('deleted')
      expect(raw.open).not.toHaveBeenCalledWith(fork.agent.id, 'write')
      // Independence from the original parent does not bypass the fork's own tombstone.
      const forkPreview = await service.deletePreview({ sessionId: fork.agent.id })
      expect(forkPreview.sessionIds).toEqual([fork.agent.id, forkChild.agent.id])
      await service.delete({ ...forkPreview, stopRunning: true })
      await expect(ctx.agents.resume({ resumeSessionId: fork.agent.id })).rejects.toThrow('deleted')
    })
  })

  it('does not drain an independent fork with its source conversation and accepts its late handle', async () => {
    await withFixture(async fixture => {
      const { ctx, service, hooks } = fixture
      const root = await ctx.agents.create({ sessionId: SessionId('root') })
      const preview = await service.deletePreview({ sessionId: root.agent.id })
      const entered = deferred()
      const materialize = deferred()
      const forkId = SessionId('inflight-independent-fork')
      hooks.persist = async value => {
        if (value.id === forkId) { entered.resolve(); await materialize.promise }
      }
      const creation = ctx.agents.create({ sessionId: forkId, meta: { parentSession: root.agent.id, isSeeded: true } })
      const creationOutcome = creation.then(handle => handle, error => error)
      await entered.promise
      const deletion = service.delete({ ...preview, stopRunning: true })
      try {
        await vi.waitFor(() => expect(root.agent.cancel).toHaveBeenCalledOnce())
        await deletion
        materialize.resolve()
        const fork = await creation
        expect(fork.agent.session.header.parentSession).toBe(root.agent.id)
        expect(ctx.agents.get(forkId)).toBe(fork.agent)
        expect(fork.dispose).not.toHaveBeenCalled()
        await expect(readFile(fixture.artifact(forkId), 'utf8')).resolves.toContain('Synthetic history')
      } finally {
        materialize.resolve()
        await Promise.allSettled([creationOutcome, deletion])
      }
    })
  })

  it('rechecks scope after draining materialization and the rejected child handle disposal', async () => {
    await withFixture(async fixture => {
      const { ctx, service, hooks } = fixture
      const root = await ctx.agents.create({ sessionId: SessionId('root') })
      const preview = await service.deletePreview({ sessionId: root.agent.id })
      const entered = deferred()
      const materialize = deferred()
      const disposing = deferred()
      const disposed = deferred()
      const childId = SessionId('late-child')
      hooks.persist = async value => {
        if (value.id === childId) { entered.resolve(); await materialize.promise }
      }
      hooks.dispose = async id => {
        if (id === childId) { disposing.resolve(); await disposed.promise }
      }
      const creation = ctx.agents.create({ sessionId: childId, meta: { parentSession: root.agent.id, origin: 'subagent' } })
      const creationOutcome = creation.then(() => undefined, error => error)
      await entered.promise
      const deletion = service.delete({ ...preview, stopRunning: true })
      let settled = false
      const deletionOutcome = deletion.then(() => { settled = true }, error => { settled = true; return error })
      try {
        await fixture.pending(root.agent.id)
        materialize.resolve()
        await disposing.promise
        await new Promise<void>(resolve => setImmediate(resolve))
        expect(settled).toBe(false)
        // A durable child appeared after confirmation. Its rollback must finish
        // before the root can be stopped, locked, or journaled.
        expect(root.agent.cancel).not.toHaveBeenCalled()
        expect(fixture.raw.open).not.toHaveBeenCalled()
        expect(await fixture.journals()).toEqual([])
        disposed.resolve()
        expect(remoteErrorOf(await creationOutcome)?.code).toBe('ae-conversations/delete-rejected')
        expect(remoteErrorOf(await deletionOutcome)?.code).toBe('ae-conversations/delete-scope-changed')
        expect(ctx.agents.get(root.agent.id)).toBe(root.agent)
        expect(ctx.agents.get(childId)).toBeUndefined()
        await expect(readFile(fixture.artifact(root.agent.id), 'utf8')).resolves.toContain('Synthetic history')
        await expect(readFile(fixture.artifact(childId), 'utf8')).resolves.toContain('Synthetic history')
        expect(await fixture.journals()).toEqual([])
        const updated = await service.deletePreview({ sessionId: root.agent.id })
        expect(updated.sessionIds).toEqual([childId, root.agent.id])
        await service.delete({ ...updated, stopRunning: true })
        for (const id of updated.sessionIds) await expect(readFile(fixture.artifact(id))).rejects.toMatchObject({ code: 'ENOENT' })
      } finally {
        materialize.resolve(); disposed.resolve()
        await Promise.all([creationOutcome, deletionOutcome])
      }
    })
  })

  it('keeps adapters active until an awaited unload drains the accepted deletion', async () => {
    await withFixture(async fixture => {
      const { ctx, service, raw } = fixture
      const root = await ctx.agents.create({ sessionId: SessionId('root') })
      const preview = await service.deletePreview({ sessionId: root.agent.id })
      const reached = deferred()
      const release = deferred()
      ctx.on('workspace/session-stop', async ({ sessionId }) => {
        if (sessionId !== root.agent.id) return
        reached.resolve()
        await release.promise
      })
      const adaptedCreate = ctx.agents.create
      const adaptedOpen = ctx.sessionPersistence.open
      const deletion = service.delete({ ...preview, stopRunning: true })
      let unloading: Promise<void> | undefined
      let unloaded = false
      try {
        await reached.promise
        unloading = Promise.resolve(ctx.fiber.dispose()).then(() => { unloaded = true })
        await new Promise<void>(resolve => setImmediate(resolve))
        expect(unloaded).toBe(false)
        expect(ctx.agents.create).toBe(adaptedCreate)
        expect(ctx.sessionPersistence.open).toBe(adaptedOpen)
        expect(raw.open).not.toHaveBeenCalled()
        expect(await fixture.journals()).toEqual([])

        // A Loader that awaits disposal cannot complete until this independent
        // stop barrier is released. Observe the pending unload before joining it.
        release.resolve()
        await expect(deletion).resolves.toEqual(preview.sessionIds)
        await unloading
        expect(unloaded).toBe(true)
        expect(ctx.agents.create).toBe(raw.create)
        expect(ctx.sessionPersistence.open).toBe(raw.open)
        await expect(readFile(fixture.artifact(root.agent.id))).rejects.toMatchObject({ code: 'ENOENT' })
        const journals = await fixture.journals()
        expect(journals).toHaveLength(1)
        const journal = JSON.parse(await readFile(join(fixture.root, '.ai-agent-engine', 'deletions', journals[0]!), 'utf8'))
        expect(journal).toMatchObject({ complete: true, rootId: root.agent.id })
      } finally {
        release.resolve()
        await Promise.allSettled([deletion, unloading])
      }
    })
  })

  it('guards a resumed subagent by its durable parent even without a live parentAgent', async () => {
    await withFixture(async fixture => {
      const { ctx, service, persisted, raw } = fixture
      const root = await ctx.agents.create({ sessionId: SessionId('root') })
      const preview = await service.deletePreview({ sessionId: root.agent.id })
      await service.delete({ ...preview, stopRunning: true })
      const owned = header('unlisted-child', { parentSession: root.agent.id, origin: 'subagent' })
      persisted.set(owned.id, owned)
      await expect(ctx.agents.resume({ resumeSessionId: owned.id })).rejects.toThrow('deleted')
      expect(ctx.agents.get(owned.id)).toBeUndefined()
      // Exercise the post-factory check as well: an already announced handle
      // can finish asynchronous setup after its parent enters deletion.
      const rawHandle = {
        agent: { id: owned.id, session: Session.create(owned.id, [], owned) },
        dispose: vi.fn(async () => {}),
      } as unknown as AgentHandle
      raw.resume.mockResolvedValueOnce(rawHandle)
      await expect(ctx.agents.resume({ resumeSessionId: owned.id })).rejects.toThrow('deleted')
      expect(rawHandle.dispose).toHaveBeenCalledOnce()
    })
  })
})
