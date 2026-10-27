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
})
