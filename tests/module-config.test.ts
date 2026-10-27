import { describe, expect, it } from 'vitest'
import { conversationManagementEnabled } from '../src/module-config.ts'
import type { SettingsMirrorSnapshot } from '@deepseek-ai/dsh-client-ui-settings/client'

describe('Host module configuration in the browser', () => {
  it('stays disabled until the Host settings arrive and follows both switch values', () => {
    const snapshot: SettingsMirrorSnapshot = { status: 'loading', view: undefined, error: null }
    expect(conversationManagementEnabled(snapshot)).toBe(false)
    snapshot.view = {
      writable: true, hasDocument: true,
      namespaces: [{
        ns: 'ai-agent-engine', autoGenerate: true, schema: null,
        value: { engineering: false, conversationManagement: true },
        revision: 1, applies: 'live', secrets: [],
      }],
    }
    expect(conversationManagementEnabled(snapshot)).toBe(true)
    snapshot.view.namespaces[0]!.value = { engineering: true, conversationManagement: false }
    expect(conversationManagementEnabled(snapshot)).toBe(false)
  })
})
