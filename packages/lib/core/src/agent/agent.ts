import type { AgentUserConfig } from '../config/env';
import type { ChatAgent, ImageAgent } from './types';
import { Anthropic } from './anthropic';
import { AzureChatAI, AzureImageAI } from './azure';
import { Cohere } from './cohere';
import { Gemini } from './gemini';
import { Mistral } from './mistralai';
import { Dalle, OpenAI } from './openai';
import { WorkersChat, WorkersImage } from './workersai';

export const CHAT_AGENTS: ChatAgent[] = [
    new OpenAI(),
    new Anthropic(),
    new AzureChatAI(),
    new WorkersChat(),
    new Cohere(),
    new Gemini(),
    new Mistral(),
];

export function loadChatLLM(context: AgentUserConfig): ChatAgent | null {
    for (const llm of CHAT_AGENTS) {
        if (llm.name === context.AI_PROVIDER) {
            return llm;
        }
    }
    // 找不到指定的AI，使用第一个可用的AI
    for (const llm of CHAT_AGENTS) {
        if (llm.enable(context)) {
            return llm;
        }
    }
    return null;
}

export const IMAGE_AGENTS: ImageAgent[] = [
    new AzureImageAI(),
    new Dalle(),
    new WorkersImage(),
];

export function loadImageGen(context: AgentUserConfig): ImageAgent | null {
    for (const imgGen of IMAGE_AGENTS) {
        if (imgGen.name === context.AI_IMAGE_PROVIDER) {
            return imgGen;
        }
    }
    // 找不到指定的AI，使用第一个可用的AI
    for (const imgGen of IMAGE_AGENTS) {
        if (imgGen.enable(context)) {
            return imgGen;
        }
    }
    return null;
};
