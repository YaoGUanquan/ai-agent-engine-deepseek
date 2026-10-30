import type { Context } from '@deepseek-ai/cordis';
export type ModuleId = 'engineering' | 'roles' | 'deletion';
export interface ModuleStatus {
    state: 'waiting' | 'ready' | 'unavailable';
    reason?: 'services' | 'interface' | 'initialization' | 'storage';
}
export type ModuleStatuses = Record<ModuleId, ModuleStatus>;
export type RequiredMethods = Record<string, readonly string[]>;
export declare function initialModuleStatuses(): ModuleStatuses;
export declare class UnsupportedInterface extends Error {
}
/** Check the whole interface before installing effects or touching storage. */
export declare function requireMethods(ctx: Context, requirements: RequiredMethods): void;
/** Each feature owns a disposable scope; startup failures never escape to the app. */
export declare function mountModule(ctx: Context, id: ModuleId, services: string[], requirements: RequiredMethods, statuses: ModuleStatuses, setup: (scope: Context) => Promise<void | false>): void;
