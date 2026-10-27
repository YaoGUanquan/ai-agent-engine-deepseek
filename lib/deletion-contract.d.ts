import type { SessionId } from '@deepseek-ai/dsh-session/types';
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol';
/** Wire types owned by the plugin's conversation-deletion namespace. */
export interface SessionDeletionPreview {
    readonly sessionId: SessionId;
    readonly sessionIds: readonly SessionId[];
    readonly fingerprint: string;
    readonly runningSessionIds: readonly SessionId[];
}
export interface SessionDeletionRequest extends SessionDeletionPreview {
    readonly stopRunning: true;
}
/** Plugin-owned Remote namespace, mounted through the official Gateway. */
export interface SessionDeletionRemote {
    deletePreview(request: {
        readonly sessionId: SessionId;
    }): Promise<RemoteResult<SessionDeletionPreview>>;
    delete(request: SessionDeletionRequest): Promise<RemoteResult<readonly SessionId[]>>;
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        'remote.aeConversations': SessionDeletionRemote;
    }
}
