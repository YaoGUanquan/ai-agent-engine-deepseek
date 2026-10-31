import type { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { CapabilityOverrideView, CapabilityPutOverrideRequest, CapabilityPutOverrideResult, CapabilityRestoreResult, CapabilityStatusView } from './capability-contract.ts';
declare module '@deepseek-ai/cordis' {
    interface Context {
        aeCapability: CapabilityPolicyService;
    }
    interface Events {
        'ai-agent-engine/capability-updated': () => void;
    }
}
declare module '@deepseek-ai/dsh-typert-protocol' {
    interface RemoteErrorDetailsMap {
        'ae-capability/rejected': {};
        'ae-capability/invalid-prompt': {};
        'ae-capability/path-unavailable': {};
    }
}
/** Host RPC for prompt-override file; switches live in plugin Config. */
export declare class CapabilityPolicyService extends TypertRemoteService {
    private readonly config;
    static inject: string[];
    constructor(ctx: Context, config: {
        capabilityEnhanceEnabled: () => boolean;
        jailbreakEnabled: () => boolean;
        jailbreakPromptPath: string;
        enhanceProfile: () => string;
    });
    private authorize;
    private resolvePath;
    private emitUpdated;
    getStatus(_request?: Record<string, never>): Promise<CapabilityStatusView>;
    getOverride(_request?: Record<string, never>): Promise<CapabilityOverrideView>;
    putOverride(request: CapabilityPutOverrideRequest): Promise<CapabilityPutOverrideResult>;
    restoreOverride(_request?: Record<string, never>): Promise<CapabilityRestoreResult>;
}
