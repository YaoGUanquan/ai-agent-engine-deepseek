export interface DesktopRuntimeProfile {
    home?: string;
    packageManager?: {
        command: string;
        args: readonly string[];
        env?: Readonly<Record<string, string>>;
    };
}
export declare class DesktopRuntimeError extends Error {
}
/** Repair only the known packaged Windows layout, after an owner requests installation. */
export declare function ensureDesktopRuntime(profile: DesktopRuntimeProfile, environment?: {
    platform: NodeJS.Platform;
    arch: NodeJS.Architecture;
    executable: string;
}): Promise<boolean>;
