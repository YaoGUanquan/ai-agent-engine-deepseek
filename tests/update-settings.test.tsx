// @vitest-environment jsdom
import { StrictMode, type ButtonHTMLAttributes } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { UpdateSettingsPage } from '../src/update-settings.tsx'
import type { UpdateRemote, UpdateStateView } from '../src/update-contract.ts'
import { en, type LocaleKey } from '../src/locales.ts'

vi.mock('@deepseek-ai/dsh-client-ui-primitives', () => ({
  Button: ({ variant: _variant, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string }) => <button {...props} />,
}))
afterEach(cleanup)
const t = (key: LocaleKey) => en[key]
const state: UpdateStateView = {
  pluginName: 'ai-agent-engine-deepseek', currentVersion: '0.2.5', runtimeSupport: 'unknown',
  channel: 'package', outdated: true, canApply: true, phase: 'failed',
  blocked: 'install-failed', checkedAt: 1, restartRequired: false,
  error: 'Package manager failed',
  installResult: { changed: false, application: 'failed', pendingBuilds: ['native-example'], warnings: ['Review the dependency scripts'] },
}
function remote(snapshot: UpdateStateView): UpdateRemote {
  return { getState: vi.fn(async () => snapshot), check: vi.fn(async () => snapshot), apply: vi.fn(async () => snapshot) }
}
function page(rpc: UpdateRemote) {
  return <UpdateSettingsPage {...{ remote: rpc, t } as Parameters<typeof UpdateSettingsPage>[0]} />
}

describe('update result display', () => {
  it('shows failure diagnostics and pending scripts without claiming successful installation', async () => {
    const rpc = remote(state)
    render(page(rpc))
    await screen.findByText('Package manager failed')
    expect(screen.queryByText(en['update.applied'])).toBeNull()
    expect(screen.getByText(/native-example/).textContent).toContain(en['update.pendingBuilds'])
    expect(screen.getByText(/Review the dependency scripts/).textContent).toContain(en['update.warning'])
    expect(rpc.apply).not.toHaveBeenCalled()
  })

  it('keeps its initial state usable across strict-mode effect cleanup and offers pending retry', async () => {
    const rpc = remote({ ...state, channel: 'checkout', blocked: 'build-failed',
      pendingCheckout: { target: 'a'.repeat(40), stage: 'build' },
    })
    render(<StrictMode>{page(rpc)}</StrictMode>)
    await screen.findByText(en['update.resumePending'])
    expect((screen.getByRole('button', { name: en['update.apply'] }) as HTMLButtonElement).disabled).toBe(false)
    expect(screen.queryByText(en['update.applied'])).toBeNull()
  })
})
