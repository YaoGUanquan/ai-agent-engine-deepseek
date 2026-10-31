/** Pure validation for the jailbreak prompt-override overlay (not roles.json). */

export const DEFAULT_PROMPT_OVERRIDE_RELATIVE = ['ai-agent-engine', 'prompt-override.md'] as const
export const MAX_PROMPT_OVERRIDE_CHARS = 64 * 1024

export class PromptOverrideValidationError extends Error {
  readonly code = 'ae-capability/invalid-prompt' as const
  constructor(message: string) {
    super(message)
    this.name = 'PromptOverrideValidationError'
  }
}

/** Fail-closed validation before persist. Empty string is allowed (clears overlay body). */
export function validatePromptOverrideText(raw: unknown): string {
  if (typeof raw !== 'string') {
    throw new PromptOverrideValidationError('Prompt override must be a string')
  }
  if (raw.length > MAX_PROMPT_OVERRIDE_CHARS) {
    throw new PromptOverrideValidationError(`Prompt override exceeds ${MAX_PROMPT_OVERRIDE_CHARS} characters`)
  }
  // Reject NULs and other control chars except tab/newline/carriage-return.
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(raw)) {
    throw new PromptOverrideValidationError('Prompt override contains illegal control characters')
  }
  return raw
}

/** Read-side isolation: corrupt/oversized → undefined (caller skips injection). */
export function normalizePromptOverrideForRead(
  raw: string,
  warn: (message: string, ...args: unknown[]) => void = () => undefined,
): string | undefined {
  try {
    const text = validatePromptOverrideText(raw)
    if (!text.trim()) return undefined
    return text
  } catch (error) {
    warn('Ignoring invalid prompt override (%s)', error instanceof Error ? error.message : error)
    return undefined
  }
}
