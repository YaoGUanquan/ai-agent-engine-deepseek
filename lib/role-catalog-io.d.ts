/** Filesystem helpers for the roles.json overlay (Host-only). */
import { type RoleCatalogOptions, type RoleCatalogResult, type RolesFile } from './role-catalog.ts';
/** Resolve overlay path: explicit `rolesPath`, else `$DSH_HOME/ai-agent-engine/roles.json`. */
export declare function resolveRolesFilePath(rolesPath?: string): string | undefined;
/** Read raw overlay document without merging; missing file returns undefined. */
export declare function readOverlayDocument(path: string, warn?: (message: string, ...args: unknown[]) => void): Promise<RolesFile | undefined>;
/** Persist overlay atomically (temp + rename). Validates before any write. */
export declare function writeRolesFile(path: string, raw: unknown): Promise<RolesFile>;
/** Delete overlay file. Missing file is success (restore defaults). */
export declare function deleteRolesFile(path: string): Promise<void>;
/** Load and merge overlay when enabled; never throws for IO or parse failures. */
export declare function resolveRoleCatalog(options: RoleCatalogOptions): Promise<RoleCatalogResult>;
