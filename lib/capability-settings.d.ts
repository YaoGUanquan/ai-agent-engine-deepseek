import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client';
import type { CapabilityRemote } from './capability-contract.ts';
type CapabilityConfig = {
    capabilityEnhanceEnabled?: boolean;
    jailbreakEnabled?: boolean;
    enhanceProfile?: string;
    jailbreakPrompt?: string;
};
type CapabilitySettingsProps = PropsRuntime<'settings.section'> & PropsLocale<'ai-agent-engine'> & {
    capability: CapabilityRemote;
    configForm: ConfigForm<CapabilityConfig>;
};
/** Settings section: master switches + expand editors when on (preset-manager UX). */
export declare function CapabilitySettingsPage({ capability, configForm, t }: CapabilitySettingsProps): import("react").JSX.Element;
export {};
