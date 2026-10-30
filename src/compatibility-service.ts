import type { Context } from '@deepseek-ai/cordis'
import { Remote, RemoteError, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import type { ModuleStatuses } from './module-runtime.ts'

declare module '@deepseek-ai/dsh-typert-protocol' {
  interface RemoteErrorDetailsMap { 'ae-compatibility/rejected': {} }
}

export class CompatibilityService extends TypertRemoteService {
  static inject = ['typert']

  constructor(ctx: Context, private readonly config: { statuses: ModuleStatuses }) {
    super(ctx, 'aeCompatibility')
  }

  @Remote('getStatus')
  async getStatus(_request: Record<string, never> = {}): Promise<ModuleStatuses> {
    if (this.ctx.invocation?.peer.principal.kind !== 'owner') {
      throw new RemoteError('ae-compatibility/rejected', 'Only the Host owner can inspect module status', {})
    }
    return structuredClone(this.config.statuses)
  }
}
