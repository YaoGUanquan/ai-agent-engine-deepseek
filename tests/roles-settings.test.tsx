// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import type { ButtonHTMLAttributes, InputHTMLAttributes } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { RolesSettingsPage } from '../src/roles-settings.tsx'
import { BUILTIN_ROLES, mergeRoleCatalog } from '../src/role-catalog.ts'
import type { RolesCatalogView, RolesOverlayView, RolesPutResult, RolesRemote } from '../src/roles-contract.ts'
import { en, type LocaleKey } from '../src/locales.ts'

// The Harness supplies controls through its browser module loader.
vi.mock('@deepseek-ai/dsh-client-ui-primitives', () => ({
  Button: ({ variant: _variant, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string }) => <button {...props} />,
  Input: (props: InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}))

afterEach(cleanup)
const t = (key: LocaleKey) => en[key]
const catalog: RolesCatalogView = { roles: BUILTIN_ROLES, source: 'builtin', enabled: true }
const overlay: RolesOverlayView = { version: 1, roles: [], path: '/test/roles.json', exists: false }
function remote(): RolesRemote {
  return {
    getCatalog: vi.fn(async () => catalog),
    getOverlay: vi.fn(async () => overlay),
    putOverlay: vi.fn<RolesRemote['putOverlay']>(async request => ({ path: overlay.path!, source: 'merged', roles: mergeRoleCatalog(BUILTIN_ROLES, request.roles) })),
    restoreDefaults: vi.fn<RolesRemote['restoreDefaults']>(async () => ({ restored: true, path: overlay.path, roles: BUILTIN_ROLES })),
  }
}
function view(roles: RolesRemote) {
  return <RolesSettingsPage {...{ roles, t } as Parameters<typeof RolesSettingsPage>[0]} />
}
const saveButton = () => screen.getByRole('button', { name: en['roles.save'] }) as HTMLButtonElement
const frontendResponsibility = () => within(document.querySelector('[data-ae-role-row="frontend"]') as HTMLElement)
  .getByLabelText(en['roles.responsibility']) as HTMLInputElement

describe('role settings operation state', () => {
  it('cannot save or restore after an initial load failure, and can reload safely', async () => {
    const roles = remote()
    vi.mocked(roles.getCatalog).mockRejectedValueOnce(new Error('read unavailable'))
    render(view(roles))
    await screen.findByRole('alert')
    expect(saveButton().disabled).toBe(true)
    expect((screen.getByRole('button', { name: en['roles.restore'] }) as HTMLButtonElement).disabled).toBe(true)
    fireEvent.click(saveButton())
    expect(roles.putOverlay).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: en['roles.reload'] }))
    await waitFor(() => expect(saveButton().disabled).toBe(false))
    expect(frontendResponsibility().value).toContain('Implement accessible UI')
  })

  it('edits and preserves saved overrides while role policy is disabled', async () => {
    const roles = remote()
    vi.mocked(roles.getCatalog).mockResolvedValue({ ...catalog, enabled: false })
    vi.mocked(roles.getOverlay).mockResolvedValue({ ...overlay, exists: true,
      roles: [{ id: 'frontend', responsibility: 'Saved custom brief' }, { id: 'security', responsibility: 'Review threats' }],
    })
    render(view(roles))
    await waitFor(() => expect(saveButton().disabled).toBe(false))
    expect(frontendResponsibility().value).toBe('Saved custom brief')
    fireEvent.click(saveButton())
    await screen.findByText(en['roles.saved'])
    expect(roles.putOverlay).toHaveBeenCalledWith({ version: 1, roles: [
      { id: 'frontend', responsibility: 'Saved custom brief' },
      { id: 'security', responsibility: 'Review threats', skill: undefined },
    ] })
  })

  it('locks edits during save and retains the draft when saving fails', async () => {
    const roles = remote()
    const pending = Promise.withResolvers<RolesPutResult>()
    vi.mocked(roles.putOverlay).mockImplementationOnce(() => pending.promise)
    render(view(roles))
    await waitFor(() => expect(saveButton().disabled).toBe(false))
    fireEvent.change(frontendResponsibility(), { target: { value: 'Draft before save' } })
    fireEvent.click(saveButton())
    expect(frontendResponsibility().disabled).toBe(true)
    fireEvent.change(frontendResponsibility(), { target: { value: 'Must not replace submitted draft' } })
    expect(frontendResponsibility().value).toBe('Draft before save')
    expect((screen.getByRole('button', { name: en['roles.add'] }) as HTMLButtonElement).disabled).toBe(true)
    await act(async () => pending.reject(new Error('write unavailable')))
    await screen.findByRole('alert')
    expect(frontendResponsibility().value).toBe('Draft before save')
    expect(frontendResponsibility().disabled).toBe(false)
    fireEvent.click(saveButton())
    await screen.findByText(en['roles.saved'])
    expect(roles.putOverlay).toHaveBeenCalledTimes(2)
    expect(frontendResponsibility().value).toBe('Draft before save')
  })

  it('ignores a slow response from a replaced remote', async () => {
    const first = remote()
    const pending = Promise.withResolvers<RolesOverlayView>()
    vi.mocked(first.getOverlay).mockReturnValue(pending.promise)
    const rendered = render(view(first))
    const second = remote()
    vi.mocked(second.getOverlay).mockResolvedValue({ ...overlay, exists: true,
      roles: [{ id: 'frontend', responsibility: 'Current connection' }],
    })
    rendered.rerender(view(second))
    await waitFor(() => expect(saveButton().disabled).toBe(false))
    await act(async () => pending.resolve({ ...overlay, exists: true,
      roles: [{ id: 'frontend', responsibility: 'Stale connection' }],
    }))
    expect(frontendResponsibility().value).toBe('Current connection')
  })
})
