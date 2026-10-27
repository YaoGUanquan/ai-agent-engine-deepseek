/** Bridge the official row's existing action menu without selecting the row. */
export function attachRowContextMenu(marker: HTMLElement, sessionId: string): () => void {
  const row = marker.closest<HTMLElement>('[data-row-key]')
  const actions = marker.closest('[data-slot="sidebar.workspaces.session.row.action"]')?.parentElement
    ?? marker.parentElement
  if (!row || !actions) return () => {}
  const open = (event: MouseEvent) => {
    const trigger = actions.querySelector<HTMLButtonElement>('button')
    if (!trigger) return
    event.preventDefault()
    event.stopPropagation()
    const alreadyOpen = [...marker.ownerDocument.querySelectorAll('[data-ae-delete-session]')]
      .some(item => item.getAttribute('data-ae-delete-session') === sessionId)
    if (!alreadyOpen) trigger.click()
  }
  row.addEventListener('contextmenu', open)
  return () => { row.removeEventListener('contextmenu', open) }
}
