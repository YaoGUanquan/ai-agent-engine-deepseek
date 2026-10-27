import type { Context } from '@deepseek-ai/cordis';
import type { SettingsDescribeFace } from '@deepseek-ai/dsh-client-ui-settings/client';
import type { PropsHooks, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import { createDeletionController } from './deletion-state.ts';
import { type LocaleKey } from './locales.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        'ai-agent-engine': LocaleKey;
    }
}
export declare const inject: string[];
type Controller = ReturnType<typeof createDeletionController>;
type ModuleProps = PropsHooks<{
    settings: SettingsDescribeFace;
}>;
type DeleteDialogProps = PropsRuntime<'shell.overlay'> & PropsLocale<'ai-agent-engine'> & ModuleProps & PropsHooks<{
    deletion: Controller['state'];
}> & {
    confirm: Controller['confirm'];
    close: Controller['close'];
    requestDeletion: Controller['request'];
};
export declare function DeletionDialog({ useDeletion, useSettings, confirm, close, requestDeletion, t }: DeleteDialogProps): import("react").JSX.Element | null;
/** Follow the shared Host settings mirror and register deletion controls. */
export declare function apply(ctx: Context): Promise<void>;
export {};
