// @vitest-environment jsdom
import { Context } from '@deepseek-ai/cordis'
import { describe, expect, it, vi } from 'vitest'
import { apply } from '../src/client.tsx'

const mocks = vi.hoisted(() => ({ presentation: vi.fn(), ownerLabels: vi.fn(), legacyImport: vi.fn() }))
vi.mock('../src/team-presentation.tsx', () => ({
  installTeamPresentation: mocks.presentation,
  installTeamBoardOwnerLabels: mocks.ownerLabels,
}))
vi.mock('@deepseek-ai/dsh-experimental-client-ui-agent-team/client', () => {
  mocks.legacyImport()
  throw new Error('Legacy Team UI is incompatible with the current Host')
})
vi.mock('@deepseek-ai/dsh-client-ui-primitives', () => ({
  Button: () => null, Input: () => null, Modal: () => null,
  MenuItemButton: () => null, IconTrashOutlineRegular: () => null,
}))

describe('engineering UI on Hosts with official Team modules', () => {
  it.each(['', 'experimental-'])('waits for configured %sTeam UI without loading legacy UI', async prefix => {
    mocks.presentation.mockClear()
    mocks.ownerLabels.mockClear()
    mocks.legacyImport.mockClear()
    const ctx = new Context()
    const services = {
      slots: { inject: vi.fn(), register: vi.fn(), entries: () => [], subscribe: vi.fn() },
      locale: { register: vi.fn(), bind: () => (key: string) => key, getSnapshot: vi.fn(), subscribe: vi.fn() },
      remote: { $mount: vi.fn(async () => {}) },
      sessions: { binding: vi.fn(), retainInfo: vi.fn() },
      uiWorkspace: { openSession: vi.fn() },
      loader: { entries: () => [
        { options: { name: `@deepseek-ai/dsh-${prefix}client-ui-agent-team` }, disabled: false },
      ] },
    }
    for (const [name, service] of Object.entries(services)) ctx.provide(name, service)
    try {
      await ctx.plugin(async scope => { await apply(scope) })
      await vi.waitFor(() => expect(mocks.presentation).toHaveBeenCalledOnce())
      expect(mocks.ownerLabels).toHaveBeenCalledOnce()
      expect(mocks.legacyImport).not.toHaveBeenCalled()
    } finally { await ctx.fiber.dispose() }
  })
})
