export interface KVNamespaceBinding {
    get: (key: string) => Promise<string | any>;
    put: (key: string, value: string, info?: { expirationTtl?: number; expiration?: number }) => Promise<void>;
    delete: (key: string) => Promise<void>;
}

export interface APIGuardBinding {
    fetch: (request: Request) => Promise<Response>;
}

export interface WorkerAIBinding {
    run: (model: string, body: unknown) => Response;
}
