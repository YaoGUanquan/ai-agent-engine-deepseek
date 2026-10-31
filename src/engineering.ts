import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import { readFile } from 'node:fs/promises'
import type { Agent } from '@deepseek-ai/dsh-agent'
import type {} from '@deepseek-ai/dsh-agent-preset-registry'
import type {} from '@deepseek-ai/dsh-system-prompt'
import { renderLeadPolicy } from './role-catalog.ts'
import { resolveRoleCatalog } from './role-catalog-io.ts'
import {
  CAPABILITY_ENHANCE_SECTION,
  PROMPT_OVERRIDE_SECTION,
} from './capability-protocol.ts'
import { resolveCapabilityPolicySections } from './capability-policy.ts'

export const name = 'ai-agent-engine-engineering'
export const inject = ['systemPrompt', 'tools', 'agents', 'agentTeams', 'agentPresets']

export interface EngineeringConfig {
  teamTools: boolean
  /** Boolean snapshot or live getter from Host volatile Config. */
  rolesEnabled?: boolean | (() => boolean)
  rolesPath?: string
  capabilityEnhanceEnabled?: boolean | (() => boolean)
  jailbreakEnabled?: boolean | (() => boolean)
  /** String snapshot or live getter from Host volatile Config. */
  enhanceProfile?: string | (() => string)
  jailbreakPromptPath?: string
  jailbreakPrompt?: string
}

/** teamTools is schema-checked; live getters use z.any. */
export const Config = z.object({
  teamTools: z.boolean().default(true),
  rolesEnabled: z.any().default(true),
  rolesPath: z.string().default(''),
  capabilityEnhanceEnabled: z.any().default(false),
  jailbreakEnabled: z.any().default(false),
  enhanceProfile: z.any().default(''),
  jailbreakPromptPath: z.string().default(''),
  jailbreakPrompt: z.string().default(''),
})

function flagOf(value: boolean | (() => boolean) | undefined, fallback = false): boolean {
  if (typeof value === 'function') return value()
  if (typeof value === 'boolean') return value
  return fallback
}

function textOf(value: string | (() => string) | undefined, fallback = ''): string {
  if (typeof value === 'function') return value()
  if (typeof value === 'string') return value
  return fallback
}

function rolesEnabledOf(config: { rolesEnabled?: boolean | (() => boolean) }): boolean {
  return flagOf(config.rolesEnabled, true)
}

/** Build Lead policy from the packaged template and the current role catalog. */
export async function buildEngineeringPolicy(
  config: Pick<EngineeringConfig, 'rolesEnabled' | 'rolesPath'>,
  warn?: (message: string, ...args: unknown[]) => void,
): Promise<string> {
  const template = await readFile(new URL('../prompts/lead.md', import.meta.url), 'utf8')
  const catalog = await resolveRoleCatalog({
    enabled: rolesEnabledOf(config),
    path: config.rolesPath,
    warn,
  })
  // Fresh string per call — safe for concurrent sessions/spawns.
  return renderLeadPolicy(template, catalog.roles)
}

type SectionBag = { enhance?: string; override?: string }

/**
 * Resolve optional enhance / jailbreak sections.
 * Order among our sections (documented): Lead(700) → jailbreak overlay(740) → enhance(780).
 * OFF switches fully bypass (no section registration).
 */
export async function buildCapabilitySections(
  config: Pick<EngineeringConfig, 'capabilityEnhanceEnabled' | 'jailbreakEnabled' | 'enhanceProfile' | 'jailbreakPromptPath' | 'jailbreakPrompt'>,
  warn?: (message: string, ...args: unknown[]) => void,
): Promise<SectionBag> {
  const resolved = await resolveCapabilityPolicySections({
    capabilityEnhanceEnabled: flagOf(config.capabilityEnhanceEnabled, false),
    jailbreakEnabled: flagOf(config.jailbreakEnabled, false),
    enhanceProfile: textOf(config.enhanceProfile),
    jailbreakPromptPath: config.jailbreakPromptPath,
    jailbreakPrompt: config.jailbreakPrompt,
    warn,
  })
  return {
    enhance: resolved.enhanceText,
    override: resolved.overrideText,
  }
}

/** Install policy in each Standard or engineering Agent's own scope. */
export async function apply(ctx: Context, config: EngineeringConfig): Promise<void> {
  const warn = (message: string, ...args: unknown[]) => { ctx.logger.warn(message, ...args) }
  let policy = await buildEngineeringPolicy(config, warn)
  let sections = await buildCapabilitySections(config, warn)
  if (config.teamTools) await ctx.plugin(await import('@deepseek-ai/dsh-experimental-tool-agent-team'))

  type Installed = {
    disposeLead: () => void
    disposeEnhance?: () => void
    disposeOverride?: () => void
  }
  const installed = new Map<Agent, Installed>()

  const disposeAll = (entry: Installed): void => {
    entry.disposeLead()
    entry.disposeEnhance?.()
    entry.disposeOverride?.()
  }

  const installSections = (agent: Agent): Installed => {
    const disposeLead = agent.ctx.systemPrompt.section({
      name: 'ai-agent-engine:engineering', order: 700, text: policy, interpolate: false,
    })
    // Jailbreak overlay before enhance so both are additive; OFF = no registration.
    let disposeOverride: (() => void) | undefined
    if (sections.override) {
      disposeOverride = agent.ctx.systemPrompt.section({
        name: PROMPT_OVERRIDE_SECTION, order: 740, text: sections.override, interpolate: false,
      })
    }
    let disposeEnhance: (() => void) | undefined
    if (sections.enhance) {
      disposeEnhance = agent.ctx.systemPrompt.section({
        name: CAPABILITY_ENHANCE_SECTION, order: 780, text: sections.enhance, interpolate: false,
      })
    }
    return { disposeLead, disposeEnhance, disposeOverride }
  }

  const reconcile = (agent: Agent): void => {
    const preset = ctx.agentPresets.composedPreset(agent.ctx)
    const enabled = preset === 'standard' || preset === 'ai-agent-engine'
    if (!enabled) {
      const prev = installed.get(agent)
      if (prev) { disposeAll(prev); installed.delete(agent) }
    } else if (!installed.has(agent)) {
      installed.set(agent, installSections(agent))
    }
  }

  const reconcileAll = (): void => {
    for (const agent of [...installed.keys()]) {
      const prev = installed.get(agent)
      if (prev) { disposeAll(prev); installed.delete(agent) }
    }
    for (const agent of ctx.agents.list()) reconcile(agent)
  }

  for (const agent of ctx.agents.list()) reconcile(agent)
  ctx.on('agent/created', ({ agent }) => { reconcile(agent); return undefined })
  ctx.on('agent-preset/selected', sessionId => {
    const agent = ctx.agents.get(sessionId)
    if (agent) {
      const prev = installed.get(agent)
      if (prev) { disposeAll(prev); installed.delete(agent) }
      reconcile(agent)
    }
  })
  ctx.on('agent/disposed', ({ agent }) => {
    const prev = installed.get(agent)
    if (prev) { disposeAll(prev); installed.delete(agent) }
  })

  const refreshPolicy = (): void => {
    void (async () => {
      try {
        policy = await buildEngineeringPolicy(config, warn)
        sections = await buildCapabilitySections(config, warn)
        reconcileAll()
      } catch (error) {
        warn('Failed to refresh engineering / capability policy: %s', error instanceof Error ? error.message : error)
      }
    })()
  }
  ctx.on('loader/volatile-update', refreshPolicy)
  ctx.on('ai-agent-engine/roles-updated', refreshPolicy)
  ctx.on('ai-agent-engine/capability-updated', refreshPolicy)
  ctx.effect(() => () => {
    for (const entry of installed.values()) disposeAll(entry)
    installed.clear()
  }, 'ai-agent-engine.scopedPolicy()')
}
