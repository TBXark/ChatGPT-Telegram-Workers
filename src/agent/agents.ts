import type { WorkerContext } from '../config/context';
import type { ChatAgent, ImageAgent } from './types';
import { isOpenAIEnable, requestCompletionsFromOpenAI, requestImageFromOpenAI } from './openai';
import { isWorkersAIEnable, requestCompletionsFromWorkersAI, requestImageFromWorkersAI } from './workersai';
import { isGeminiAIEnable, requestCompletionsFromGeminiAI } from './gemini';
import { isMistralAIEnable, requestCompletionsFromMistralAI } from './mistralai';
import { isCohereAIEnable, requestCompletionsFromCohereAI } from './cohere';
import { isAnthropicAIEnable, requestCompletionsFromAnthropicAI } from './anthropic';
import {
    isAzureEnable,
    isAzureImageEnable,
    requestCompletionsFromAzureOpenAI,
    requestImageFromAzureOpenAI,
} from './azure';

const chatLlmAgents: ChatAgent[] = [
    {
        name: 'azure',
        enable: isAzureEnable,
        request: requestCompletionsFromAzureOpenAI,
        modelKey: 'AZURE_COMPLETIONS_API',
        model: (ctx: WorkerContext) => {
            try {
                const url = new URL(ctx.USER_CONFIG.AZURE_COMPLETIONS_API);
                return url.pathname.split('/')[3];
            } catch {
                return ctx.USER_CONFIG.AZURE_COMPLETIONS_API;
            }
        },
    },
    {
        name: 'openai',
        enable: isOpenAIEnable,
        request: requestCompletionsFromOpenAI,
        modelKey: 'OPENAI_CHAT_MODEL',
        model: (ctx: WorkerContext) => ctx.USER_CONFIG.OPENAI_CHAT_MODEL,
    },
    {
        name: 'workers',
        enable: isWorkersAIEnable,
        request: requestCompletionsFromWorkersAI,
        modelKey: 'WORKERS_CHAT_MODEL',
        model: (ctx: WorkerContext) => ctx.USER_CONFIG.WORKERS_CHAT_MODEL,
    },
    {
        name: 'gemini',
        enable: isGeminiAIEnable,
        request: requestCompletionsFromGeminiAI,
        modelKey: 'GOOGLE_COMPLETIONS_MODEL',
        model: (ctx: WorkerContext) => ctx.USER_CONFIG.GOOGLE_COMPLETIONS_MODEL,
    },
    {
        name: 'mistral',
        enable: isMistralAIEnable,
        request: requestCompletionsFromMistralAI,
        modelKey: 'MISTRAL_CHAT_MODEL',
        model: (ctx: WorkerContext) => ctx.USER_CONFIG.MISTRAL_CHAT_MODEL,
    },
    {
        name: 'cohere',
        enable: isCohereAIEnable,
        request: requestCompletionsFromCohereAI,
        modelKey: 'COHERE_CHAT_MODEL',
        model: (ctx: WorkerContext) => ctx.USER_CONFIG.COHERE_CHAT_MODEL,
    },
    {
        name: 'anthropic',
        enable: isAnthropicAIEnable,
        request: requestCompletionsFromAnthropicAI,
        modelKey: 'ANTHROPIC_CHAT_MODEL',
        model: (ctx: WorkerContext) => ctx.USER_CONFIG.ANTHROPIC_CHAT_MODEL,
    },
];

export function loadChatLLM(context: WorkerContext): ChatAgent | null {
    for (const llm of chatLlmAgents) {
        if (llm.name === context.USER_CONFIG.AI_PROVIDER) {
            return llm;
        }
    }
    // 找不到指定的AI，使用第一个可用的AI
    for (const llm of chatLlmAgents) {
        if (llm.enable(context)) {
            return llm;
        }
    }
    return null;
}

const imageGenAgents: ImageAgent[] = [
    {
        name: 'azure',
        enable: isAzureImageEnable,
        request: requestImageFromAzureOpenAI,
        modelKey: 'AZURE_DALLE_API',
        model: (ctx: WorkerContext) => {
            try {
                const url = new URL(ctx.USER_CONFIG.AZURE_DALLE_API);
                return url.pathname.split('/')[3];
            } catch {
                return ctx.USER_CONFIG.AZURE_DALLE_API;
            }
        },
    },
    {
        name: 'openai',
        enable: isOpenAIEnable,
        request: requestImageFromOpenAI,
        modelKey: 'DALL_E_MODEL',
        model: (ctx: WorkerContext) => ctx.USER_CONFIG.DALL_E_MODEL,
    },
    {
        name: 'workers',
        enable: isWorkersAIEnable,
        request: requestImageFromWorkersAI,
        modelKey: 'WORKERS_IMAGE_MODEL',
        model: (ctx: WorkerContext) => ctx.USER_CONFIG.WORKERS_IMAGE_MODEL,
    },
];

export function loadImageGen(context: WorkerContext): ImageAgent | null {
    for (const imgGen of imageGenAgents) {
        if (imgGen.name === context.USER_CONFIG.AI_IMAGE_PROVIDER) {
            return imgGen;
        }
    }
    // 找不到指定的AI，使用第一个可用的AI
    for (const imgGen of imageGenAgents) {
        if (imgGen.enable(context)) {
            return imgGen;
        }
    }
    return null;
}
