export interface KVNamespaceBinding {
    get: (key: string) => Promise<string | any>;
    put: (key: string, value: string, info?: { expirationTtl?: number; expiration?: number }) => Promise<void>;
    delete: (key: string) => Promise<void>;
}

export interface APIGuardBinding {
    fetch: (request: Request) => Promise<Response>;
}

export type AiTextGenerationOutput = ReadableStream<Uint8Array> | { response?: string };
export type AiTextToImageOutput = ReadableStream<Uint8Array> | { image?: string };

export abstract class WorkerAIBinding {
    abstract run(model: string, body: { messages: any[]; stream: boolean }): Promise<AiTextGenerationOutput>;
    abstract run(model: string, body: { prompt: string }): Promise<AiTextToImageOutput>;
}
