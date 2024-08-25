export interface KVNamespace {
    get: (key: string) => Promise<string | any>;
    put: (key: string, value: any, options?: { expirationTtl?: number; expiration?: number }) => Promise<void>;
    delete: (key: string) => Promise<void>;
}

export interface APIGuard {
    fetch: (request: Request) => Promise<Response>;
}
