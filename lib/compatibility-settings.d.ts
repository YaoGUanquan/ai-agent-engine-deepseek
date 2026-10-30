import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots';
import type { CompatibilityRemote } from './compatibility-rpc.ts';
import type { ModuleStatuses } from './module-runtime.ts';
export declare function CompatibilitySettingsPage({ remote, clientStatuses, t }: PropsLocale<'ai-agent-engine'> & {
    remote?: CompatibilityRemote;
    clientStatuses: ModuleStatuses;
}): import("react").JSX.Element;
