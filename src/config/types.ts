export interface KVNamespace {
    get: (key: string) => Promise<string | any>;
    put: (key: string, value: string, info?: { expirationTtl?: number; expiration?: number }) => Promise<void>;
    delete: (key: string) => Promise<void>;
}

export interface APIGuard {
    fetch: (request: Request) => Promise<Response>;
}

export interface CommandConfig {
    value: string;
    description?: string | null;
    scope?: string[] | null;
}
