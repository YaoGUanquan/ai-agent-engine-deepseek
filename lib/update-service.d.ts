import type { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { UpdateStateView } from './update-contract.ts';
declare module '@deepseek-ai/cordis' {
    interface Context {
        aeUpdate: UpdateService;
    }
}
declare module '@deepseek-ai/dsh-typert-protocol' {
    interface RemoteErrorDetailsMap {
        'ae-update/rejected': {};
        'ae-update/unavailable': {};
    }
}
/**
 * Host-owned updater for this plugin.
 *
 * It never edits Harness or another plugin. Two channels are supported: a
 * package install (download the release tarball, then let the Host plugin
 * manager install it) and a git checkout (fetch and `--ff-only` merge the
 * upstream, then rebuild). Both end with a restart notice because Host code is
 * loaded at composition time.
 */
export declare class UpdateService extends TypertRemoteService {
    private readonly config;
    static inject: string[];
    private readonly root;
    private phase;
    private message;
    private error;
    private latest;
    private checkedAt;
    private pendingCommits;
    private restartRequired;
    private blocked;
    private busy;
    constructor(ctx: Context, config: {
        pluginName: string;
        feed: string;
        repository: string;
        root?: string;
    });
    private authorize;
    private service;
    private profile;
    private manifestDir;
    private manifest;
    private currentVersion;
    /** Version of the running Harness runtime, read without importing Host packages. */
    private runtimeVersion;
    private runtimeSupport;
    /** The saved profile dependency value for this plugin, shown as the install origin. */
    private installSpec;
    private channel;
    private checkoutRoot;
    private cacheRoot;
    private outdated;
    private view;
    getState(_request?: Record<string, never>): Promise<UpdateStateView>;
    check(_request?: Record<string, never>): Promise<UpdateStateView>;
    apply(_request?: Record<string, never>): Promise<UpdateStateView>;
    private fetchRelease;
    private run;
    private runPackage;
    private verify;
    private readText;
    private download;
    private checkCheckout;
    private upstream;
    private runCheckout;
    private git;
    private exec;
}
