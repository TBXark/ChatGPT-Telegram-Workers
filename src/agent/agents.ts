import type { WorkerContext } from '../config/context';
import type { ChatAgent, ImageAgent } from './types';
import { isOpenAIEnable, requestCompletionsFromOpenAI, requestImageFromOpenAI } from './openai.js';
import { isWorkersAIEnable, requestCompletionsFromWorkersAI, requestImageFromWorkersAI } from './workersai.js';
import { isGeminiAIEnable, requestCompletionsFromGeminiAI } from './gemini.js';
import { isMistralAIEnable, requestCompletionsFromMistralAI } from './mistralai.js';
import { isCohereAIEnable, requestCompletionsFromCohereAI } from './cohere.js';
import { isAnthropicAIEnable, requestCompletionsFromAnthropicAI } from './anthropic.js';
import {
    isAzureEnable,
    isAzureImageEnable,
    requestCompletionsFromAzureOpenAI,
    requestImageFromAzureOpenAI,
} from './azure.js';

export const chatLlmAgents: ChatAgent[] = [
    {
        name: 'azure',
        enable: isAzureEnable,
        request: requestCompletionsFromAzureOpenAI,
    },
    {
        name: 'openai',
        enable: isOpenAIEnable,
        request: requestCompletionsFromOpenAI,
    },
    {
        name: 'workers',
        enable: isWorkersAIEnable,
        request: requestCompletionsFromWorkersAI,
    },
    {
        name: 'gemini',
        enable: isGeminiAIEnable,
        request: requestCompletionsFromGeminiAI,
    },
    {
        name: 'mistral',
        enable: isMistralAIEnable,
        request: requestCompletionsFromMistralAI,
    },
    {
        name: 'cohere',
        enable: isCohereAIEnable,
        request: requestCompletionsFromCohereAI,
    },
    {
        name: 'anthropic',
        enable: isAnthropicAIEnable,
        request: requestCompletionsFromAnthropicAI,
    },
];

export function currentChatModel(agentName: string, context: WorkerContext): string | null {
    switch (agentName) {
        case 'azure':
            try {
                const url = new URL(context.USER_CONFIG.AZURE_COMPLETIONS_API);
                return url.pathname.split('/')[3];
            } catch {
                return context.USER_CONFIG.AZURE_COMPLETIONS_API;
            }
        case 'openai':
            return context.USER_CONFIG.OPENAI_CHAT_MODEL;
        case 'workers':
            return context.USER_CONFIG.WORKERS_CHAT_MODEL;
        case 'gemini':
            return context.USER_CONFIG.GOOGLE_COMPLETIONS_MODEL;
        case 'mistral':
            return context.USER_CONFIG.MISTRAL_CHAT_MODEL;
        case 'cohere':
            return context.USER_CONFIG.COHERE_CHAT_MODEL;
        case 'anthropic':
            return context.USER_CONFIG.ANTHROPIC_CHAT_MODEL;
        default:
            return null;
    }
}

export function chatModelKey(agentName: string): string | null {
    switch (agentName) {
        case 'azure':
            return 'AZURE_COMPLETIONS_API';
        case 'openai':
            return 'OPENAI_CHAT_MODEL';
        case 'workers':
            return 'WORKERS_CHAT_MODEL';
        case 'gemini':
            return 'GOOGLE_COMPLETIONS_MODEL';
        case 'mistral':
            return 'MISTRAL_CHAT_MODEL';
        case 'cohere':
            return 'COHERE_CHAT_MODEL';
        case 'anthropic':
            return 'ANTHROPIC_CHAT_MODEL';
        default:
            return null;
    }
}

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

export const imageGenAgents: ImageAgent[] = [
    {
        name: 'azure',
        enable: isAzureImageEnable,
        request: requestImageFromAzureOpenAI,
    },
    {
        name: 'openai',
        enable: isOpenAIEnable,
        request: requestImageFromOpenAI,
    },
    {
        name: 'workers',
        enable: isWorkersAIEnable,
        request: requestImageFromWorkersAI,
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

export function currentImageModel(agentName: string, context: WorkerContext): string | null {
    switch (agentName) {
        case 'azure':
            try {
                const url = new URL(context.USER_CONFIG.AZURE_DALLE_API);
                return url.pathname.split('/')[3];
            } catch {
                return context.USER_CONFIG.AZURE_DALLE_API;
            }
        case 'openai':
            return context.USER_CONFIG.DALL_E_MODEL;
        case 'workers':
            return context.USER_CONFIG.WORKERS_IMAGE_MODEL;
        default:
            return null;
    }
}

export function imageModelKey(agentName: string): string | null {
    switch (agentName) {
        case 'azure':
            return 'AZURE_DALLE_API';
        case 'openai':
            return 'DALL_E_MODEL';
        case 'workers':
            return 'WORKERS_IMAGE_MODEL';
        default:
            return null;
    }
}
