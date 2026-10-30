import type { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { RolesCatalogView, RolesOverlayView, RolesPutRequest, RolesPutResult, RolesRestoreResult } from './roles-contract.ts';
declare module '@deepseek-ai/cordis' {
    interface Context {
        aeRoles: RoleCatalogService;
    }
    interface Events {
        'ai-agent-engine/roles-updated': () => void;
    }
}
declare module '@deepseek-ai/dsh-typert-protocol' {
    interface RemoteErrorDetailsMap {
        'ae-roles/rejected': {};
        'ae-roles/invalid-overlay': {};
        'ae-roles/path-unavailable': {};
    }
}
/** Host-owned read/write surface for the single roles.json overlay. */
export declare class RoleCatalogService extends TypertRemoteService {
    private readonly config;
    static inject: string[];
    constructor(ctx: Context, config: {
        enabled: () => boolean;
        rolesPath: string;
    });
    private authorize;
    private resolvePath;
    private warn;
    private emitUpdated;
    getCatalog(_request?: Record<string, never>): Promise<RolesCatalogView>;
    getOverlay(_request?: Record<string, never>): Promise<RolesOverlayView>;
    putOverlay(request: RolesPutRequest): Promise<RolesPutResult>;
    restoreDefaults(_request?: Record<string, never>): Promise<RolesRestoreResult>;
}
