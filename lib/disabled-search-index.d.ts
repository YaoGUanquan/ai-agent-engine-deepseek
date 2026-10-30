/** Inspect an existing index without creating it or changing any records. */
export declare function validateSearchIndex(path: string | undefined): Promise<void>;
/** Remove selected records from an existing, disabled rc.3 disposable index. */
export declare function clearDisabledSearchIndex(path: string | undefined, ids: readonly string[]): Promise<void>;
