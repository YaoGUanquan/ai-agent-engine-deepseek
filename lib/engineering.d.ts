import type { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
export declare const name = "ai-agent-engine-engineering";
export declare const inject: string[];
export interface EngineeringConfig {
    teamTools: boolean;
    /** Boolean snapshot or live getter from Host volatile Config. */
    rolesEnabled?: boolean | (() => boolean);
    rolesPath?: string;
    capabilityEnhanceEnabled?: boolean | (() => boolean);
    jailbreakEnabled?: boolean | (() => boolean);
    enhanceProfile?: string;
    jailbreakPromptPath?: string;
    jailbreakPrompt?: string;
}
/** teamTools is schema-checked; live getters use z.any. */
export declare const Config: z<Schemastery.ObjectS<NoInfer<{
    teamTools: z<boolean, boolean, "defined">;
    rolesEnabled: z<any, any, "defined">;
    rolesPath: z<string, string, "defined">;
    capabilityEnhanceEnabled: z<any, any, "defined">;
    jailbreakEnabled: z<any, any, "defined">;
    enhanceProfile: z<string, string, "defined">;
    jailbreakPromptPath: z<string, string, "defined">;
    jailbreakPrompt: z<string, string, "defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    teamTools: z<boolean, boolean, "defined">;
    rolesEnabled: z<any, any, "defined">;
    rolesPath: z<string, string, "defined">;
    capabilityEnhanceEnabled: z<any, any, "defined">;
    jailbreakEnabled: z<any, any, "defined">;
    enhanceProfile: z<string, string, "defined">;
    jailbreakPromptPath: z<string, string, "defined">;
    jailbreakPrompt: z<string, string, "defined">;
}>>, "plain">;
/** Build Lead policy from the packaged template and the current role catalog. */
export declare function buildEngineeringPolicy(config: Pick<EngineeringConfig, 'rolesEnabled' | 'rolesPath'>, warn?: (message: string, ...args: unknown[]) => void): Promise<string>;
type SectionBag = {
    enhance?: string;
    override?: string;
};
/**
 * Resolve optional enhance / jailbreak sections.
 * Order among our sections (documented): Lead(700) → jailbreak overlay(740) → enhance(780).
 * OFF switches fully bypass (no section registration).
 */
export declare function buildCapabilitySections(config: Pick<EngineeringConfig, 'capabilityEnhanceEnabled' | 'jailbreakEnabled' | 'enhanceProfile' | 'jailbreakPromptPath' | 'jailbreakPrompt'>, warn?: (message: string, ...args: unknown[]) => void): Promise<SectionBag>;
/** Install policy in each Standard or engineering Agent's own scope. */
export declare function apply(ctx: Context, config: EngineeringConfig): Promise<void>;
export {};
