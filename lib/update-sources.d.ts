/**
 * Version helpers and release discovery for this plugin's own updater.
 *
 * Host-only: the browser half never downloads anything. Everything here is
 * deterministic given a feed document, so it can be tested without network by
 * pointing the feed at a `file:` URL.
 */
/** Official channel: the repository's latest published GitHub release. */
export declare const DEFAULT_FEED = "https://api.github.com/repos/YaoGUanquan/ai-agent-engine-deepseek/releases/latest";
export interface ParsedVersion {
    readonly major: number;
    readonly minor: number;
    readonly patch: number;
    readonly prerelease: readonly (string | number)[];
}
export declare function parseVersion(input: string): ParsedVersion | undefined;
/** Semver precedence, including prerelease ordering and a leading `v`. */
export declare function compareVersions(left: string, right: string): number;
export declare function releaseVersionOf(tag: string): string;
export interface ReleaseView {
    readonly version: string;
    readonly tag: string;
    readonly notes?: string;
    readonly pageUrl?: string;
    readonly assetUrl?: string;
    readonly assetName?: string;
    readonly checksumUrl?: string;
    readonly publishedAt?: string;
}
export type SourceProblem = 'network' | 'invalid-feed' | 'no-release';
export declare class UpdateSourceError extends Error {
    readonly problem: SourceProblem;
    constructor(problem: SourceProblem, message: string);
}
export interface FeedOptions {
    /** Feed URL; defaults to the official channel. `file:` URLs read a local document. */
    readonly feed?: string;
    readonly timeoutMs?: number;
    readonly userAgent?: string;
    /** Injection seam for tests and proxies. */
    readonly fetchImpl?: typeof fetch;
}
/** Normalize a GitHub release document, or a hand-written `{ version, assets }` one. */
export declare function normalizeRelease(payload: unknown): ReleaseView;
/** Read the latest published release from the configured feed. */
export declare function fetchLatestRelease(options?: FeedOptions): Promise<ReleaseView>;
/** Extract the checksum line for one asset from a `SHA256SUMS` document. */
export declare function parseChecksum(document: string, fileName: string): string | undefined;
export declare function sha256File(path: string): Promise<string>;
