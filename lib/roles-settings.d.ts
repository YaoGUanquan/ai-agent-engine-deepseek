import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { RolesRemote } from './roles-contract.ts';
type RolesSettingsProps = PropsRuntime<'settings.section'> & PropsLocale<'ai-agent-engine'> & {
    roles: RolesRemote;
};
/** Settings section for editing the shared roles.json overlay via aeRoles RPC. */
export declare function RolesSettingsPage({ roles, t }: RolesSettingsProps): import("react").JSX.Element;
export {};
