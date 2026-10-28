import { Service, type Context } from '@deepseek-ai/cordis';
import type { SessionHeader, SessionId } from '@deepseek-ai/dsh-session';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { SessionDeletionPreview, SessionDeletionRequest } from './deletion-contract.ts';
interface DeletionRecord {
    version: 1;
    rootId: SessionId;
    fingerprint: string;
    headers: SessionHeader[];
    complete: boolean;
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        aeConversations: ConversationDeletion;
    }
}
declare module '@deepseek-ai/dsh-typert-protocol' {
    interface RemoteErrorDetailsMap {
        'ae-conversations/delete-rejected': {};
        'ae-conversations/delete-unsupported': {};
        'ae-conversations/delete-scope-changed': {};
        'ae-conversations/delete-restart-required': {};
    }
}
/** Whether the active session persistence can host conversation-deletion journals. */
export declare function supportsConversationDeletionPersistence(persistence: {
    name: string;
    config?: {
        root?: string;
    };
}): boolean;
/**
 * Read one deletion journal. Corrupt or invalid files are renamed with a
 * `.corrupt` suffix and skipped so plugin init can continue.
 */
export declare function loadDeletionJournalFile(directory: string, filename: string, log: (format: string, ...args: unknown[]) => void): Promise<DeletionRecord | undefined>;
/** Plugin-owned lifecycle and storage adapter; never changes installed host files. */
export declare class ConversationDeletion extends TypertRemoteService {
    private readonly config;
    static inject: string[];
    private readonly handles;
    private readonly inflight;
    private readonly pending;
    private readonly deleted;
    private readonly previews;
    private readonly operations;
    private root;
    private directory;
    private rawOpen;
    private rawStat;
    private ready;
    private readonly active;
    private closing;
    private unsupported;
    constructor(ctx: Context, config: {
        enabled: () => boolean;
    });
    protected [Service.init](): Promise<void>;
    private initialize;
    private blocked;
    private assertWritable;
    private authorize;
    private collect;
    deletePreview(request: {
        sessionId: SessionId;
    }): Promise<SessionDeletionPreview>;
    delete(request: SessionDeletionRequest): Promise<readonly SessionId[]>;
    private performDeletion;
    private save;
    private cleanup;
}
export {};
