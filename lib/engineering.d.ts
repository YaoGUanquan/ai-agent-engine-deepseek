import type { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
export declare const name = "ai-agent-engine-engineering";
export declare const inject: string[];
export interface EngineeringConfig {
    teamTools: boolean;
    /** Boolean snapshot or live getter from Host volatile Config. */
    rolesEnabled?: boolean | (() => boolean);
    rolesPath?: string;
}
/** teamTools is schema-checked; rolesEnabled may be a getter (z.any). */
export declare const Config: z<Schemastery.ObjectS<NoInfer<{
    teamTools: z<boolean, boolean, "defined">;
    rolesEnabled: z<any, any, "defined">;
    rolesPath: z<string, string, "defined">;
}>>, Schemastery.ObjectT<NoInfer<{
    teamTools: z<boolean, boolean, "defined">;
    rolesEnabled: z<any, any, "defined">;
    rolesPath: z<string, string, "defined">;
}>>, "plain">;
/** Build Lead policy from the packaged template and the current role catalog. */
export declare function buildEngineeringPolicy(config: Pick<EngineeringConfig, 'rolesEnabled' | 'rolesPath'>, warn?: (message: string, ...args: unknown[]) => void): Promise<string>;
/** Install policy in each Standard or engineering Agent's own scope. */
export declare function apply(ctx: Context, config: EngineeringConfig): Promise<void>;
