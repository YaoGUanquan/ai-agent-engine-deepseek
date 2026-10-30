/** Filesystem helpers for the roles.json overlay (Host-only). */

import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import {
  BUILTIN_ROLES,
  parseRolesFile,
  type RoleCatalogOptions,
  type RoleCatalogResult,
  type RolesFile,
  mergeRoleCatalog,
  validateRolesFile,
} from './role-catalog.ts'

/** Resolve overlay path: explicit `rolesPath`, else `$DSH_HOME/ai-agent-engine/roles.json`. */
export function resolveRolesFilePath(rolesPath?: string): string | undefined {
  const explicit = rolesPath?.trim()
  if (explicit) return explicit
  const home = process.env.DSH_HOME?.trim()
  if (!home) return undefined
  return join(home, 'ai-agent-engine', 'roles.json')
}

/** Read raw overlay document without merging; missing file returns undefined. */
export async function readOverlayDocument(
  path: string,
  warn: (message: string, ...args: unknown[]) => void = () => undefined,
): Promise<RolesFile | undefined> {
  let text: string
  try {
    text = await readFile(path, 'utf8')
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code
    if (code === 'ENOENT') return undefined
    warn('Failed to read role overlay at %s (%s)', path, code ?? 'error')
    return undefined
  }
  const roles = parseRolesFile(text, warn)
  if (!roles) return undefined
  return { version: 1, roles }
}

/** Persist overlay atomically (temp + rename). Validates before any write. */
export async function writeRolesFile(path: string, raw: unknown): Promise<RolesFile> {
  const document = validateRolesFile(raw)
  const directory = dirname(path)
  await mkdir(directory, { recursive: true, mode: 0o700 })
  const temporary = `${path}.${process.pid}.${Date.now()}.tmp`
  const payload = `${JSON.stringify({ version: 1, roles: document.roles }, null, 2)}\n`
  try {
    await writeFile(temporary, payload, { mode: 0o600, flag: 'wx' })
    await rename(temporary, path)
  } catch (error) {
    try { await unlink(temporary) } catch { /* ignore cleanup */ }
    throw error
  }
  return document
}

/** Delete overlay file. Missing file is success (restore defaults). */
export async function deleteRolesFile(path: string): Promise<void> {
  try {
    await unlink(path)
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code
    if (code === 'ENOENT') return
    throw error
  }
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
