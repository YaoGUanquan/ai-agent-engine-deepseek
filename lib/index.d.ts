import type { Context, Volatile } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
import type { Config as PluginConfig } from './types.ts';
export declare const name = "ai-agent-engine";
export declare const inject: string[];
export interface Config extends Omit<PluginConfig, 'conversationManagement'> {
    conversationManagement: Volatile<boolean>;
}
export declare const Config: z<Schemastery.ObjectS<NoInfer<{
    engineering: z<boolean, boolean, "defined">;
    conversationManagement: z<boolean, boolean, "volatile-defined">;
    maxMembers: z<number, number, "defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    engineering: z<boolean, boolean, "defined">;
    conversationManagement: z<boolean, boolean, "volatile-defined">;
    maxMembers: z<number, number, "defined">;
}>>, "plain">;
/** Install an optional native preset without changing the selected default. */
export declare function apply(ctx: Context, config: Config): Promise<void>;
