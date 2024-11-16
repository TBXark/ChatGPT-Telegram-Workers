import type { AgentUserConfig } from '../config';
import type {
    CoreAssistantMessage,
    CoreSystemMessage,
    CoreToolMessage,
    CoreUserMessage,
    DataContent,
    FilePart,
    ImagePart,
    TextPart,
} from './message';
//  当使用 `ai` 包时，取消注释以下行并注释掉上一行
// import type { CoreAssistantMessage, CoreSystemMessage, CoreToolMessage, CoreUserMessage, DataContent } from 'ai';

export type DataItemContent = DataContent;
export type UserContentPart = TextPart | ImagePart | FilePart;

export type SystemMessageItem = CoreSystemMessage;
export type UserMessageItem = CoreUserMessage;
export type AssistantMessageItem = CoreAssistantMessage;
export type ToolMessageItem = CoreToolMessage;

export type ResponseMessage = AssistantMessageItem | ToolMessageItem;
export type HistoryItem = SystemMessageItem | UserMessageItem | AssistantMessageItem | ToolMessageItem;

export interface HistoryModifierResult {
    history: HistoryItem[];
    message: CoreUserMessage;
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
