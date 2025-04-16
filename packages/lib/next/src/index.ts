import type { ProviderV1 } from '@ai-sdk/provider';
import type { AgentUserConfig, ChatAgent, ChatAgentResponse, ChatStreamTextHandler, HistoryItem, LLMChatParams, ResponseMessage } from '@chatgpt-telegram-workers/core';
import type { CoreAssistantMessage, CoreMessage, CoreToolMessage, LanguageModelV1 } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createAzure } from '@ai-sdk/azure';
import { createCohere } from '@ai-sdk/cohere';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createMistral } from '@ai-sdk/mistral';
import { createOpenAI } from '@ai-sdk/openai';
import { streamHandler } from '@chatgpt-telegram-workers/core';
import { generateText, streamText } from 'ai';

function convertResponseToMessages(messages: (CoreAssistantMessage | CoreToolMessage)[]): ResponseMessage[] {
    return messages.map((message) => {
        if (message.role && message.content) {
            return {
                role: message.role,
                content: message.content,
            } as ResponseMessage;
        }
        return null;
    }).filter(message => message !== null) as ResponseMessage[];
}

export async function requestChatCompletionsV2(params: { model: LanguageModelV1; prompt?: string; messages: HistoryItem[] }, onStream: ChatStreamTextHandler | null): Promise<ChatAgentResponse> {
    if (onStream !== null) {
        const stream = streamText({
            model: params.model,
            prompt: params.prompt,
            messages: params.messages as Array<CoreMessage>,
        });
        await streamHandler(stream.textStream, t => t, onStream);
        return {
            text: await stream.text,
            responses: convertResponseToMessages((await stream.response).messages),
        };
    } else {
        const result = await generateText({
            model: params.model,
            prompt: params.prompt,
            messages: params.messages as Array<CoreMessage>,
        });
        return {
            text: result.text,
            responses: convertResponseToMessages(result.response.messages),
        };
    }
}

export type ProviderCreator = (context: AgentUserConfig) => ProviderV1;

export class NextChatAgent implements ChatAgent {
    readonly name: string;
    readonly modelKey: string;
    readonly adapter: ChatAgent;
    readonly providerCreator: ProviderCreator;

    constructor(adapter: ChatAgent, providerCreator: ProviderCreator) {
        this.name = adapter.name;
        this.modelKey = adapter.modelKey;
        this.adapter = adapter;
        this.providerCreator = providerCreator;
    }

    static from(agent: ChatAgent): NextChatAgent | null {
        const provider = this.newProviderCreator(agent.name);
        if (!provider) {
            return null;
        }
        return new NextChatAgent(agent, provider);
    }

    readonly enable = (context: AgentUserConfig): boolean => {
        return this.adapter.enable(context);
    };

    readonly model = (ctx: AgentUserConfig): string | null => {
        return this.adapter.model(ctx);
    };

    static newProviderCreator = (provider: string): ProviderCreator | null => {
        switch (provider) {
            case 'anthropic':
                return (context: AgentUserConfig) => createAnthropic({
                    baseURL: context.ANTHROPIC_API_BASE,
                    apiKey: context.ANTHROPIC_API_KEY || undefined,
                });
            case 'azure':
                return (context: AgentUserConfig) => createAzure({
                    resourceName: context.AZURE_RESOURCE_NAME || undefined,
                    apiKey: context.AZURE_API_KEY || undefined,
                });
            case 'cohere':
                return (context: AgentUserConfig) => createCohere({
                    baseURL: context.COHERE_API_BASE,
                    apiKey: context.COHERE_API_KEY || undefined,
                });
            case 'gemini':
                return (context: AgentUserConfig) => createGoogleGenerativeAI({
                    baseURL: context.GOOGLE_API_BASE,
                    apiKey: context.GOOGLE_API_KEY || undefined,
                });
            case 'mistral':
                return (context: AgentUserConfig) => createMistral({
                    baseURL: context.MISTRAL_API_BASE,
                    apiKey: context.MISTRAL_API_KEY || undefined,
                });
            case 'openai':
                return (context: AgentUserConfig) => createOpenAI({
                    baseURL: context.OPENAI_API_BASE,
                    apiKey: context.OPENAI_API_KEY.at(0) || undefined,
                });
            default:
                return null;
        }
    };

    readonly request = async (params: LLMChatParams, context: AgentUserConfig, onStream: ChatStreamTextHandler | null): Promise<ChatAgentResponse> => {
        const model = this.model(context);
        if (!model) {
            throw new Error('Model not found');
        }
        if (params.prompt) {
            params.messages.unshift({
                role: 'system',
                content: params.prompt,
            });
        }
        return requestChatCompletionsV2({
            model: this.providerCreator(context).languageModel(model),
            messages: params.messages,
        }, onStream);
    };

    readonly modelList = async (context: AgentUserConfig): Promise<string[]> => {
        return this.adapter.modelList(context);
    };
}

export function injectNextChatAgent(agents: ChatAgent[]) {
    for (let i = 0; i < agents.length; i++) {
        const next = NextChatAgent.from(agents[i]);
        if (next) {
            agents[i] = next;
        }
    }
}
