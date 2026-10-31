import type { RemoteResult, TypertRemoteContribution } from '@deepseek-ai/dsh-typert-protocol'
import { z } from 'zod'
import type { ModuleStatuses } from './module-runtime.ts'

const status = z.strictObject({
  state: z.enum(['waiting', 'ready', 'unavailable']),
  reason: z.enum(['services', 'interface', 'initialization', 'storage']).optional(),
})

export interface CompatibilityRemote {
  getStatus(request: Record<string, never>): Promise<RemoteResult<ModuleStatuses>>
}

declare module '@deepseek-ai/cordis' {
  interface Context { 'remote.aeCompatibility': CompatibilityRemote }
}

export const compatibilityRpc: TypertRemoteContribution = {
  package: 'ai-agent-engine-deepseek',
  descriptors: [{
    id: 'ai-agent-engine-deepseek#aeCompatibility/getStatus',
    service: 'aeCompatibility', namespace: 'aeCompatibility', method: 'getStatus',
    invocation: { kind: 'direct' },
    parameters: [{
      name: 'request', wire: 'request', source: 'json',
      codec: { mode: 'strict', typeSymbol: 'ai-agent-engine-deepseek#statusRequest', create: () => z.strictObject({}) },
    }],
    result: {
      mode: 'strict', typeSymbol: 'ai-agent-engine-deepseek#statusResult',
      create: () => z.strictObject({ engineering: status, roles: status, capability: status, deletion: status }),
    },
  }],
}
