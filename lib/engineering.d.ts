import type { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
export declare const name = "ai-agent-engine-engineering";
export declare const inject: string[];
export declare const Config: z<Schemastery.ObjectS<NoInfer<{
    teamTools: z<boolean, boolean, "defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    teamTools: z<boolean, boolean, "defined">;
}>>, "plain">;
/** Install policy in each Standard or engineering Agent's own scope. */
export declare function apply(ctx: Context, config: {
    teamTools: boolean;
}): Promise<void>;
