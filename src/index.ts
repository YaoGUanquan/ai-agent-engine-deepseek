import type { Context, Volatile } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import type {} from '@deepseek-ai/dsh-agent-preset-registry'
import type { PresetDefinition } from '@deepseek-ai/dsh-agent-preset-registry'
import type { Config as PluginConfig } from './types.ts'
import { pluginRpc } from './rpc.ts'
import { CompatibilityService } from './compatibility-service.ts'
import { initialModuleStatuses, mountModule } from './module-runtime.ts'

export const name = 'ai-agent-engine'
export const inject = ['typert']

export interface Config extends Omit<PluginConfig, 'conversationManagement' | 'rolesEnabled' | 'capabilityEnhanceEnabled' | 'jailbreakEnabled'> {
  conversationManagement: Volatile<boolean>
  rolesEnabled: Volatile<boolean>
  capabilityEnhanceEnabled: Volatile<boolean>
  jailbreakEnabled: Volatile<boolean>
}

export const Config = z.object({
  engineering: z.boolean().default(true),
  conversationManagement: z.boolean().default(true).volatile(),
  maxMembers: z.natural().min(1).default(8),
  rolesEnabled: z.boolean().default(true).volatile(),
  rolesPath: z.string().default(''),
  capabilityEnhanceEnabled: z.boolean().default(false).volatile(),
  jailbreakEnabled: z.boolean().default(false).volatile(),
  enhanceProfile: z.string().default(''),
  jailbreakPromptPath: z.string().default(''),
  jailbreakPrompt: z.string().default(''),
})

/** Install an optional native preset without changing the selected default. */
export async function apply(ctx: Context, config: Config): Promise<void> {
  ctx.typert.register({
    package: pluginRpc.package, face: 'host', schemas: [],
    model: { services: [], events: [], objects: [] }, invocations: pluginRpc.descriptors,
  })
  const statuses = initialModuleStatuses()
  await ctx.plugin(CompatibilityService, { statuses })
  mountModule(ctx, 'roles', ['typert'], {}, statuses, async scope => {
    const { RoleCatalogService } = await import('./roles-service.ts')
    await scope.plugin(RoleCatalogService, {
      enabled: () => config.rolesEnabled.get(), rolesPath: config.rolesPath,
    })
  })
  // Capability / jailbreak RPC always mounts (settings + overlay IO); injection is gated in engineering.
  mountModule(ctx, 'capability', ['typert'], {}, statuses, async scope => {
    const { CapabilityPolicyService } = await import('./capability-service.ts')
    await scope.plugin(CapabilityPolicyService, {
      capabilityEnhanceEnabled: () => config.capabilityEnhanceEnabled.get(),
      jailbreakEnabled: () => config.jailbreakEnabled.get(),
      jailbreakPromptPath: config.jailbreakPromptPath,
      enhanceProfile: config.enhanceProfile,
    })
  })
  mountModule(ctx, 'deletion', [
    'agents', 'sessions', 'sessionPersistence', 'sessionQuery', 'storageDomain',
    'workspaceRegistry', 'typert', 'remoteAccess',
  ], {}, statuses, async scope => {
    const { ConversationDeletion } = await import('./conversation-deletion.ts')
    await scope.plugin(ConversationDeletion, {
      enabled: () => config.conversationManagement.get(),
      onUnsupported: () => { statuses.deletion = { state: 'unavailable', reason: 'storage' } },
    })
    if (statuses.deletion.state === 'unavailable') throw new Error('Unsupported deletion storage')
  })
  if (!config.engineering) {
    statuses.engineering = { state: 'unavailable' }
    return
  }
  mountModule(ctx, 'engineering', [
    'loader', 'agentPresets', 'agents', 'sessions', 'sessionPersistence',
    'sessionProjections', 'subagents', 'skills', 'typert', 'systemPrompt', 'tools',
  ], {
    loader: ['entries'], agentPresets: ['readDocument', 'composedPreset'],
    agents: ['list', 'get'], skills: ['registerProvider'], systemPrompt: ['section'],
    tools: ['register'],
  }, statuses, scope => installEngineering(scope, config, statuses))
}

async function installEngineering(ctx: Context, config: Config, statuses: import('./module-runtime.ts').ModuleStatuses): Promise<false> {
  const [
    { default: AgentPreset }, { default: TeamService }, engineering,
    { installSkills }, { entryListProblem }, { entryListSchema }, { load },
  ] = await Promise.all([
    import('@deepseek-ai/dsh-agent-preset'), import('@deepseek-ai/dsh-experimental-agent-team'),
    import('./engineering.ts'), import('./skills.ts'),
    import('@deepseek-ai/dsh-agent-preset-registry'),
    import('@deepseek-ai/cordis-plugin-include'), import('js-yaml'),
  ])
  installSkills(ctx)
  // A configured official service may still be starting. Its separately
  // installed module cannot be deduplicated by class identity.
  const configuredTeam = [...ctx.loader.entries()].some(entry =>
    entry.options.name === '@deepseek-ai/dsh-experimental-agent-team' && !entry.disabled)
  if (!ctx.get('agentTeams') && !configuredTeam) await ctx.plugin(TeamService, { maxMembers: config.maxMembers })
  const standard = await ctx.agentPresets.readDocument('standard')
  const plugins: unknown = load(standard.content, { schema: entryListSchema })
  const problem = entryListProblem(plugins)
  if (problem) throw new Error(`The Standard preset cannot be used as the engineering base: ${problem}`)
  const globalTeamTools = [...ctx.loader.entries()].some(entry =>
    entry.options.name === '@deepseek-ai/dsh-experimental-tool-agent-team' && !entry.disabled)
  mountModule(ctx, 'engineering', ['agentTeams'], {
    agentTeams: ['spawnTeammate', 'sendMessage', 'listMembers', 'listTasks', 'createTask', 'updateTask', 'waitForChange', 'interrupt'],
  }, statuses, async ready => {
    await ready.plugin(engineering, {
      teamTools: !globalTeamTools,
      rolesEnabled: () => config.rolesEnabled.get(),
      rolesPath: config.rolesPath,
      capabilityEnhanceEnabled: () => config.capabilityEnhanceEnabled.get(),
      jailbreakEnabled: () => config.jailbreakEnabled.get(),
      enhanceProfile: config.enhanceProfile,
      jailbreakPromptPath: config.jailbreakPromptPath,
      jailbreakPrompt: config.jailbreakPrompt,
    })
    await ready.plugin(AgentPreset, {
      id: 'ai-agent-engine',
      name: 'AI Agent Engine',
      description: '按需组队的工程协作：需求、前后端实现与分层验证。',
      plugins: [...plugins as PresetDefinition['plugins']],
    })
  })
  return false
}
