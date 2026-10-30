/** Builtin engineering roles and user overlay merge for Lead policy. */
/** One spawnable engineering role consumed by Lead policy text. */
export interface RoleDefinition {
    readonly id: string;
    readonly skill?: string;
    readonly responsibility?: string;
}
/** Overlay entry written under `$DSH_HOME/ai-agent-engine/roles.json`. */
export interface RoleOverlayEntry {
    readonly id: string;
    readonly skill?: string;
    readonly responsibility?: string;
}
export interface RolesFile {
    readonly version: 1;
    readonly roles: readonly RoleOverlayEntry[];
}
export interface RoleCatalogOptions {
    /** When false, skip overlay and return builtin seed only. */
    readonly enabled: boolean;
    /** Absolute path override; empty/undefined uses `$DSH_HOME/ai-agent-engine/roles.json`. */
    readonly path?: string;
    readonly warn?: (message: string, ...args: unknown[]) => void;
}
export interface RoleCatalogResult {
    readonly roles: readonly RoleDefinition[];
    readonly source: 'builtin' | 'merged';
    readonly path?: string;
}
/** Packaged defaults; package upgrades refresh these, overlay only overrides recorded fields. */
export declare const BUILTIN_ROLES: readonly RoleDefinition[];
export declare function isValidRoleId(id: unknown): id is string;
/** Validate one overlay row; returns undefined when the row must be skipped. */
export declare function normalizeOverlayEntry(raw: unknown, warn: (message: string, ...args: unknown[]) => void): RoleOverlayEntry | undefined;
/**
 * Deep-merge overlay fields onto builtin seed by id; unknown ids append.
 * Builtin text remains the base so package upgrades refresh unoverridden fields.
 * Returns a fresh array of fresh objects — never mutates `builtin` or `overlay`.
 */
export declare function mergeRoleCatalog(builtin: readonly RoleDefinition[], overlay: readonly RoleOverlayEntry[]): RoleDefinition[];
/** Parse roles.json; corrupt or illegal documents return undefined (caller falls back). */
export declare function parseRolesFile(text: string, warn: (message: string, ...args: unknown[]) => void): RoleOverlayEntry[] | undefined;
/** English list used in Lead naming guidance. */
export declare function formatRoleIds(roles: readonly RoleDefinition[]): string;
/** Markdown skills table for Lead policy. */
export declare function formatRoleTable(roles: readonly RoleDefinition[]): string;
/**
 * Substitute `{{ROLE_IDS}}` and `{{ROLE_TABLE}}` in the packaged lead template.
 * Unknown placeholders are left intact. Returns a new string; template is not mutated.
 */
export declare function renderLeadPolicy(template: string, roles: readonly RoleDefinition[]): string;
export declare class RoleOverlayValidationError extends Error {
    readonly code: "ae-roles/invalid-overlay";
    constructor(message: string);
}
/**
 * Validate a candidate overlay document.
 * Fail-closed: any illegal row or structure throws RoleOverlayValidationError.
 */
export declare function validateRolesFile(raw: unknown): RolesFile;
/**
 * Build a true overlay from an edited merged catalog: only dirty fields and
 * custom ids are recorded so package upgrades still refresh unoverridden fields.
 */
export declare function diffRolesAgainstBuiltin(edited: readonly RoleDefinition[], builtin?: readonly RoleDefinition[]): RoleOverlayEntry[];
