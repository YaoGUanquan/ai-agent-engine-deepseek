import { describe, expect, it } from 'vitest'
import { Context, Service } from '@deepseek-ai/cordis'
import { wrapMethod } from '../src/runtime-method.ts'

declare module '@deepseek-ai/cordis' {
  interface Context { testRegistry: TestRegistry }
}

class TestRegistry extends Service {
  constructor(ctx: Context) { super(ctx, 'testRegistry') }
  owner() { return this.ctx.fiber }
}

describe('plugin runtime adaptation', () => {
  it('preserves the accessing Cordis fiber and restores the original service method', async () => {
    const ctx = new Context()
    const provider = ctx.plugin(TestRegistry)
    await provider.await()
    const registry = ctx.get('testRegistry')!
    const original = Object.getPrototypeOf(registry).owner
    let observed = 0
    const dispose = wrapMethod(registry, 'owner', method => function (this: TestRegistry) {
      observed++
      return method.call(this)
    })
    const caller = ctx.plugin({ inject: ['testRegistry'], apply(callerCtx: Context) {
      expect(callerCtx.testRegistry.owner()).toBe(callerCtx.fiber)
    },
    })
    await caller.await()
    expect(observed).toBe(1)
    dispose()
    expect(Object.hasOwn(registry, 'owner')).toBe(false)
    expect(Object.getPrototypeOf(registry).owner).toBe(original)
    await ctx.fiber.dispose()
  })

  it('becomes transparent if another extension still holds its wrapper on unload', () => {
    const service = { read: (value: number) => value }
    let calls = 0
    const stop = wrapMethod(service, 'read', original => value => { calls++; return original(value) + 1 })
    const outer = wrapMethod(service, 'read', original => value => original(value) * 2)
    expect(service.read(3)).toBe(8)
    stop()
    expect(service.read(3)).toBe(6)
    expect(calls).toBe(1)
    outer()
    expect(service.read(3)).toBe(3)
  })
})
