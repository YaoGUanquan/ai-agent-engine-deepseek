/** Filesystem helpers for prompt-override.md (Host-only; separate from roles.json). */
import { PromptOverrideValidationError } from './prompt-override.ts';
/** Resolve overlay path: explicit path, else `$DSH_HOME/ai-agent-engine/prompt-override.md`. */
export declare function resolvePromptOverridePath(explicitPath?: string): string | undefined;
/** Read overlay for injection; missing/IO/invalid → undefined (no throw). */
export declare function readPromptOverride(path: string | undefined, warn?: (message: string, ...args: unknown[]) => void): Promise<{
    text?: string;
    path?: string;
}>;
/** Persist overlay atomically. Validates before any write. */
export declare function writePromptOverride(path: string, raw: unknown): Promise<string>;
/** Delete overlay file. Missing file is success. */
export declare function deletePromptOverride(path: string): Promise<void>;
export { PromptOverrideValidationError };
