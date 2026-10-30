import { Context } from '@deepseek-ai/cordis'
import { remoteErrorOf } from '@deepseek-ai/dsh-typert-protocol'
import { describe, expect, it, vi } from 'vitest'
import { CompatibilityService } from '../src/compatibility-service.ts'
import { compatibilityRpc } from '../src/compatibility-rpc.ts'
import { initialModuleStatuses } from '../src/module-runtime.ts'

describe('read-only compatibility contract', () => {
  it('rejects non-owners and returns detached, schema-valid status to the owner', async () => {
    const ctx = new Context()
    const statuses = initialModuleStatuses()
    Object.assign(ctx, { typert: { register: vi.fn() } })
    const service = new CompatibilityService(ctx, { statuses })
    try {
      await expect(service.getStatus()).rejects.toSatisfy((error: unknown) =>
        remoteErrorOf(error)?.code === 'ae-compatibility/rejected')
      const owner = ctx.extend({ invocation: { peer: { principal: { kind: 'owner' } } } })
        .get('aeCompatibility') as CompatibilityService
      statuses.roles = { state: 'ready' }
      const snapshot = await owner.getStatus()
      const codec = compatibilityRpc.descriptors[0]!.result!
      if (codec.mode !== 'strict') throw new Error('Expected strict status codec')
      expect(codec.create().parse(snapshot)).toEqual(statuses)
      snapshot.roles.state = 'unavailable'
      expect(statuses.roles.state).toBe('ready')
    } finally { await ctx.fiber.dispose() }
  })
})
