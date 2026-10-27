import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import { readFile } from 'node:fs/promises'
import * as teamTools from '@deepseek-ai/dsh-experimental-tool-agent-team'
import type { Agent } from '@deepseek-ai/dsh-agent'
import type {} from '@deepseek-ai/dsh-agent-preset-registry'
import type {} from '@deepseek-ai/dsh-system-prompt'

export const name = 'ai-agent-engine-engineering'
export const inject = ['systemPrompt', 'tools', 'agents', 'agentTeams', 'agentPresets']
export const Config = z.object({ teamTools: z.boolean().default(true) })

/** Install policy in each Standard or engineering Agent's own scope. */
export async function apply(ctx: Context, config: { teamTools: boolean }): Promise<void> {
  const policy = await readFile(new URL('../prompts/lead.md', import.meta.url), 'utf8')
  if (config.teamTools) ctx.plugin(teamTools)
  const installed = new Map<Agent, () => void>()
  const reconcile = (agent: Agent): void => {
    const preset = ctx.agentPresets.composedPreset(agent.ctx)
    const enabled = preset === 'standard' || preset === 'ai-agent-engine'
    if (!enabled) {
      installed.get(agent)?.()
      installed.delete(agent)
    } else if (!installed.has(agent)) {
      installed.set(agent, agent.ctx.systemPrompt.section({
        name: 'ai-agent-engine:engineering', order: 700, text: policy, interpolate: false,
      }))
    }
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
  ctx.effect(() => () => {
    for (const dispose of installed.values()) dispose()
    installed.clear()
  }, 'ai-agent-engine.scopedPolicy()')
}
