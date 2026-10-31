/** Resolve optional systemPrompt sections for enhance / jailbreak (no host patches). */
export interface CapabilityPolicyOptions {
    readonly capabilityEnhanceEnabled: boolean;
    readonly jailbreakEnabled: boolean;
    /** Empty → `$DSH_HOME/ai-agent-engine/prompt-override.md`. */
    readonly jailbreakPromptPath?: string;
    /**
     * Inline cover text from Config. When non-empty and jailbreak is on, preferred
     * over the overlay file. Empty → read overlay file.
     */
    readonly jailbreakPrompt?: string;
    /** Empty or `default` → builtin enhance text; unknown → isolate (no enhance). */
    readonly enhanceProfile?: string;
    readonly warn?: (message: string, ...args: unknown[]) => void;
}
export interface CapabilityPolicySections {
    readonly enhanceText?: string;
    readonly overrideText?: string;
    readonly overridePath?: string;
    readonly enhanceSkipped?: 'profile';
    readonly overrideSkipped?: 'empty' | 'invalid' | 'path';
}
/** Pure resolve used by Host apply and unit tests. */
export declare function resolveCapabilityPolicySections(options: CapabilityPolicyOptions): Promise<CapabilityPolicySections>;
