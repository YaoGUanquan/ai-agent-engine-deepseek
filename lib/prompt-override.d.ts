/** Pure validation for the jailbreak prompt-override overlay (not roles.json). */
export declare const DEFAULT_PROMPT_OVERRIDE_RELATIVE: readonly ["ai-agent-engine", "prompt-override.md"];
export declare const MAX_PROMPT_OVERRIDE_CHARS: number;
export declare class PromptOverrideValidationError extends Error {
    readonly code: "ae-capability/invalid-prompt";
    constructor(message: string);
}
/** Fail-closed validation before persist. Empty string is allowed (clears overlay body). */
export declare function validatePromptOverrideText(raw: unknown): string;
/** Read-side isolation: corrupt/oversized → undefined (caller skips injection). */
export declare function normalizePromptOverrideForRead(raw: string, warn?: (message: string, ...args: unknown[]) => void): string | undefined;
