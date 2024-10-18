import type { AgentUserConfig } from '../config/env';

export interface HistoryItem {
    role: string;
    content?: string | null;
    images?: string[] | null;
}

export interface HistoryModifierResult {
    history: HistoryItem[];
    message: string | null;
}

export type HistoryModifier = (history: HistoryItem[], message: string | null) => HistoryModifierResult;

export type ChatStreamTextHandler = (text: string) => Promise<any>;

export interface LLMChatRequestParams {
    message?: string | null;
    images?: string[];
}

export interface LLMChatParams extends LLMChatRequestParams {
    prompt?: string | null;
    history?: HistoryItem[];
}

export type ChatAgentRequest = (params: LLMChatParams, context: AgentUserConfig, onStream: ChatStreamTextHandler | null) => Promise<string>;

export interface ChatAgent {
    name: string;
    modelKey: string;
    enable: (context: AgentUserConfig) => boolean;
    request: ChatAgentRequest;
    model: (ctx: AgentUserConfig) => string;
}

export type ImageAgentRequest = (prompt: string, context: AgentUserConfig) => Promise<string | Blob>;

export interface ImageAgent {
    name: string;
    modelKey: string;
    enable: (context: AgentUserConfig) => boolean;
    request: ImageAgentRequest;
    model: (ctx: AgentUserConfig) => string;
}

export interface OpenAIFuncCallData {
    // index: number;
    id: string;
    type: 'function';
    function: {
        name: string;
        arguments: string;
    };
};

export interface CompletionData {
    content: string;
    tool_calls?: OpenAIFuncCallData[];
    // usage?: {
    //     prompt_tokens: number;
    //     completion_tokens: number;
    //     total_tokens: number;
    // };
}
