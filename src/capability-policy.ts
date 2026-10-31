/** Resolve optional systemPrompt sections for enhance / jailbreak (no host patches). */

import { capabilityEnhanceText, isKnownEnhanceProfile } from './capability-protocol.ts'
import { normalizePromptOverrideForRead } from './prompt-override.ts'
import { readPromptOverride, resolvePromptOverridePath } from './prompt-override-io.ts'

export interface CapabilityPolicyOptions {
  readonly capabilityEnhanceEnabled: boolean
  readonly jailbreakEnabled: boolean
  /** Empty → `$DSH_HOME/ai-agent-engine/prompt-override.md`. */
  readonly jailbreakPromptPath?: string
  /**
   * Inline cover text from Config. When non-empty and jailbreak is on, preferred
   * over the overlay file. Empty → read overlay file.
   */
  readonly jailbreakPrompt?: string
  /** Empty or `default` → builtin enhance text; unknown → isolate (no enhance). */
  readonly enhanceProfile?: string
  readonly warn?: (message: string, ...args: unknown[]) => void
}

export interface CapabilityPolicySections {
  readonly enhanceText?: string
  readonly overrideText?: string
  readonly overridePath?: string
  readonly enhanceSkipped?: 'profile'
  readonly overrideSkipped?: 'empty' | 'invalid' | 'path'
}

/** Pure resolve used by Host apply and unit tests. */
export async function resolveCapabilityPolicySections(
  options: CapabilityPolicyOptions,
): Promise<CapabilityPolicySections> {
  const warn = options.warn ?? (() => undefined)
  const result: CapabilityPolicySections = {}

  if (options.capabilityEnhanceEnabled) {
    const profile = options.enhanceProfile?.trim() ?? ''
    if (!isKnownEnhanceProfile(profile)) {
      warn('Unknown enhanceProfile %o; capability enhance isolated this turn', options.enhanceProfile)
      Object.assign(result, { enhanceSkipped: 'profile' })
    } else {
      const text = capabilityEnhanceText(profile || 'default')
      if (text) Object.assign(result, { enhanceText: text })
    }
  }

  if (!options.jailbreakEnabled) return result

  const inline = options.jailbreakPrompt
  if (typeof inline === 'string' && inline.trim()) {
    const text = normalizePromptOverrideForRead(inline, warn)
    if (!text) return { ...result, overrideSkipped: 'invalid' }
    return { ...result, overrideText: text }
  }

  const path = resolvePromptOverridePath(options.jailbreakPromptPath)
  if (!path) {
    warn('Jailbreak enabled but prompt override path unavailable (set DSH_HOME or jailbreakPromptPath)')
    return { ...result, overrideSkipped: 'path' }
  }
  const loaded = await readPromptOverride(path, warn)
  if (!loaded.text) {
    return { ...result, overridePath: loaded.path ?? path, overrideSkipped: loaded.path ? 'empty' : 'empty' }
  }
  return { ...result, overrideText: loaded.text, overridePath: loaded.path ?? path }
}
