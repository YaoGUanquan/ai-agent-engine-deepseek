/** Filesystem helpers for prompt-override.md (Host-only; separate from roles.json). */

import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import {
  DEFAULT_PROMPT_OVERRIDE_RELATIVE,
  PromptOverrideValidationError,
  normalizePromptOverrideForRead,
  validatePromptOverrideText,
} from './prompt-override.ts'

/** Resolve overlay path: explicit path, else `$DSH_HOME/ai-agent-engine/prompt-override.md`. */
export function resolvePromptOverridePath(explicitPath?: string): string | undefined {
  const explicit = explicitPath?.trim()
  if (explicit) return explicit
  const home = process.env.DSH_HOME?.trim()
  if (!home) return undefined
  return join(home, ...DEFAULT_PROMPT_OVERRIDE_RELATIVE)
}

/** Read overlay for injection; missing/IO/invalid → undefined (no throw). */
export async function readPromptOverride(
  path: string | undefined,
  warn: (message: string, ...args: unknown[]) => void = () => undefined,
): Promise<{ text?: string; path?: string }> {
  if (!path) return {}
  let raw: string
  try {
    raw = await readFile(path, 'utf8')
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code
    if (code === 'ENOENT') return { path }
    warn('Failed to read prompt override at %s (%s)', path, code ?? 'error')
    return { path }
  }
  const text = normalizePromptOverrideForRead(raw, warn)
  return { text, path }
}

/** Persist overlay atomically. Validates before any write. */
export async function writePromptOverride(path: string, raw: unknown): Promise<string> {
  const text = validatePromptOverrideText(raw)
  const directory = dirname(path)
  await mkdir(directory, { recursive: true, mode: 0o700 })
  const temporary = `${path}.${process.pid}.${Date.now()}.tmp`
  try {
    await writeFile(temporary, text, { mode: 0o600, flag: 'wx' })
    await rename(temporary, path)
  } catch (error) {
    try { await unlink(temporary) } catch { /* ignore */ }
    throw error
  }
  return text
}

/** Delete overlay file. Missing file is success. */
export async function deletePromptOverride(path: string): Promise<void> {
  try {
    await unlink(path)
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code
    if (code === 'ENOENT') return
    throw error
  }
}

export { PromptOverrideValidationError }
