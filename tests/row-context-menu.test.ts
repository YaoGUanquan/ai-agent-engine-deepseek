// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { attachRowContextMenu } from '../src/row-context-menu.ts'

describe('original Desktop row context menu', () => {
  it('opens the existing menu without selecting the row and unloads cleanly', () => {
    const row = document.createElement('div')
    row.dataset.rowKey = 'session:fixture'
    const actions = document.createElement('span')
    const trigger = document.createElement('button')
    const slot = document.createElement('div')
    slot.dataset.slot = 'sidebar.workspaces.session.row.action'
    const marker = document.createElement('span')
    row.append(actions)
    actions.append(trigger, slot)
    slot.append(marker)
    document.body.append(row)
    const selected = vi.fn()
    const open = vi.fn()
    row.addEventListener('click', selected)
    actions.addEventListener('click', event => { event.stopPropagation() })
    trigger.addEventListener('click', open)
    const dispose = attachRowContextMenu(marker, 'fixture')
    row.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }))
    expect(open).toHaveBeenCalledOnce()
    expect(selected).not.toHaveBeenCalled()
    dispose()
    row.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }))
    expect(open).toHaveBeenCalledOnce()
    row.remove()
  })

  it('preserves a native row menu and never clicks the nested archive action', () => {
    const row = document.createElement('div')
    row.dataset.rowKey = 'session:fixture'
    row.innerHTML = '<span><button data-context-menu-trigger>More</button><span><div data-slot="sidebar.workspaces.session.row.action"><span data-marker></span><button data-archive>Archive</button></div></span></span>'
    document.body.append(row)
    const marker = row.querySelector<HTMLElement>('[data-marker]')!
    const archive = vi.fn()
    row.querySelector('[data-archive]')!.addEventListener('click', archive)
    const native = vi.fn()
    row.addEventListener('contextmenu', native)
    const dispose = attachRowContextMenu(marker, 'fixture')
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
    row.dispatchEvent(event)
    expect(native).toHaveBeenCalledOnce()
    expect(event.defaultPrevented).toBe(false)
    expect(archive).not.toHaveBeenCalled()
    dispose()
    row.remove()
  })

  it('does not treat contribution buttons as a missing legacy menu trigger', () => {
    const row = document.createElement('div')
    row.dataset.rowKey = 'session:fixture'
    row.innerHTML = '<span><div data-slot="sidebar.workspaces.session.row.action"><span data-marker></span><button>Archive</button></div></span>'
    document.body.append(row)
    const archive = vi.fn()
    row.querySelector('button')!.addEventListener('click', archive)
    const dispose = attachRowContextMenu(row.querySelector<HTMLElement>('[data-marker]')!, 'fixture')
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
    row.dispatchEvent(event)
    expect(archive).not.toHaveBeenCalled()
    expect(event.defaultPrevented).toBe(false)
    dispose()
    row.remove()
  })

  it('ignores a different contribution native trigger when opening the legacy menu', () => {
    const row = document.createElement('div')
    row.dataset.rowKey = 'session:fixture'
    row.innerHTML = '<span><button data-more>More</button><div data-slot="sidebar.workspaces.session.row.action"><span data-marker></span><button data-context-menu-trigger>Other action</button></div></span>'
    document.body.append(row)
    const more = vi.fn()
    const other = vi.fn()
    row.querySelector('[data-more]')!.addEventListener('click', more)
    row.querySelector('[data-context-menu-trigger]')!.addEventListener('click', other)
    const dispose = attachRowContextMenu(row.querySelector<HTMLElement>('[data-marker]')!, 'fixture')
    row.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }))
    expect(more).toHaveBeenCalledOnce()
    expect(other).not.toHaveBeenCalled()
    dispose()
    row.remove()
  })
})
