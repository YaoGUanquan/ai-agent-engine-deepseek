import { describe, expect, it } from 'vitest'
import { rolesRpc } from '../src/roles-rpc.ts'

describe('plugin-owned roles interface', () => {
  it('owns aeRoles namespace and rejects undeclared put fields', () => {
    const methods = Object.fromEntries(rolesRpc.descriptors.map(entry => [entry.method, entry]))
    expect(Object.keys(methods).sort()).toEqual(['getCatalog', 'getOverlay', 'putOverlay', 'restoreDefaults'])
    for (const method of Object.values(methods)) {
      expect(method.namespace).toBe('aeRoles')
      expect(method.service).toBe('aeRoles')
    }
    const put = methods.putOverlay!
    const codec = put.parameters[0]!.codec
    if (codec.mode !== 'strict') throw new Error('Strict Remote codecs are required')
    expect(codec.create().parse({
      version: 1,
      roles: [{ id: 'frontend', responsibility: 'ok' }],
    })).toEqual({
      version: 1,
      roles: [{ id: 'frontend', responsibility: 'ok' }],
    })
    expect(() => codec.create().parse({
      version: 1,
      roles: [{ id: 'frontend', responsibility: 'ok', extra: true }],
    })).toThrow()
    expect(() => codec.create().parse({
      version: 1,
      roles: [{ id: 'lead', responsibility: 'nope' }],
    })).toThrow()
  })
})
