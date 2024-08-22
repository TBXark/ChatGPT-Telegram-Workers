import type { WorkerContext } from '../config/context';

export interface LlmRequestParams {
    message?: string | null;
    images?: string[];
}

export interface LlmParams extends LlmRequestParams {
    prompt?: string | null;
    history?: HistoryItem[];
}

export type IsAgentEnable = (context: WorkerContext) => boolean;

export type AgentTextHandler = (text: string) => Promise<any>;

export type ChatAgentRequest = (
    params: LlmParams,
    context: WorkerContext,
    onStream: AgentTextHandler
) => Promise<string>;

export interface ChatAgent {
    name: string;
    enable: IsAgentEnable;
    request: ChatAgentRequest;
}

export type ImageAgentRequest = (
    prompt: string,
    context: WorkerContext
) => Promise<string | Blob>;

export interface ImageAgent {
    name: string;
    enable: IsAgentEnable;
    request: ImageAgentRequest;
}

export interface HistoryItem {
    role: string;
    content: string;
    images?: string[];
}

export interface LlmModifierResult {
    history: HistoryItem[];
    message: string;
}

export type LlmModifier = (history: HistoryItem[], message: string) => LlmModifierResult;

export interface SseChatCompatibleOptions {
    streamBuilder?: (resp: Response, controller: AbortController) => any;
    contentExtractor?: (data: object) => string | null;
    fullContentExtractor?: (data: object) => string | null;
    errorExtractor?: (data: object) => string | null;
}

export interface SSEMessage {
    event?: string;
    data?: string;
}

export interface SSEParserResult {
    finish?: boolean;
    data?: any;
}
