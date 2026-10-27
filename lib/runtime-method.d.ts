/** Interpose a public service method without capturing the caller's Cordis realm. */
export declare function wrapMethod<T extends object, K extends keyof T>(service: T, key: K, wrap: (original: T[K]) => T[K]): () => void;
