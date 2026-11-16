import { Context } from '@deepseek-ai/cordis'
import { describe, expect, it, vi } from 'vitest'
import { apply, type Config } from '../src/index.ts'

const mocks = vi.hoisted(() => ({
  legacyImport: vi.fn(), policy: vi.fn(), preset: vi.fn(),
}))
vi.mock('@deepseek-ai/dsh-experimental-agent-team', () => {
  mocks.legacyImport()
  throw new Error('Legacy Team imports a removed subagent/internal export')
})
vi.mock('@deepseek-ai/dsh-agent-preset', () => ({
  default: (_ctx: Context, config: unknown) => { mocks.preset(config) },
}))
vi.mock('../src/engineering.ts', async importOriginal => ({
  ...await importOriginal<typeof import('../src/engineering.ts')>(),
  apply: (_ctx: Context, config: unknown) => { mocks.policy(config) },
}))
vi.mock('../src/skills.ts', () => ({ installSkills: vi.fn() }))

describe('engineering on Hosts with official Team modules', () => {
  it.each([
    ['', true], ['', false], ['experimental-', true], ['experimental-', false],
  ] as const)('reuses %sTeam (ready=%s) without importing legacy code or requiring removed methods', async (prefix, ready) => {
    mocks.legacyImport.mockClear()
    mocks.policy.mockClear()
    mocks.preset.mockClear()
    const ctx = new Context()
    const readDocument = vi.fn(async () => ({ content: '[]' }))
    const services = {
      typert: { register: vi.fn() },
      loader: { entries: () => [
        { options: { name: `@deepseek-ai/dsh-${prefix}agent-team` }, disabled: false },
        { options: { name: `@deepseek-ai/dsh-${prefix}tool-agent-team` }, disabled: false },
      ] },
      agentPresets: { readDocument, composedPreset: vi.fn() },
      agents: { list: () => [], get: vi.fn() },
      sessions: {}, sessionPersistence: {}, sessionProjections: {}, subagents: {},
      skills: { registerProvider: vi.fn() },
      systemPrompt: { section: vi.fn() }, tools: { register: vi.fn() },
      // Newer Hosts intentionally no longer expose spawnTeammate/listMembers.
      ...(ready ? { agentTeams: {} } : {}),
    }
    for (const [name, service] of Object.entries(services)) ctx.provide(name, service)
    try {
      await ctx.plugin(async scope => { await apply(scope, {
        engineering: true, maxMembers: 8, rolesPath: '', updateFeed: '',
        rolesEnabled: { get: () => true }, conversationManagement: { get: () => true },
      } as Config) })
      if (!ready) {
        await vi.waitFor(() => expect(readDocument).toHaveBeenCalledOnce())
        expect(mocks.legacyImport).not.toHaveBeenCalled()
        expect(mocks.policy).not.toHaveBeenCalled()
        ctx.provide('agentTeams', {})
      }
      await vi.waitFor(() => expect(mocks.policy).toHaveBeenCalledOnce())
      expect(mocks.policy).toHaveBeenCalledWith(expect.objectContaining({ teamTools: false }))
      expect(mocks.preset).toHaveBeenCalledWith(expect.objectContaining({ id: 'ai-agent-engine' }))
      expect(mocks.legacyImport).not.toHaveBeenCalled()
    } finally { await ctx.fiber.dispose() }
  })
})
