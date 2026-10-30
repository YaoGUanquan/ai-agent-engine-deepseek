import type { RemoteResult, TypertRemoteContribution } from '@deepseek-ai/dsh-typert-protocol';
import type { ModuleStatuses } from './module-runtime.ts';
export interface CompatibilityRemote {
    getStatus(request: Record<string, never>): Promise<RemoteResult<ModuleStatuses>>;
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        'remote.aeCompatibility': CompatibilityRemote;
    }
}
export declare const compatibilityRpc: TypertRemoteContribution;
