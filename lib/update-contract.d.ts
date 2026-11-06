/**
 * Wire contracts for the `aeUpdate` remote surface.
 *
 * Browser-safe by design: types only, no Node imports, so the client bundle can
 * import it without pulling host code.
 */
export type UpdateChannel = 'package' | 'checkout';
export type UpdatePhase = 'idle' | 'checking' | 'downloading' | 'installing' | 'rebuilding' | 'applied' | 'failed';
export type UpdateBlocked = 'busy' | 'no-plugin-manager' | 'no-release' | 'no-asset' | 'checksum-mismatch' | 'incompatible-version' | 'dirty-worktree' | 'no-upstream' | 'no-update';
/** How the running Host compares with the range this build was verified against. */
export type RuntimeSupport = 'verified' | 'untested-newer' | 'untested-older' | 'unknown';
export interface UpdateReleaseView {
    readonly version: string;
    readonly tag: string;
    readonly notes?: string;
    readonly pageUrl?: string;
    readonly assetUrl?: string;
    readonly assetName?: string;
    readonly checksumUrl?: string;
    readonly publishedAt?: string;
}
export interface UpdateStateView {
    readonly pluginName: string;
    readonly currentVersion: string;
    /** Version of the running Harness runtime, when the Host exposes it. */
    readonly runtimeVersion?: string;
    /** Highest Host version this build was verified against. */
    readonly verifiedThrough?: string;
    readonly runtimeSupport: RuntimeSupport;
    readonly channel: UpdateChannel;
    readonly installSpec?: string;
    readonly latest?: UpdateReleaseView;
    /** Upstream commits the plugin checkout is behind, for the checkout channel. */
    readonly pendingCommits?: number;
    readonly outdated: boolean;
    readonly canApply: boolean;
    readonly blocked?: UpdateBlocked;
    readonly phase: UpdatePhase;
    readonly message?: string;
    readonly error?: string;
    readonly restartRequired: boolean;
    readonly checkedAt?: number;
}
export interface UpdateRemote {
    getState(request?: Record<string, never>): Promise<UpdateStateView>;
    check(request?: Record<string, never>): Promise<UpdateStateView>;
    apply(request?: Record<string, never>): Promise<UpdateStateView>;
}
