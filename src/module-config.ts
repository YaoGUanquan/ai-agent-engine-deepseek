import type { SettingsMirrorSnapshot } from '@deepseek-ai/dsh-client-ui-settings/client'

/** Read the module switch from the shipped bundle entry's live Host settings. */
export function conversationManagementEnabled(snapshot: SettingsMirrorSnapshot): boolean {
  const value = snapshot.view?.namespaces.find(entry => entry.ns === 'ai-agent-engine')?.value
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    && value.conversationManagement === true
}
