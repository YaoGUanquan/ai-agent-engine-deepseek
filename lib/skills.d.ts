import type { Context } from '@deepseek-ai/cordis';
export declare const skillNames: readonly ["ae-grill", "ae-frontend", "ae-backend", "ae-unit-test", "ae-integration-test", "ae-e2e-test", "ae-e2e-suite"];
/** Register packaged skills; the local project retains normal precedence. */
export declare function installSkills(ctx: Context): void;
