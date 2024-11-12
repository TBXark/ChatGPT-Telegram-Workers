import type { CoreAssistantMessage, CoreSystemMessage, CoreToolMessage, CoreUserMessage } from 'ai';
import type { AgentUserConfig } from '../config/env';

export type ImageContent = string | Uint8Array | ArrayBuffer | Buffer | URL;
export type SystemMessageItem = CoreSystemMessage;
export type UserMessageItem = CoreUserMessage;
export type AssistantMessageItem = CoreAssistantMessage;
export type ToolMessageItem = CoreToolMessage;
export type ResponseMessage = AssistantMessageItem | ToolMessageItem;
export type HistoryItem = SystemMessageItem | UserMessageItem | AssistantMessageItem | ToolMessageItem;

export interface HistoryModifierResult {
    history: HistoryItem[];
    message: UserMessageItem;
}

export interface LLMChatParams {
    prompt?: string;
    messages: HistoryItem[];
}

export interface ChatAgentResponse {
    text: string;
    responses: ResponseMessage[];
}

export type ChatStreamTextHandler = (text: string) => Promise<any>;
export type HistoryModifier = (history: HistoryItem[], message: UserMessageItem | null) => HistoryModifierResult;

export type ChatAgentRequest = (params: LLMChatParams, context: AgentUserConfig, onStream: ChatStreamTextHandler | null) => Promise<ChatAgentResponse>;
export type ImageAgentRequest = (prompt: string, context: AgentUserConfig) => Promise<string | Blob>;

export interface Agent<AgentRequest> {
    name: string;
    modelKey: string;
    enable: (ctx: AgentUserConfig) => boolean;
    request: AgentRequest;
    model: (ctx: AgentUserConfig) => string | null;
}

export interface ChatAgent extends Agent<ChatAgentRequest> {
    modelList: (ctx: AgentUserConfig) => Promise<string[]>;
}

export type ImageAgent = Agent<ImageAgentRequest>;
