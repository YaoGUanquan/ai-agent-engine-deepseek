import type { Context, Volatile } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import AgentPreset from '@deepseek-ai/dsh-agent-preset'
import TeamService from '@deepseek-ai/dsh-experimental-agent-team'
import type {} from '@deepseek-ai/dsh-agent-preset-registry'
import { entryListProblem, type PresetDefinition } from '@deepseek-ai/dsh-agent-preset-registry'
import { entryListSchema } from '@deepseek-ai/cordis-plugin-include'
import { load } from 'js-yaml'
import type { Config as PluginConfig } from './types.ts'
import { installSkills } from './skills.ts'
import * as engineering from './engineering.ts'
import { ConversationDeletion } from './conversation-deletion.ts'
import { RoleCatalogService } from './roles-service.ts'
import { pluginRpc } from './rpc.ts'

export const name = 'ai-agent-engine'
export const inject = ['loader', 'agentPresets', 'agents', 'sessions', 'sessionPersistence', 'sessionProjections', 'subagents', 'skills', 'typert']

export interface Config extends Omit<PluginConfig, 'conversationManagement' | 'rolesEnabled'> {
  conversationManagement: Volatile<boolean>
  rolesEnabled: Volatile<boolean>
}

export const Config = z.object({
  engineering: z.boolean().default(true),
  conversationManagement: z.boolean().default(true).volatile(),
  maxMembers: z.natural().min(1).default(8),
  rolesEnabled: z.boolean().default(true).volatile(),
  rolesPath: z.string().default(''),
})

/** Install an optional native preset without changing the selected default. */
export async function apply(ctx: Context, config: Config): Promise<void> {
  ctx.typert.register({
    package: pluginRpc.package, face: 'host', schemas: [],
    model: { services: [], events: [], objects: [] }, invocations: pluginRpc.descriptors,
  })
  ctx.plugin(ConversationDeletion, { enabled: () => config.conversationManagement.get() })
  ctx.plugin(RoleCatalogService, {
    enabled: () => config.rolesEnabled.get(),
    rolesPath: config.rolesPath,
  })
  if (!config.engineering) return
  installSkills(ctx)
  // A configured official service may still be starting. Its separately
  // installed module cannot be deduplicated by class identity.
  const configuredTeam = [...ctx.loader.entries()].some(entry =>
    entry.options.name === '@deepseek-ai/dsh-experimental-agent-team' && !entry.disabled)
  if (!ctx.get('agentTeams') && !configuredTeam) ctx.plugin(TeamService, { maxMembers: config.maxMembers })
  const standard = await ctx.agentPresets.readDocument('standard')
  const plugins: unknown = load(standard.content, { schema: entryListSchema })
  const problem = entryListProblem(plugins)
  if (problem) throw new Error(`The Standard preset cannot be used as the engineering base: ${problem}`)
  const globalTeamTools = [...ctx.loader.entries()].some(entry =>
    entry.options.name === '@deepseek-ai/dsh-experimental-tool-agent-team' && !entry.disabled)
  ctx.plugin(engineering, {
    teamTools: !globalTeamTools,
    rolesEnabled: () => config.rolesEnabled.get(),
    rolesPath: config.rolesPath,
  })
  ctx.plugin(AgentPreset, {
    id: 'ai-agent-engine',
    name: 'AI Agent Engine',
    description: '按需组队的工程协作：需求、前后端实现与分层验证。',
    plugins: [
      ...plugins as PresetDefinition['plugins'],
    ],
  })
}
