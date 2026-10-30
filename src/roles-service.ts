import type { Context } from '@deepseek-ai/cordis'
import { Remote, RemoteError, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import type {} from '@deepseek-ai/dsh-typert-registry'
import {
  BUILTIN_ROLES,
  RoleOverlayValidationError,
  mergeRoleCatalog,
} from './role-catalog.ts'
import {
  deleteRolesFile,
  readOverlayDocument,
  resolveRoleCatalog,
  resolveRolesFilePath,
  writeRolesFile,
} from './role-catalog-io.ts'
import type {
  RolesCatalogView,
  RolesOverlayView,
  RolesPutRequest,
  RolesPutResult,
  RolesRestoreResult,
} from './roles-contract.ts'

declare module '@deepseek-ai/cordis' {
  interface Context { aeRoles: RoleCatalogService }
  interface Events {
    'ai-agent-engine/roles-updated': () => void
  }
}

declare module '@deepseek-ai/dsh-typert-protocol' {
  interface RemoteErrorDetailsMap {
    'ae-roles/rejected': {}
    'ae-roles/invalid-overlay': {}
    'ae-roles/path-unavailable': {}
  }
}

function reject(
  message: string,
  code: 'ae-roles/rejected' | 'ae-roles/invalid-overlay' | 'ae-roles/path-unavailable' = 'ae-roles/rejected',
): never {
  throw new RemoteError(code, message, {})
}

/** Host-owned read/write surface for the single roles.json overlay. */
export class RoleCatalogService extends TypertRemoteService {
  static inject = ['typert']

  constructor(
    ctx: Context,
    private readonly config: {
      enabled: () => boolean
      rolesPath: string
    },
  ) {
    super(ctx, 'aeRoles')
  }

  private authorize(): void {
    if (this.ctx.invocation?.peer.principal.kind !== 'owner') {
      reject('Only the Host owner can manage engineering roles')
    }
  }

  private resolvePath(): string {
    const path = resolveRolesFilePath(this.config.rolesPath)
    if (!path) reject('Role overlay path is unavailable (set DSH_HOME or rolesPath)', 'ae-roles/path-unavailable')
    return path
  }

  private warn(message: string, ...args: unknown[]): void {
    this.ctx.logger.warn(message, ...args)
  }

  private async emitUpdated(): Promise<void> {
    this.ctx.emit('ai-agent-engine/roles-updated')
  }

  @Remote('getCatalog')
  async getCatalog(_request: Record<string, never> = {}): Promise<RolesCatalogView> {
    this.authorize()
    const enabled = this.config.enabled()
    const catalog = await resolveRoleCatalog({
      enabled,
      path: this.config.rolesPath,
      warn: (message, ...args) => this.warn(message, ...args),
    })
    return {
      roles: catalog.roles.map(role => ({ ...role })),
      source: catalog.source,
      path: catalog.path,
      enabled,
    }
  }

  @Remote('getOverlay')
  async getOverlay(_request: Record<string, never> = {}): Promise<RolesOverlayView> {
    this.authorize()
    const path = resolveRolesFilePath(this.config.rolesPath)
    if (!path) return { version: 1, roles: [], exists: false }
    const document = await readOverlayDocument(path, (message, ...args) => this.warn(message, ...args))
    if (!document) return { version: 1, roles: [], path, exists: false }
    return { version: 1, roles: document.roles.map(role => ({ ...role })), path, exists: true }
  }

  @Remote('putOverlay')
  async putOverlay(request: RolesPutRequest): Promise<RolesPutResult> {
    this.authorize()
    const path = this.resolvePath()
    let written
    try {
      written = await writeRolesFile(path, request)
    } catch (error) {
      if (error instanceof RoleOverlayValidationError) {
        reject(error.message, 'ae-roles/invalid-overlay')
      }
      throw error
    }
    const roles = mergeRoleCatalog(BUILTIN_ROLES, written.roles).map(role => ({ ...role }))
    await this.emitUpdated()
    return {
      path,
      roles,
      source: 'merged',
    }
  }

  @Remote('restoreDefaults')
  async restoreDefaults(_request: Record<string, never> = {}): Promise<RolesRestoreResult> {
    this.authorize()
    const path = resolveRolesFilePath(this.config.rolesPath)
    if (path) await deleteRolesFile(path)
    await this.emitUpdated()
    return {
      restored: true,
      path,
      roles: BUILTIN_ROLES.map(role => ({ ...role })),
    }
  }
}
