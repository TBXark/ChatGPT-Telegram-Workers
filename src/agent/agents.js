import {isOpenAIEnable, requestCompletionsFromOpenAI, requestImageFromOpenAI} from "./openai.js";
import {isWorkersAIEnable, requestCompletionsFromWorkersAI, requestImageFromWorkersAI} from "./workersai.js";
import {isGeminiAIEnable, requestCompletionsFromGeminiAI} from "./gemini.js";
import {isMistralAIEnable, requestCompletionsFromMistralAI} from "./mistralai.js";
import {isCohereAIEnable, requestCompletionsFromCohereAI} from "./cohere.js";
import {isAnthropicAIEnable, requestCompletionsFromAnthropicAI} from "./anthropic.js";
import {
    isAzureEnable,
    isAzureImageEnable,
    requestCompletionsFromAzureOpenAI,
    requestImageFromAzureOpenAI
} from "./azure.js";

export const chatLlmAgents = [
    {
        name: "azure",
        enable: isAzureEnable,
        request: requestCompletionsFromAzureOpenAI
    },
    {
        name: "openai",
        enable: isOpenAIEnable,
        request: requestCompletionsFromOpenAI
    },
    {
        name: "workers",
        enable: isWorkersAIEnable,
        request: requestCompletionsFromWorkersAI
    },
    {
        name: "gemini",
        enable: isGeminiAIEnable,
        request: requestCompletionsFromGeminiAI
    },
    {
        name: "mistral",
        enable: isMistralAIEnable,
        request: requestCompletionsFromMistralAI
    },
    {
        name: "cohere",
        enable: isCohereAIEnable,
        request: requestCompletionsFromCohereAI
    },
    {
        name: "anthropic",
        enable: isAnthropicAIEnable,
        request: requestCompletionsFromAnthropicAI
    }
]

export function currentChatModel(agent, context) {
    switch (agent) {
        case "azure":
            return "azure";
        case "openai":
            return context.USER_CONFIG.OPENAI_CHAT_MODEL;
        case "workers":
            return context.USER_CONFIG.WORKERS_CHAT_MODEL;
        case "gemini":
            return context.USER_CONFIG.GOOGLE_COMPLETIONS_MODEL;
        case "mistral":
            return context.USER_CONFIG.MISTRAL_CHAT_MODEL;
        case "cohere":
            return context.USER_CONFIG.COHERE_CHAT_MODEL;
        case "anthropic":
            return context.USER_CONFIG.ANTHROPIC_CHAT_MODEL;
        default:
            return null
    }
}

export function defaultChatAgent(context) {
    for (const llm of chatLlmAgents) {
        if (llm.enable(context)) {
            return llm.name;
        }
    }
    return null
}


export const imageGenAgents = [
    {
        name: "azure",
        enable: isAzureImageEnable,
        request: requestImageFromAzureOpenAI
    },
    {
        name: "openai",
        enable: isOpenAIEnable,
        request: requestImageFromOpenAI
    },
    {
        name: "workers",
        enable: isWorkersAIEnable,
        request: requestImageFromWorkersAI
    }
]
