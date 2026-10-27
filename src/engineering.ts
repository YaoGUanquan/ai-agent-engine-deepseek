import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import { readFile } from 'node:fs/promises'
import * as teamTools from '@deepseek-ai/dsh-experimental-tool-agent-team'
import type {} from '@deepseek-ai/dsh-system-prompt'
import { installSkills } from './skills.ts'

export const name = 'ai-agent-engine-engineering'
export const inject = ['systemPrompt', 'skills', 'tools', 'agents', 'agentTeams']
export const Config = z.object({ teamTools: z.boolean().default(true) })

/** Add engineering policy only to the selected preset's scope. */
export async function apply(ctx: Context, config: { teamTools: boolean }): Promise<void> {
  const policy = await readFile(new URL('../prompts/lead.md', import.meta.url), 'utf8')
  ctx.systemPrompt.section({ name: 'ai-agent-engine:engineering', order: 700, text: policy, interpolate: false })
  installSkills(ctx)
  if (config.teamTools) ctx.plugin(teamTools)
}
