import { describe, expect, it } from 'vitest'
import { capabilityRpc } from '../src/capability-rpc.ts'
import { pluginRpc } from '../src/rpc.ts'
import { Context } from '@deepseek-ai/cordis'
import TypertRegistry from '@deepseek-ai/dsh-typert-registry'

describe('aeCapability RPC', () => {
  it('owns aeCapability methods with strict codecs', () => {
    const methods = Object.fromEntries(capabilityRpc.descriptors.map(entry => [entry.method, entry]))
    expect(Object.keys(methods).sort()).toEqual([
      'getOverride', 'getStatus', 'putOverride', 'restoreOverride',
    ])
    for (const method of Object.values(methods)) {
      expect(method.namespace).toBe('aeCapability')
      expect(method.service).toBe('aeCapability')
    }
    const put = methods.putOverride!
    const codec = put.parameters[0]!.codec
    if (codec.mode !== 'strict') throw new Error('Strict Remote codecs are required')
    expect(codec.create().parse({ text: 'ok' })).toEqual({ text: 'ok' })
    expect(() => codec.create().parse({ text: 'ok', extra: true })).toThrow()
  })

  it('is included in the shared pluginRpc registration', async () => {
    const ctx = new Context()
    await ctx.plugin(TypertRegistry)
    const endpoints = [
      'aeConversations/delete',
      'aeConversations/deletePreview',
      'aeRoles/getCatalog',
      'aeRoles/getOverlay',
      'aeRoles/putOverlay',
      'aeRoles/restoreDefaults',
      'aeCompatibility/getStatus',
      'aeCapability/getStatus',
      'aeCapability/getOverride',
      'aeCapability/putOverride',
      'aeCapability/restoreOverride',
    ]
    try {
      const disposeHost = ctx.typert.register({
        package: pluginRpc.package, face: 'host', schemas: [],
        model: { services: [], events: [], objects: [] },
        invocations: pluginRpc.descriptors,
      })
      const disposeRemote = ctx.typert.remotes.register(pluginRpc)
      for (const endpoint of endpoints) {
        expect(ctx.typert.local.get(endpoint)).toBeDefined()
        expect(ctx.typert.remotes.get(endpoint)).toBeDefined()
      }
      expect(ctx.typert.remotes.list()).toHaveLength(endpoints.length)
      await disposeRemote()
      await disposeHost()
    } finally {
      await ctx.fiber.dispose()
    }
  })
})
