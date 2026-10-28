import { createHash, randomUUID } from 'node:crypto'
import { mkdir, readFile, readdir, realpath, rename, rm, writeFile } from 'node:fs/promises'
import { isAbsolute, join, relative, resolve, sep } from 'node:path'
import { Service, type Context } from '@deepseek-ai/cordis'
import type { AgentHandle, CreateAgentOptions, ResumeAgentOptions } from '@deepseek-ai/dsh-agent'
import type { SessionHeader, SessionId } from '@deepseek-ai/dsh-session'
import type { SessionHandle, SessionPersistence } from '@deepseek-ai/dsh-session-persistence'
import type {} from '@deepseek-ai/dsh-api-remote-access'
import type {} from '@deepseek-ai/dsh-storage-domain'
import type {} from '@deepseek-ai/dsh-workspace'
import type {} from '@deepseek-ai/dsh-session-query'
import type {} from '@deepseek-ai/dsh-typert-registry'
import type {} from '@deepseek-ai/dsh-api-session-controller'
import { Remote, RemoteError, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import { deletionRpc } from './deletion-rpc.ts'
import { wrapMethod } from './runtime-method.ts'
import type { SessionDeletionPreview, SessionDeletionRequest } from './deletion-contract.ts'
import { clearDisabledSearchIndex } from './disabled-search-index.ts'

interface DeletionRecord {
  version: 1
  rootId: SessionId
  fingerprint: string
  headers: SessionHeader[]
  complete: boolean
}

declare module '@deepseek-ai/cordis' {
  interface Context { aeConversations: ConversationDeletion }
}

type DeletionError = 'ae-conversations/delete-rejected' | 'ae-conversations/delete-unsupported'
  | 'ae-conversations/delete-scope-changed' | 'ae-conversations/delete-restart-required'

declare module '@deepseek-ai/dsh-typert-protocol' {
  interface RemoteErrorDetailsMap {
    'ae-conversations/delete-rejected': {}
    'ae-conversations/delete-unsupported': {}
    'ae-conversations/delete-scope-changed': {}
    'ae-conversations/delete-restart-required': {}
  }
}

function reject(message: string, code: DeletionError = 'ae-conversations/delete-rejected'): never {
  throw new RemoteError(code, message, {})
}

// Same UTF-16 path encoding and project grouping as the rc.3 JSONL provider.
function encodeSegment(text: string): string {
  if (text === '.' || text === '..') return text.replaceAll('.', '~002E')
  return text.replace(/[^A-Za-z0-9._-]/g, character =>
    `~${character.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`)
}

function sessionDirectory(root: string, header: SessionHeader): string {
  const project = header.cwd === undefined ? '_no-cwd'
    : `--${(encodeSegment(header.cwd.replace(/[\\/:]+/g, '-')).replace(/^-+/, '') || 'root').slice(0, 251)}--`
  return join(root, project, encodeSegment(header.id))
}

function fingerprint(headers: readonly SessionHeader[]): string {
  return createHash('sha256').update(JSON.stringify(headers.map(header =>
    [header.id, header.createdAt, header.cwd, header.parentSession, header.origin]))).digest('hex')
}


/** Whether the active session persistence can host conversation-deletion journals. */
export function supportsConversationDeletionPersistence(
  persistence: { name: string; config?: { root?: string } },
): boolean {
  return persistence.name === 'session-persistence-jsonl' && typeof persistence.config?.root === 'string'
}

function isValidDeletionRecord(record: DeletionRecord, filename: string): boolean {
  return record.version === 1 && record.fingerprint === filename.slice(0, -5)
    && typeof record.rootId === 'string' && typeof record.complete === 'boolean'
    && Array.isArray(record.headers) && record.headers.length > 0
    && record.headers.every(header => header && typeof header.id === 'string' && header.id.length > 0
      && typeof header.createdAt === 'number' && (header.cwd === undefined || typeof header.cwd === 'string'))
    && record.headers.some(header => header.id === record.rootId)
    && fingerprint(record.headers) === record.fingerprint
}

/**
 * Read one deletion journal. Corrupt or invalid files are renamed with a
 * `.corrupt` suffix and skipped so plugin init can continue.
 */
export async function loadDeletionJournalFile(
  directory: string,
  filename: string,
  log: (format: string, ...args: unknown[]) => void,
): Promise<DeletionRecord | undefined> {
  if (!/^[a-f0-9]{64}\.json$/.test(filename)) return undefined
  const path = join(directory, filename)
  try {
    const record = JSON.parse(await readFile(path, 'utf8')) as DeletionRecord
    if (!isValidDeletionRecord(record, filename)) throw new Error('Invalid conversation deletion record')
    return record
  } catch (error) {
    const quarantine = `${path}.corrupt`
    try {
      await rename(path, quarantine)
      log('Quarantined corrupt conversation deletion journal %s -> %s (%s)', filename, quarantine, error)
    } catch (renameError) {
      log('Failed to quarantine corrupt conversation deletion journal %s (%s); original error: %s', filename, renameError, error)
    }
    return undefined
  }
}

/** Plugin-owned lifecycle and storage adapter; never changes installed host files. */
export class ConversationDeletion extends TypertRemoteService {
  static inject = ['agents', 'sessions', 'sessionPersistence', 'sessionQuery', 'storageDomain', 'workspaceRegistry', 'typert', 'remoteAccess']
  private readonly handles = new Map<SessionId, AgentHandle>()
  private readonly inflight = new Map<Promise<unknown>, { id: SessionId; parent?: SessionId }>()
  private readonly pending = new Set<SessionId>()
  private readonly deleted = new Set<SessionId>()
  private readonly previews = new Map<string, DeletionRecord>()
  private readonly operations = new Set<string>()
  private root!: string
  private directory!: string
  private rawOpen!: SessionPersistence['open']
  private rawStat!: SessionPersistence['stat']
  private ready: Promise<void>
  private readonly active = new Set<Promise<readonly SessionId[]>>()
  private closing = false
  private unsupported = false

  constructor(ctx: Context, private readonly config: { enabled: () => boolean }) {
    super(ctx, 'aeConversations')
    ctx.typert.register({
      package: deletionRpc.package, face: 'host', schemas: [],
      model: { services: [], events: [], objects: [] }, invocations: deletionRpc.descriptors,
    })
    this.ready = this.initialize()
  }

  protected async [Service.init](): Promise<void> { await this.ready }

  private async initialize(): Promise<void> {
    const ctx = this.ctx
    const persistence = ctx.sessionPersistence as SessionPersistence & { name: string; config?: { root?: string } }
    if (!supportsConversationDeletionPersistence(persistence)) {
      this.unsupported = true
      ctx.logger.warn('Conversation deletion disabled: storage backend is not session-persistence-jsonl with a configured root')
      return
    }
    this.root = resolve(persistence.config!.root!)
    this.directory = join(this.root, '.ai-agent-engine', 'deletions')
    await mkdir(this.directory, { recursive: true, mode: 0o700 })
    const remember = async (operation: Promise<AgentHandle>, id: SessionId, parent?: SessionId): Promise<AgentHandle> => {
      this.inflight.set(operation, { id, parent })
      try {
        const handle = await operation
        if (this.blocked(handle.agent.id) || this.blocked(handle.agent.session.header.parentSession)) {
          await handle.dispose()
          reject('This conversation is being deleted')
        }
        this.handles.set(handle.agent.id, handle)
        return handle
      } finally { this.inflight.delete(operation) }
    }
    const owner = this
    const restore: (() => void)[] = []
    // Cordis starts async disposers concurrently, so drain and restoration
    // must share one disposer to keep adapters alive until cleanup finishes.
    ctx.effect(() => async () => {
      this.closing = true
      await Promise.allSettled([...this.active])
      for (const dispose of restore.reverse()) dispose()
    }, 'ai-agent-engine.deletionDrain()')
    restore.push(wrapMethod(ctx.agents, 'create', original => async function (this: typeof ctx.agents, options: CreateAgentOptions) {
      const parent = options.meta?.parentSession ?? options.parentAgent?.id
      owner.assertWritable(options.sessionId, parent)
      return remember(original.call(this, options), options.sessionId, parent)
    }))
    restore.push(wrapMethod(ctx.agents, 'resume', original => async function (this: typeof ctx.agents, options: ResumeAgentOptions) {
      owner.assertWritable(options.resumeSessionId)
      return remember(original.call(this, options), options.resumeSessionId, options.parentAgent?.id)
    }))
    restore.push(wrapMethod(persistence, 'create', original => async function (this: SessionPersistence, header, options) {
      owner.assertWritable(header.id, header.parentSession)
      return original.call(this, header, options)
    }))
    const rawPersistence = persistence
    restore.push(wrapMethod(persistence, 'open', original => {
      this.rawOpen = original.bind(rawPersistence)
      return async function (this: SessionPersistence, id, access, options) {
        if (owner.deleted.has(id) || (access === 'write' && owner.pending.has(id))) reject('Conversation was deleted')
        return original.call(this, id, access, options)
      }
    }))
    restore.push(wrapMethod(persistence, 'stat', original => {
      this.rawStat = original.bind(rawPersistence)
      return function (this: SessionPersistence, id, options) {
        return owner.deleted.has(id) ? Promise.resolve(undefined) : original.call(this, id, options)
      }
    }))
    restore.push(wrapMethod(persistence, 'list', original => async function (this: SessionPersistence, options) {
      return (await original.call(this, options)).filter(row => !owner.deleted.has(row.header.id))
    }))
    ctx.on('session/created', session => { this.assertWritable(session.id, session.header.parentSession) })
    ctx.on('agent/disposed', ({ agent }) => { this.handles.delete(agent.id) })
    const cache = ctx.storageDomain.get('session_projcache')?.table('sessions')
    if (cache) restore.push(wrapMethod(cache, 'put', original => function (this: typeof cache, id, value) {
      return owner.blocked(id as SessionId) ? Promise.resolve() : original.call(this, id, value)
    }))
    for (const filename of await readdir(this.directory)) {
      const record = await loadDeletionJournalFile(this.directory, filename, (format, ...args) => {
        ctx.logger.warn(format, ...args)
      })
      if (!record) continue
      for (const header of record.headers) this.deleted.add(header.id)
      if (!record.complete) {
        const locks: SessionHandle[] = []
        try {
          for (const header of record.headers) {
            if (await this.rawStat(header.id)) locks.push(await this.rawOpen(header.id, 'write'))
          }
          await this.cleanup(record)
        } finally { await Promise.all(locks.map(handle => handle.close())) }
      }
    }
  }

  private blocked(id: SessionId | undefined): boolean {
    return id !== undefined && (this.pending.has(id) || this.deleted.has(id))
  }

  private assertWritable(id: SessionId, parent?: SessionId): void {
    if (this.blocked(id) || this.blocked(parent)) reject('Conversation is being deleted or has been deleted')
  }

  private authorize(ids: readonly SessionId[]): void {
    const ctx = this.ctx
    if (this.closing || !this.config.enabled()) reject('Conversation management is disabled')
    if (ctx.invocation?.peer.principal.kind !== 'owner') reject('Only the Host owner can delete conversations')
    for (const id of ids) {
      if (!ctx.remoteAccess.allows({ kind: 'session', id })) reject('Conversation access denied')
    }
  }

  private async collect(id: SessionId): Promise<SessionHeader[]> {
    const headers = new Map((await this.ctx.sessionPersistence.list()).map(row => [row.header.id, row.header]))
    for (const session of this.ctx.sessions.list()) headers.set(session.id, session.header)
    const root = headers.get(id)
    if (!root || root.origin === 'subagent') reject('Select the owning conversation')
    const ids = new Set([id])
    let previous = 0
    while (ids.size !== previous) {
      previous = ids.size
      for (const header of headers.values()) {
        if (header.origin === 'subagent' && header.parentSession && ids.has(header.parentSession)) ids.add(header.id)
      }
    }
    return [...ids].sort().map(key => headers.get(key)!)
  }

  @Remote('deletePreview')
  async deletePreview(request: { sessionId: SessionId }): Promise<SessionDeletionPreview> {
    await this.ready
    if (this.unsupported) reject('This storage backend is not supported by conversation deletion', 'ae-conversations/delete-unsupported')
    if (!request || typeof request.sessionId !== 'string' || !request.sessionId) reject('Invalid conversation identity')
    this.authorize([request.sessionId])
    const headers = await this.collect(request.sessionId)
    const sessionIds = headers.map(header => header.id)
    this.authorize(sessionIds)
    const key = fingerprint(headers)
    this.previews.set(key, { version: 1, rootId: request.sessionId, fingerprint: key, headers, complete: false })
    return {
      sessionId: request.sessionId, sessionIds, fingerprint: key,
      runningSessionIds: sessionIds.filter(id => this.ctx.agents.get(id)?.status === 'running'),
    }
  }

  @Remote('delete')
  async delete(request: SessionDeletionRequest): Promise<readonly SessionId[]> {
    await this.ready
    if (this.unsupported) reject('This storage backend is not supported by conversation deletion', 'ae-conversations/delete-unsupported')
    const operation = this.performDeletion(request)
    this.active.add(operation)
    try { return await operation } finally { this.active.delete(operation) }
  }

  private async performDeletion(request: SessionDeletionRequest): Promise<readonly SessionId[]> {
    if (!request || request.stopRunning !== true || !Array.isArray(request.sessionIds)
      || request.sessionIds.some(id => typeof id !== 'string')) reject('Invalid deletion confirmation')
    this.authorize(request.sessionIds)
    const record = this.previews.get(request.fingerprint)
    if (!record || record.rootId !== request.sessionId
      || JSON.stringify(record.headers.map(header => header.id)) !== JSON.stringify(request.sessionIds)) {
      reject('Preview the conversation again', 'ae-conversations/delete-scope-changed')
    }
    if (this.operations.has(record.fingerprint) || request.sessionIds.some(id => this.pending.has(id))) reject('Deletion is already running')
    this.operations.add(record.fingerprint)
    for (const id of request.sessionIds) this.pending.add(id)
    const locks: SessionHandle[] = []
    try {
      const committed = request.sessionIds.every(id => this.deleted.has(id))
      if (!committed) {
        if (fingerprint(await this.collect(request.sessionId)) !== record.fingerprint) reject('Conversation family changed', 'ae-conversations/delete-scope-changed')
        await Promise.allSettled([...this.inflight].filter(([, item]) =>
          this.pending.has(item.id) || (item.parent !== undefined && this.pending.has(item.parent))).map(([operation]) => operation))
        for (const id of request.sessionIds) {
          const agent = this.ctx.agents.get(id)
          if (agent && this.handles.get(id)?.agent !== agent) {
            reject('Restart Desktop once after enabling the plugin', 'ae-conversations/delete-restart-required')
          }
          if (!agent && this.ctx.sessions.get(id)) reject('Conversation is still in use')
        }
        for (const id of [...request.sessionIds].reverse()) {
          const agent = this.ctx.agents.get(id)
          if (agent) {
            const handle = this.handles.get(id)
            if (handle?.agent !== agent) reject('Restart Desktop once after enabling the plugin', 'ae-conversations/delete-restart-required')
            agent.cancel({ kind: 'user' }, { keepInbox: false })
            await this.ctx.parallel('workspace/session-stop', { sessionId: id })
            await handle.dispose()
          }
          if (this.ctx.sessions.get(id)) reject('Conversation is still in use')
        }
      }
      for (const id of request.sessionIds) {
        if (await this.rawStat(id)) locks.push(await this.rawOpen(id, 'write'))
      }
      if (!committed) {
        await this.save(record)
        for (const id of request.sessionIds) this.deleted.add(id)
      }
      await this.cleanup(record)
      return request.sessionIds
    } finally {
      try { await Promise.all(locks.map(handle => handle.close())) } finally {
        for (const id of request.sessionIds) this.pending.delete(id)
        this.operations.delete(record.fingerprint)
      }
    }
  }

  private async save(record: DeletionRecord): Promise<void> {
    const target = join(this.directory, `${record.fingerprint}.json`)
    const temporary = `${target}.${randomUUID()}.tmp`
    await writeFile(temporary, JSON.stringify(record), { mode: 0o600, flag: 'wx' })
    await rename(temporary, target)
  }

  private async cleanup(record: DeletionRecord): Promise<void> {
    const root = await realpath(this.root)
    for (const header of record.headers) {
      const directory = sessionDirectory(this.root, header)
      let actual: string
      try { actual = await realpath(directory) } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') continue
        throw error
      }
      const within = relative(root, actual)
      if (!within || within === '..' || within.startsWith(`..${sep}`) || isAbsolute(within)) reject('Unsafe conversation storage path')
      for (const entry of await readdir(directory, { withFileTypes: true })) {
        if (entry.name === 'session.lock') continue
        await rm(join(directory, entry.name), { recursive: entry.isDirectory(), force: true })
      }
    }
    const ctx = this.ctx
    const ids = record.headers.map(header => header.id)
    const cache = ctx.storageDomain.get('session_projcache')?.table('sessions')
    for (const id of ids) {
      await cache?.delete(id)
      for (const workspace of ctx.workspaceRegistry.list()) await workspace.detachSession(id)
      await ctx.workspaceRegistry.unarchiveSession(id)
      await ctx.workspaceRegistry.unpinSession(id)
    }
    // The existing search operation reconciles its own serialized index.
    try { await ctx.sessionQuery.searchSessions({ query: 'ai-agent-engine-deletion', limit: 1 }) } catch (error) {
      if ((error as { code?: string }).code !== 'SESSION_QUERY_SEARCH_DISABLED') throw error
      const query = ctx.sessionQuery as typeof ctx.sessionQuery & { config?: { path?: string } }
      await clearDisabledSearchIndex(query.config?.path, ids)
    }
    record.complete = true
    await this.save(record)
    for (const id of ids) ctx.emit('api-session/removed', id)
  }
}
