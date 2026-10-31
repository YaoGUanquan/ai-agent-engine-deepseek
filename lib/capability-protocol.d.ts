/**
 * In-plugin capability-selection + collaboration/verification guidance.
 * Rewritten for this plugin; not a copy of third-party jailbreak personas
 * or APEX preset bodies. APEX (MIT) inspired the idea of optional,
 * default-off controllable strategy text — see NOTICE.md.
 */
export declare const CAPABILITY_ENHANCE_SECTION = "ai-agent-engine:capability-enhance";
export declare const PROMPT_OVERRIDE_SECTION = "ai-agent-engine:prompt-override";
/** Built-in enhance profile ids accepted when capabilityEnhanceEnabled is on. */
export declare const ENHANCE_PROFILES: readonly ["default"];
export type EnhanceProfileId = (typeof ENHANCE_PROFILES)[number];
export declare function isKnownEnhanceProfile(value: unknown): value is EnhanceProfileId | '';
/**
 * Short controllable strategy: skill/tool selection, light collaboration, and
 * evidence-oriented verification. Does not register tools, deny hooks, or
 * patch the host; does not install an independent APEX mode or browser suite.
 */
export declare function capabilityEnhanceText(profile?: string): string;
