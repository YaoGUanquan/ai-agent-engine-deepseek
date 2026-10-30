import { Context } from '@deepseek-ai/cordis'
import TypertRegistry from '@deepseek-ai/dsh-typert-registry'
import { describe, expect, it } from 'vitest'
import { pluginRpc } from '../src/rpc.ts'

describe('plugin RPC registration', () => {
  it('registers both namespaces together and supports disposal and remount', async () => {
    const ctx = new Context()
    await ctx.plugin(TypertRegistry)
    const endpoints = [
      'aeConversations/delete',
      'aeConversations/deletePreview',
      'aeRoles/getCatalog',
      'aeRoles/getOverlay',
      'aeRoles/putOverlay',
      'aeRoles/restoreDefaults',
    ]
    try {
      for (let attempt = 0; attempt < 2; attempt++) {
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
        expect(ctx.typert.remotes.list()).toEqual([])
        expect(ctx.typert.local.list()).toEqual([])
      }
    } finally {
      await ctx.fiber.dispose()
    }
  })
})
