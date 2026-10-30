/** Builtin engineering roles and user overlay merge for Lead policy. */

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

/** One spawnable engineering role consumed by Lead policy text. */
export interface RoleDefinition {
  readonly id: string
  readonly skill?: string
  readonly responsibility?: string
}

/** Overlay entry written under `$DSH_HOME/ai-agent-engine/roles.json`. */
export interface RoleOverlayEntry {
  readonly id: string
  readonly skill?: string
  readonly responsibility?: string
}

export interface RolesFile {
  readonly version: 1
  readonly roles: readonly RoleOverlayEntry[]
}

export interface RoleCatalogOptions {
  /** When false, skip overlay and return builtin seed only. */
  readonly enabled: boolean
  /** Absolute path override; empty/undefined uses `$DSH_HOME/ai-agent-engine/roles.json`. */
  readonly path?: string
  readonly warn?: (message: string, ...args: unknown[]) => void
}

export interface RoleCatalogResult {
  readonly roles: readonly RoleDefinition[]
  readonly source: 'builtin' | 'merged'
  readonly path?: string
}

/** Packaged defaults; package upgrades refresh these, overlay only overrides recorded fields. */
export const BUILTIN_ROLES: readonly RoleDefinition[] = [
  { id: 'requirements', skill: 'ae-grill', responsibility: 'Resolve decisions that materially affect acceptance.' },
  { id: 'frontend', skill: 'ae-frontend', responsibility: 'Implement accessible UI and all relevant interaction states.' },
  { id: 'backend', skill: 'ae-backend', responsibility: 'Implement compatible services, authorization and persistence.' },
  { id: 'unit-test', skill: 'ae-unit-test', responsibility: 'Exercise meaningful isolated behavior and regressions.' },
  { id: 'integration-test', skill: 'ae-integration-test', responsibility: 'Verify real cross-module contracts in isolation.' },
  { id: 'browser-test', skill: 'ae-e2e-test', responsibility: 'Verify requested user journeys with browser evidence.' },
  { id: 'e2e-engineer', skill: 'ae-e2e-suite', responsibility: 'Maintain suite infrastructure and CI when requested.' },
]

const ROLE_ID = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/

/** Reserved Lead identity; never a spawnable catalog entry. */
const RESERVED = new Set(['lead'])

/** Resolve overlay path: explicit `rolesPath`, else `$DSH_HOME/ai-agent-engine/roles.json`. */
export function resolveRolesFilePath(rolesPath?: string): string | undefined {
  const explicit = rolesPath?.trim()
  if (explicit) return explicit
  const home = process.env.DSH_HOME?.trim()
  if (!home) return undefined
  return join(home, 'ai-agent-engine', 'roles.json')
}

export function isValidRoleId(id: unknown): id is string {
  return typeof id === 'string' && ROLE_ID.test(id) && !RESERVED.has(id)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}

/** Validate one overlay row; returns undefined when the row must be skipped. */
export function normalizeOverlayEntry(
  raw: unknown,
  warn: (message: string, ...args: unknown[]) => void,
): RoleOverlayEntry | undefined {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    warn('Ignoring non-object role overlay entry')
    return undefined
  }
  const row = raw as Record<string, unknown>
  if (!isValidRoleId(row.id)) {
    warn('Ignoring role overlay entry with invalid id: %o', row.id)
    return undefined
  }
  const entry: RoleOverlayEntry = { id: row.id }
  if ('skill' in row) {
    if (row.skill !== undefined && !isNonEmptyString(row.skill)) {
      warn('Ignoring invalid skill on role overlay entry %s', row.id)
      return undefined
    }
    if (isNonEmptyString(row.skill)) Object.assign(entry, { skill: row.skill })
  }
  if ('responsibility' in row) {
    if (row.responsibility !== undefined && typeof row.responsibility !== 'string') {
      warn('Ignoring invalid responsibility on role overlay entry %s', row.id)
      return undefined
    }
    if (typeof row.responsibility === 'string') Object.assign(entry, { responsibility: row.responsibility })
  }
  return entry
}

/**
 * Deep-merge overlay fields onto builtin seed by id; unknown ids append.
 * Builtin text remains the base so package upgrades refresh unoverridden fields.
 * Returns a fresh array of fresh objects — never mutates `builtin` or `overlay`.
 */
export function mergeRoleCatalog(
  builtin: readonly RoleDefinition[],
  overlay: readonly RoleOverlayEntry[],
): RoleDefinition[] {
  const byId = new Map<string, RoleDefinition>()
  const order: string[] = []
  for (const role of builtin) {
    byId.set(role.id, { ...role })
    order.push(role.id)
  }
  for (const entry of overlay) {
    const current = byId.get(entry.id)
    if (current) {
      byId.set(entry.id, {
        id: current.id,
        skill: entry.skill !== undefined ? entry.skill : current.skill,
        responsibility: entry.responsibility !== undefined ? entry.responsibility : current.responsibility,
      })
      continue
    }
    byId.set(entry.id, {
      id: entry.id,
      skill: entry.skill,
      responsibility: entry.responsibility ?? '',
    })
    order.push(entry.id)
  }
  return order.map(id => ({ ...byId.get(id)! }))
}

/** Parse roles.json; corrupt or illegal documents return undefined (caller falls back). */
export function parseRolesFile(
  text: string,
  warn: (message: string, ...args: unknown[]) => void,
): RoleOverlayEntry[] | undefined {
  let parsed: unknown
  try {
    parsed = JSON.parse(text) as unknown
  } catch {
    warn('Role overlay JSON is corrupt; using builtin roles')
    return undefined
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    warn('Role overlay root must be an object; using builtin roles')
    return undefined
  }
  const document = parsed as Record<string, unknown>
  if (document.version !== 1) {
    warn('Role overlay version is unsupported (%o); using builtin roles', document.version)
    return undefined
  }
  if (!Array.isArray(document.roles)) {
    warn('Role overlay roles must be an array; using builtin roles')
    return undefined
  }
  const roles: RoleOverlayEntry[] = []
  for (const row of document.roles) {
    const entry = normalizeOverlayEntry(row, warn)
    if (entry) roles.push(entry)
  }
  return roles
}

/** Load and merge overlay when enabled; never throws for IO or parse failures. */
export async function resolveRoleCatalog(options: RoleCatalogOptions): Promise<RoleCatalogResult> {
  const warn = options.warn ?? (() => undefined)
  const builtin = BUILTIN_ROLES.map(role => ({ ...role }))
  if (!options.enabled) return { roles: builtin, source: 'builtin' }

  const path = resolveRolesFilePath(options.path)
  if (!path) return { roles: builtin, source: 'builtin' }

  let text: string
  try {
    text = await readFile(path, 'utf8')
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code
    if (code === 'ENOENT') return { roles: builtin, source: 'builtin', path }
    warn('Failed to read role overlay at %s (%s); using builtin roles', path, code ?? 'error')
    return { roles: builtin, source: 'builtin', path }
  }

  const overlay = parseRolesFile(text, warn)
  if (!overlay) return { roles: builtin, source: 'builtin', path }
  return { roles: mergeRoleCatalog(builtin, overlay), source: 'merged', path }
}

/** English list used in Lead naming guidance. */
export function formatRoleIds(roles: readonly RoleDefinition[]): string {
  const ids = roles.map(role => role.id)
  if (ids.length === 0) return '(none configured)'
  if (ids.length === 1) return ids[0]!
  if (ids.length === 2) return `${ids[0]} or ${ids[1]}`
  return `${ids.slice(0, -1).join(', ')}, or ${ids.at(-1)}`
}

/** Markdown skills table for Lead policy. */
export function formatRoleTable(roles: readonly RoleDefinition[]): string {
  const rows = roles.map(role =>
    `| ${role.id} | ${role.skill ?? '—'} | ${role.responsibility ?? ''} |`)
  return ['| Role | Skill | Responsibility |', '| --- | --- | --- |', ...rows].join('\n')
}

/**
 * Substitute `{{ROLE_IDS}}` and `{{ROLE_TABLE}}` in the packaged lead template.
 * Unknown placeholders are left intact. Returns a new string; template is not mutated.
 */
export function renderLeadPolicy(template: string, roles: readonly RoleDefinition[]): string {
  return template
    .replaceAll('{{ROLE_IDS}}', formatRoleIds(roles))
    .replaceAll('{{ROLE_TABLE}}', formatRoleTable(roles))
}
