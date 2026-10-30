import type { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { ModuleStatuses } from './module-runtime.ts';
declare module '@deepseek-ai/dsh-typert-protocol' {
    interface RemoteErrorDetailsMap {
        'ae-compatibility/rejected': {};
    }
}
export declare class CompatibilityService extends TypertRemoteService {
    private readonly config;
    static inject: string[];
    constructor(ctx: Context, config: {
        statuses: ModuleStatuses;
    });
    getStatus(_request?: Record<string, never>): Promise<ModuleStatuses>;
}
