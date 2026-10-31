import type { Context, Volatile } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
import type { Config as PluginConfig } from './types.ts';
export declare const name = "ai-agent-engine";
export declare const inject: string[];
export interface Config extends Omit<PluginConfig, 'conversationManagement' | 'rolesEnabled' | 'capabilityEnhanceEnabled' | 'jailbreakEnabled' | 'enhanceProfile'> {
    conversationManagement: Volatile<boolean>;
    rolesEnabled: Volatile<boolean>;
    capabilityEnhanceEnabled: Volatile<boolean>;
    jailbreakEnabled: Volatile<boolean>;
    enhanceProfile: Volatile<string>;
}
export declare const Config: z<Schemastery.ObjectS<NoInfer<{
    engineering: z<boolean, boolean, "defined">;
    conversationManagement: z<boolean, boolean, "volatile-defined">;
    maxMembers: z<number, number, "defined">;
    rolesEnabled: z<boolean, boolean, "volatile-defined">;
    rolesPath: z<string, string, "defined">;
    capabilityEnhanceEnabled: z<boolean, boolean, "volatile-defined">;
    jailbreakEnabled: z<boolean, boolean, "volatile-defined">;
    enhanceProfile: z<string, string, "volatile-defined">;
    jailbreakPromptPath: z<string, string, "defined">;
    jailbreakPrompt: z<string, string, "defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    engineering: z<boolean, boolean, "defined">;
    conversationManagement: z<boolean, boolean, "volatile-defined">;
    maxMembers: z<number, number, "defined">;
    rolesEnabled: z<boolean, boolean, "volatile-defined">;
    rolesPath: z<string, string, "defined">;
    capabilityEnhanceEnabled: z<boolean, boolean, "volatile-defined">;
    jailbreakEnabled: z<boolean, boolean, "volatile-defined">;
    enhanceProfile: z<string, string, "volatile-defined">;
    jailbreakPromptPath: z<string, string, "defined">;
    jailbreakPrompt: z<string, string, "defined">;
}>>, "plain">;
/** Install an optional native preset without changing the selected default. */
export declare function apply(ctx: Context, config: Config): Promise<void>;
