import type { RemoteResult, TypertRemoteContribution } from '@deepseek-ai/dsh-typert-protocol'
import { enum as z_enum, strictObject as z_strictObject } from 'zod'
import type { ModuleStatuses } from './module-runtime.ts'

const status = z_strictObject({
  state: z_enum(['waiting', 'ready', 'unavailable']),
  reason: z_enum(['services', 'interface', 'initialization', 'storage']).optional(),
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
      codec: { mode: 'strict', typeSymbol: 'ai-agent-engine-deepseek#statusRequest', create: () => z_strictObject({}) },
    }],
    result: {
      mode: 'strict', typeSymbol: 'ai-agent-engine-deepseek#statusResult',
      create: () => z_strictObject({ engineering: status, roles: status, deletion: status, update: status }),
    },
  }],
}
