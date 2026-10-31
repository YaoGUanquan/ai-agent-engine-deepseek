/** Independent module switches and the native Team roster limit. */
export interface Config {
    engineering: boolean;
    conversationManagement: boolean;
    maxMembers: number;
    /** When false, Lead policy uses packaged builtin roles only. */
    rolesEnabled: boolean;
    /**
     * Absolute overlay path. Empty uses `$DSH_HOME/ai-agent-engine/roles.json`.
     * Not workspace `.ai-agent-engine/` (that path remains deletion journals only).
     */
    rolesPath: string;
    /** Model capability enhance master switch (default off). */
    capabilityEnhanceEnabled: boolean;
    /** Jailbreak prompt-override master switch (default off). */
    jailbreakEnabled: boolean;
    /**
     * Optional enhance profile id. Empty / `default` → builtin text.
     * Unknown values are isolated (enhance skipped).
     */
    enhanceProfile: string;
    /**
     * Optional absolute path for prompt-override.md.
     * Empty → `$DSH_HOME/ai-agent-engine/prompt-override.md`.
     */
    jailbreakPromptPath: string;
    /**
     * Optional inline jailbreak cover text. When non-empty and jailbreak is on,
     * preferred over the overlay file. Empty → read overlay file.
     */
    jailbreakPrompt: string;
}
