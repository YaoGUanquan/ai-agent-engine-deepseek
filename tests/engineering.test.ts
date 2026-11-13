import { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apply as applyEngineering } from '../src/engineering.ts'
import { apply as applyBundle, type Config } from '../src/index.ts'

const read = vi.hoisted(() => vi.fn())
vi.mock('node:fs/promises', async importOriginal => ({
  ...await importOriginal<typeof import('node:fs/promises')>(), readFile: read,
}))

function overlay(responsibility: string) {
  return JSON.stringify({ version: 1, roles: [{ id: 'frontend', responsibility }] })
}
beforeEach(() => { read.mockReset() })

async function policyFixture(
  rolesEnabled: boolean | (() => boolean) = true,
  beforeReady?: (ctx: Context) => Promise<void>,
) {
  const ctx = new Context()
  const agentCtx = new Context()
  const sections = new Map<object, string>()
  const register = vi.fn((section: { text: string }) => {
    const identity = {}
    sections.set(identity, section.text)
    return () => { sections.delete(identity) }
  })
  Object.assign(agentCtx, { systemPrompt: { section: register } })
  const agent = { id: 'root', ctx: agentCtx } as Agent
  Object.assign(ctx, {
    agents: { list: () => [agent], get: () => agent },
    agentPresets: { composedPreset: () => 'standard' },
  })
  const plugin = ctx.plugin(async scope => {
    await applyEngineering(scope, { teamTools: false, rolesPath: '/test/roles.json', rolesEnabled })
  })
  if (beforeReady) await beforeReady(ctx)
  await plugin
  return { ctx, agentCtx, plugin, sections, register }
}

describe('engineering role policy lifecycle', () => {
  it('rechecks a switch changed while the initial overlay read is pending', async () => {
    let enabled = true
    const firstRead = Promise.withResolvers<string>()
    read.mockImplementation((path: unknown) => path instanceof URL
      ? Promise.resolve('{{ROLE_TABLE}}') : firstRead.promise)
    const fixture = await policyFixture(() => enabled, async ctx => {
      await vi.waitFor(() => expect(read).toHaveBeenCalledTimes(2))
      enabled = false
      ctx.emit('ai-agent-engine/roles-updated')
      firstRead.resolve(overlay('Stale startup override'))
    })
    try {
      expect([...fixture.sections.values()][0]).not.toContain('Stale startup override')
      expect([...fixture.sections.values()][0]).toContain('Implement accessible UI')
      expect(fixture.register).toHaveBeenCalledTimes(1)
    } finally {
      await fixture.ctx.fiber.dispose()
      await fixture.agentCtx.fiber.dispose()
    }
  })

  it('only publishes the newest refresh and cannot reinstall after unload', async () => {
    const pending: ReturnType<typeof Promise.withResolvers<string>>[] = []
    let initial = true
    read.mockImplementation((path: unknown) => {
      if (path instanceof URL) return Promise.resolve('{{ROLE_TABLE}}')
      if (initial) { initial = false; return Promise.resolve(overlay('Initial policy')) }
      const request = Promise.withResolvers<string>()
      pending.push(request)
      return request.promise
    })
    const fixture = await policyFixture()
    const { ctx, plugin, sections, register } = fixture
    try {
      expect([...sections.values()][0]).toContain('Initial policy')
      ctx.emit('ai-agent-engine/roles-updated')
      await vi.waitFor(() => expect(pending).toHaveLength(1))
      ctx.emit('ai-agent-engine/roles-updated')
      await vi.waitFor(() => expect(pending).toHaveLength(2))
      pending[1]!.resolve(overlay('Newest policy'))
      await vi.waitFor(() => expect([...sections.values()][0]).toContain('Newest policy'))
      pending[0]!.resolve(overlay('Old slow policy'))
      await Promise.resolve()
      await Promise.resolve()
      expect([...sections.values()][0]).toContain('Newest policy')
      expect(register).toHaveBeenCalledTimes(2)

      ctx.emit('ai-agent-engine/roles-updated')
      await vi.waitFor(() => expect(pending).toHaveLength(3))
      await plugin.dispose()
      pending[2]!.resolve(overlay('After unload'))
      await Promise.resolve()
      await Promise.resolve()
      expect(sections.size).toBe(0)
      expect(register).toHaveBeenCalledTimes(2)
    } finally {
      await ctx.fiber.dispose()
      await fixture.agentCtx.fiber.dispose()
    }
  })

  it('does not re-register an unchanged policy', async () => {
    read.mockImplementation((path: unknown) => Promise.resolve(path instanceof URL ? '{{ROLE_TABLE}}' : overlay('Same policy')))
    const fixture = await policyFixture()
    try {
      fixture.ctx.emit('ai-agent-engine/roles-updated')
      await vi.waitFor(() => expect(read).toHaveBeenCalledTimes(4))
      expect(fixture.register).toHaveBeenCalledTimes(1)
    } finally {
      await fixture.ctx.fiber.dispose()
      await fixture.agentCtx.fiber.dispose()
    }
  })

  it('relays only role-switch changes from the owning bundle fiber to child consumers', async () => {
    const ctx = new Context()
    Object.assign(ctx, { typert: { register: vi.fn(() => () => {}) } })
    let parentCtx!: Context
    const received = vi.fn()
    const plugin = ctx.plugin(async scope => {
      parentCtx = scope
      await applyBundle(scope, {
        engineering: false, maxMembers: 8, rolesPath: '', updateFeed: '',
        rolesEnabled: { get: () => true }, conversationManagement: { get: () => true },
      } as Config)
      await scope.plugin(child => { child.on('ai-agent-engine/roles-updated', received) })
    })
    try {
      await plugin
      const self = Object.create(parentCtx)
      self[Context.filter] = (owner: Context) => owner.fiber === parentCtx.fiber
      parentCtx.emit(self, 'loader/volatile-update', [['conversationManagement']])
      expect(received).not.toHaveBeenCalled()
      parentCtx.emit(self, 'loader/volatile-update', [['rolesEnabled']])
      expect(received).toHaveBeenCalledTimes(1)
    } finally { await ctx.fiber.dispose() }
  })
})
