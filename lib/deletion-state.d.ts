import type { SessionId } from '@deepseek-ai/dsh-session/types';
import type { SessionDeletionPreview, SessionDeletionRemote } from './deletion-contract.ts';
export interface DeletionState {
    readonly sessionId: SessionId;
    readonly displayTitle: string;
    readonly phase: 'loading' | 'confirm' | 'deleting' | 'error';
    readonly preview?: SessionDeletionPreview;
    readonly unavailable?: boolean;
    readonly changedScope?: boolean;
    readonly restartRequired?: boolean;
}
/** Own a single confirmation request independently of the row-menu lifetime. */
export declare function createDeletionController(remote: Partial<SessionDeletionRemote>, onDeleted: (ids: readonly SessionId[]) => void): {
    state: import("@deepseek-ai/dsh-client-store").SnapshotStore<DeletionState | null>;
    request: (sessionId: SessionId, displayTitle: string) => Promise<void>;
    confirm: () => Promise<void>;
    close: () => void;
    dispose(): void;
};
