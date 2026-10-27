import { createSnapshotStore } from '@deepseek-ai/dsh-client-store'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { SessionDeletionPreview, SessionDeletionRemote } from './deletion-contract.ts'

export interface DeletionState {
  readonly sessionId: SessionId
  readonly displayTitle: string
  readonly phase: 'loading' | 'confirm' | 'deleting' | 'error'
  readonly preview?: SessionDeletionPreview
  readonly unavailable?: boolean
  readonly changedScope?: boolean
}

/** Own a single confirmation request independently of the row-menu lifetime. */
export function createDeletionController(remote: Partial<SessionDeletionRemote>, onDeleted: (ids: readonly SessionId[]) => void) {
  const state = createSnapshotStore<DeletionState | null>(null)
  let generation = 0
  let disposed = false
  async function request(sessionId: SessionId, displayTitle: string) {
    if (state.getSnapshot()?.phase === 'deleting' || disposed) return
    const current = ++generation
    state.set({ sessionId, displayTitle, phase: 'loading' })
    if (typeof remote.deletePreview !== 'function' || typeof remote.delete !== 'function') {
      state.set({ sessionId, displayTitle, phase: 'error', unavailable: true })
      return
    }
    try {
      const result = await remote.deletePreview({ sessionId })
      if (!result.ok) throw result.error
      const preview = result.value
      if (!disposed && current === generation) state.set({ sessionId, displayTitle, phase: 'confirm', preview })
    } catch (error: unknown) {
      if (disposed || current !== generation) return
      const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : ''
      state.set({
        sessionId, displayTitle, phase: 'error',
        unavailable: /method-not-found|endpoint-not-found|namespace-not-found|not-available|method-unavailable|definition-unavailable|service-unavailable|delete-unsupported/.test(code),
      })
    }
  }
  async function confirm() {
    const current = state.getSnapshot()
    if (disposed || current?.preview === undefined || !['confirm', 'error'].includes(current.phase) || typeof remote.delete !== 'function') return
    state.set({ ...current, phase: 'deleting' })
    try {
      const result = await remote.delete({ ...current.preview, stopRunning: true })
      if (!result.ok) throw result.error
      const ids = result.value
      if (!disposed) {
        onDeleted(ids)
        state.set(null)
      }
    } catch (error: unknown) {
      // Keep the exact preview so a partially committed cleanup can be retried.
      const changedScope = typeof error === 'object' && error !== null
        && 'code' in error && error.code === 'session/delete-scope-changed'
      if (!disposed) state.set(changedScope
        ? { sessionId: current.sessionId, displayTitle: current.displayTitle, phase: 'error', changedScope: true }
        : { ...current, phase: 'error' })
    }
  }
  function close() {
    if (state.getSnapshot()?.phase === 'deleting') return
    generation++
    state.set(null)
  }
  return {
    state, request, confirm, close,
    dispose() { disposed = true; generation++; state.set(null) },
  }
}
