import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol'

/** Wire types synchronized with the fixed Harness patch by tools/validate.mjs. */
export interface SessionDeletionPreview {
  readonly sessionId: SessionId
  readonly sessionIds: readonly SessionId[]
  readonly fingerprint: string
  readonly runningSessionIds: readonly SessionId[]
}

export interface SessionDeletionRequest extends SessionDeletionPreview {
  readonly stopRunning: true
}

/** Optional until the matching Host patch is installed. */
export interface SessionDeletionRemote {
  deletePreview(request: { readonly sessionId: SessionId }): Promise<RemoteResult<SessionDeletionPreview>>
  delete(request: SessionDeletionRequest): Promise<RemoteResult<readonly SessionId[]>>
}
