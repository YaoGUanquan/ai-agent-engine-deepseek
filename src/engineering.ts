import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import { readFile } from 'node:fs/promises'
import * as teamTools from '@deepseek-ai/dsh-experimental-tool-agent-team'
import type { Agent } from '@deepseek-ai/dsh-agent'
import type {} from '@deepseek-ai/dsh-agent-preset-registry'
import type {} from '@deepseek-ai/dsh-system-prompt'
import { renderLeadPolicy, resolveRoleCatalog } from './role-catalog.ts'

export const name = 'ai-agent-engine-engineering'
export const inject = ['systemPrompt', 'tools', 'agents', 'agentTeams', 'agentPresets']

export interface EngineeringConfig {
  teamTools: boolean
  /** Boolean snapshot or live getter from Host volatile Config. */
  rolesEnabled?: boolean | (() => boolean)
  rolesPath?: string
}

/** teamTools is schema-checked; rolesEnabled may be a getter (z.any). */
export const Config = z.object({
  teamTools: z.boolean().default(true),
  rolesEnabled: z.any().default(true),
  rolesPath: z.string().default(''),
})

function rolesEnabledOf(config: { rolesEnabled?: boolean | (() => boolean) }): boolean {
  const value = config.rolesEnabled
  if (typeof value === 'function') return value()
  return value !== false
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

/** Install policy in each Standard or engineering Agent's own scope. */
export async function apply(ctx: Context, config: EngineeringConfig): Promise<void> {
  const warn = (message: string, ...args: unknown[]) => { ctx.logger.warn(message, ...args) }
  let policy = await buildEngineeringPolicy(config, warn)
  if (config.teamTools) ctx.plugin(teamTools)
  const installed = new Map<Agent, () => void>()
  const reconcile = (agent: Agent): void => {
    const preset = ctx.agentPresets.composedPreset(agent.ctx)
    const enabled = preset === 'standard' || preset === 'ai-agent-engine'
    if (!enabled) {
      installed.get(agent)?.()
      installed.delete(agent)
    } else if (!installed.has(agent)) {
      // Per-agent section registration; shared policy string is immutable after each rebuild.
      installed.set(agent, agent.ctx.systemPrompt.section({
        name: 'ai-agent-engine:engineering', order: 700, text: policy, interpolate: false,
      }))
    }
  }
  const reconcileAll = (): void => {
    for (const agent of [...installed.keys()]) {
      installed.get(agent)?.()
      installed.delete(agent)
    }
    for (const agent of ctx.agents.list()) reconcile(agent)
  }
  for (const agent of ctx.agents.list()) reconcile(agent)
  ctx.on('agent/created', ({ agent }) => { reconcile(agent); return undefined })
  ctx.on('agent-preset/selected', sessionId => {
    const agent = ctx.agents.get(sessionId)
    if (agent) {
      installed.get(agent)?.()
      installed.delete(agent)
      reconcile(agent)
    }
  })
  ctx.on('agent/disposed', ({ agent }) => {
    installed.get(agent)?.()
    installed.delete(agent)
  })
  const refreshPolicy = (): void => {
    void (async () => {
      try {
        policy = await buildEngineeringPolicy(config, warn)
        reconcileAll()
      } catch (error) {
        warn('Failed to refresh engineering role policy: %s', error instanceof Error ? error.message : error)
      }
    })()
  }
  ctx.on('loader/volatile-update', refreshPolicy)
  ctx.on('ai-agent-engine/roles-updated', refreshPolicy)
  ctx.effect(() => () => {
    for (const dispose of installed.values()) dispose()
    installed.clear()
  }, 'ai-agent-engine.scopedPolicy()')
}
