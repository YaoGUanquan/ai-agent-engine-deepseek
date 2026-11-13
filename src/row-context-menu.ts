/** Bridge legacy rows; rows with a native menu keep their own gesture handler. */
export function attachRowContextMenu(marker: HTMLElement, sessionId: string): () => void {
  const row = marker.closest<HTMLElement>('[data-row-key]')
  const slot = marker.closest('[data-slot="sidebar.workspaces.session.row.action"]')
  const actions = slot?.parentElement ?? marker.parentElement
  if (!row || !actions) return () => {}
  const nativeMenu = [...row.querySelectorAll('button[data-context-menu-trigger]')]
    .some(button => !slot?.contains(button))
  if (nativeMenu) return () => {}
  const open = (event: MouseEvent) => {
    // A contribution's own archive/pin buttons are never a menu trigger.
    const triggers = [...actions.querySelectorAll<HTMLButtonElement>('button')]
      .filter(button => !slot?.contains(button))
    if (triggers.length !== 1) return
    event.preventDefault()
    event.stopPropagation()
    const alreadyOpen = [...marker.ownerDocument.querySelectorAll('[data-ae-delete-session]')]
      .some(item => item.getAttribute('data-ae-delete-session') === sessionId)
    if (!alreadyOpen) triggers[0]!.click()
  }
  row.addEventListener('contextmenu', open)
  return () => { row.removeEventListener('contextmenu', open) }
}
