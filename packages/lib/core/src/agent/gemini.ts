import type { AgentUserConfig } from '../config/env';
import type { ChatAgent, ChatAgentResponse, ChatStreamTextHandler, LLMChatParams } from './types';
import { renderOpenAIMessages } from './openai';
import { requestChatCompletions } from './request';
import { convertStringToResponseMessages, loadModelsList } from './utils';

export class Gemini implements ChatAgent {
    readonly name = 'gemini';
    readonly modelKey = 'GOOGLE_COMPLETIONS_MODEL';

    readonly enable = (context: AgentUserConfig): boolean => {
        return !!(context.GOOGLE_API_KEY);
    };

    readonly model = (ctx: AgentUserConfig): string => {
        return ctx.GOOGLE_COMPLETIONS_MODEL;
    };

    readonly request = async (params: LLMChatParams, context: AgentUserConfig, onStream: ChatStreamTextHandler | null): Promise<ChatAgentResponse> => {
        const { prompt, messages } = params;
        const url = `${context.GOOGLE_API_BASE}/chat`;
        const header = {
            'Authorization': `Bearer ${context.GOOGLE_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': onStream !== null ? 'text/event-stream' : 'application/json',
        };
        const body = {
            messages: await renderOpenAIMessages(prompt, messages),
            model: context.GOOGLE_COMPLETIONS_MODEL,
            stream: onStream != null,
        };
        return convertStringToResponseMessages(requestChatCompletions(url, header, body, onStream));
    };

    readonly modelList = async (context: AgentUserConfig): Promise<string[]> => {
        return loadModelsList(context.GOOGLE_CHAT_MODELS_LIST);
    };
}
