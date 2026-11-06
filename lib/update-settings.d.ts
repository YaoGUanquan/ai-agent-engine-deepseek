import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots';
import type { UpdateRemote } from './update-contract.ts';
type UpdateSettingsProps = PropsLocale<'ai-agent-engine'> & {
    remote?: UpdateRemote;
};
/**
 * Settings section for this plugin's own updater.
 *
 * The Host owns every download and install step; this page only shows the state
 * and asks for `check` / `apply`, then polls while an update is running.
 */
export declare function UpdateSettingsPage({ remote, t }: UpdateSettingsProps): import("react").JSX.Element;
export {};
