import { describe, expect, it } from 'vitest'
import { deletionRpc } from '../src/deletion-rpc.ts'

describe('plugin-owned deletion interface', () => {
  it('owns its namespace and rejects undeclared fields and invalid confirmation', () => {
    const preview = deletionRpc.descriptors.find(method => method.method === 'deletePreview')!
    const execute = deletionRpc.descriptors.find(method => method.method === 'delete')!
    expect(preview.namespace).toBe('aeConversations')
    expect(execute.namespace).toBe('aeConversations')
    const request = preview.parameters[0].codec
    const confirmed = execute.parameters[0].codec
    if (request.mode !== 'strict' || confirmed.mode !== 'strict') throw new Error('Strict Remote codecs are required')
    expect(request.create().parse({ sessionId: 'fixture' })).toEqual({ sessionId: 'fixture' })
    expect(() => request.create().parse({ sessionId: '../fixture', path: '/other' })).toThrow()
    expect(() => confirmed.create().parse({
      sessionId: 'fixture', sessionIds: ['fixture'], fingerprint: '0'.repeat(64),
      runningSessionIds: [], stopRunning: false,
    })).toThrow()
  })
})
