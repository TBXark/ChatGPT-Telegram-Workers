import type { CoreAssistantMessage, CoreMessage, CoreToolMessage, CoreUserMessage } from 'ai';
import type { AgentUserConfig } from '../config/env';

export type HistoryItem = CoreMessage;

export interface HistoryModifierResult {
    history: HistoryItem[];
    message: CoreUserMessage;
}

export type HistoryModifier = (history: HistoryItem[], message: CoreUserMessage | null) => HistoryModifierResult;

export type ChatStreamTextHandler = (text: string) => Promise<any>;

export type LLMChatRequestParams = CoreUserMessage;

export interface LLMChatParams {
    prompt?: string;
    messages: CoreMessage[];
}

export type ResponseMessage = CoreAssistantMessage | CoreToolMessage;

export type ChatAgentRequest = (params: LLMChatParams, context: AgentUserConfig, onStream: ChatStreamTextHandler | null) => Promise<ResponseMessage[]>;
export type ImageAgentRequest = (prompt: string, context: AgentUserConfig) => Promise<string | Blob>;

export interface Agent<AgentRequest> {
    name: string;
    modelKey: string;
    enable: (context: AgentUserConfig) => boolean;
    request: AgentRequest;
    model: (ctx: AgentUserConfig) => string;
}

export type ChatAgent = Agent<ChatAgentRequest>;

export type ImageAgent = Agent<ImageAgentRequest>;
