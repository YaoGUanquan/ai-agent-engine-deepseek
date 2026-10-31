/**
 * In-plugin capability-selection + collaboration/verification guidance.
 * Rewritten for this plugin; not a copy of third-party jailbreak personas
 * or APEX preset bodies. APEX (MIT) inspired the idea of optional,
 * default-off controllable strategy text — see NOTICE.md.
 */

export const CAPABILITY_ENHANCE_SECTION = 'ai-agent-engine:capability-enhance'
export const PROMPT_OVERRIDE_SECTION = 'ai-agent-engine:prompt-override'

/** Built-in enhance profile ids accepted when capabilityEnhanceEnabled is on. */
export const ENHANCE_PROFILES = ['default'] as const
export type EnhanceProfileId = (typeof ENHANCE_PROFILES)[number]

export function isKnownEnhanceProfile(value: unknown): value is EnhanceProfileId | '' {
  if (value === undefined || value === null) return true
  if (typeof value !== 'string') return false
  const trimmed = value.trim()
  return trimmed === '' || (ENHANCE_PROFILES as readonly string[]).includes(trimmed)
}

/**
 * Short controllable strategy: skill/tool selection, light collaboration, and
 * evidence-oriented verification. Does not register tools, deny hooks, or
 * patch the host; does not install an independent APEX mode or browser suite.
 */
export function capabilityEnhanceText(profile: string = 'default'): string {
  const id = profile.trim() || 'default'
  if (id !== 'default') {
    // Caller should isolate unknown profiles; keep a safe empty for defense in depth.
    return ''
  }
  return [
    '## Capability selection (AI Agent Engine)',
    '',
    'When this section is active for the session:',
    '1. Inspect available skills and host/MCP tools before improvising.',
    '2. Prefer a matching skill or tool for the user task; load skills through the host skill tool.',
    '3. Only fall back to ad-hoc shell steps when nothing in the catalog fits; say what was missing.',
    '4. Teammates you spawn should follow the same selection rule.',
    '',
    '## Collaboration (optional, task-driven)',
    '',
    '5. Keep simple tasks on the lead path; spawn teammates only for independent subtasks.',
    '6. State success criteria before delegating; do not rebind already-running teammates.',
    '',
    '## Verification feedback',
    '',
    '7. Prefer observable evidence (command output, tests, file diffs) over ungrounded claims.',
    '8. When a check fails, record the failure fact and a single next verification step.',
    '',
    'This guidance does not bypass host approvals, sandbox, or safety policy.',
  ].join('\n')
}
