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
import "../types/context.js"

/**
 * @typedef {object} Agent
 * @property {string} name
 * @property {function} enable
 * @property {function} request
 */

/**
 * @type {[Agent]}
 */
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

/**
 * @param {string} agentName
 * @param {ContextType} context
 * @returns {null|string}
 */
export function currentChatModel(agentName, context) {
    switch (agentName) {
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


/**
 * 加载聊天AI
 *
 * @param {ContextType} context
 * @return {Agent | null}
 */
export function loadChatLLM(context) {
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


/**
 * @type {[Agent]}
 */
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


/**
 * 加载图片AI
 *
 * @param {ContextType} context
 * @return {Agent | null}
 */
export function loadImageGen(context) {
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

/**
 * @param {string} agentName
 * @param {ContextType} context
 * @returns {null|string}
 */
export function currentImageModel(agentName, context) {
    switch (agentName) {
        case "azure":
            return "azure";
        case "openai":
            return context.USER_CONFIG.DALL_E_MODEL;
        case "workers":
            return context.USER_CONFIG.WORKERS_IMAGE_MODEL;
        default:
            return null
    }
}
