/** Wire contracts for the aeRoles remote surface. */

import type { RoleDefinition, RoleOverlayEntry, RoleCatalogResult } from './role-catalog.ts'

export interface RolesCatalogView {
  readonly roles: readonly RoleDefinition[]
  readonly source: RoleCatalogResult['source']
  readonly path?: string
  readonly enabled: boolean
}

export interface RolesOverlayView {
  readonly version: 1
  readonly roles: readonly RoleOverlayEntry[]
  readonly path?: string
  readonly exists: boolean
}

export interface RolesPutRequest {
  readonly version: 1
  readonly roles: readonly RoleOverlayEntry[]
}

export interface RolesPutResult {
  readonly path: string
  readonly roles: readonly RoleDefinition[]
  readonly source: RoleCatalogResult['source']
}

export interface RolesRestoreResult {
  readonly restored: true
  readonly path?: string
  readonly roles: readonly RoleDefinition[]
}

export interface RolesRemote {
  getCatalog(request?: Record<string, never>): Promise<RolesCatalogView>
  getOverlay(request?: Record<string, never>): Promise<RolesOverlayView>
  putOverlay(request: RolesPutRequest): Promise<RolesPutResult>
  restoreDefaults(request?: Record<string, never>): Promise<RolesRestoreResult>
}
