// -- 通用配置 --
import { ENV } from './env';

export class AgentShareConfig {
    // AI提供商: auto, openai, azure, workers, gemini, mistral
    AI_PROVIDER = 'auto';
    // AI图片提供商: auto, openai, azure, workers
    AI_IMAGE_PROVIDER = 'auto';
    // 全局默认初始化消息
    SYSTEM_INIT_MESSAGE: string | null = null;
    // 全局默认初始化消息角色
    SYSTEM_INIT_MESSAGE_ROLE = 'system';
}

// -- Open AI 配置 --
export class OpenAIConfig {
    // OpenAI API Key
    OPENAI_API_KEY: string[] = [];
    // OpenAI的模型名称
    OPENAI_CHAT_MODEL = 'gpt-4o-mini';
    // OpenAI API BASE ``
    OPENAI_API_BASE = 'https://api.openai.com/v1';
    // OpenAI API Extra Params
    OPENAI_API_EXTRA_PARAMS: Record<string, any> = {};
}

// -- DALLE 配置 --
export class DalleAIConfig {
    // DALL-E的模型名称
    DALL_E_MODEL = 'dall-e-2';
    // DALL-E图片尺寸
    DALL_E_IMAGE_SIZE = '512x512';
    // DALL-E图片质量
    DALL_E_IMAGE_QUALITY = 'standard';
    // DALL-E图片风格
    DALL_E_IMAGE_STYLE = 'vivid';
}

// -- AZURE 配置 --
export class AzureConfig {
    // Azure API Key
    AZURE_API_KEY: string | null = null;
    // Azure Completions API
    // https://RESOURCE_NAME.openai.azure.com/openai/deployments/MODEL_NAME/chat/completions?api-version=VERSION_NAME
    AZURE_COMPLETIONS_API: string | null = null;
    // Azure DallE API
    // https://RESOURCE_NAME.openai.azure.com/openai/deployments/MODEL_NAME/images/generations?api-version=VERSION_NAME
    AZURE_DALLE_API: string | null = null;
}

// -- Workers 配置 --
export class WorkersConfig {
    // Cloudflare Account ID
    CLOUDFLARE_ACCOUNT_ID: string | null = null;
    // Cloudflare Token
    CLOUDFLARE_TOKEN: string | null = null;
    // Text Generation Model
    WORKERS_CHAT_MODEL = '@cf/mistral/mistral-7b-instruct-v0.1 ';
    // Text-to-Image Model
    WORKERS_IMAGE_MODEL = '@cf/stabilityai/stable-diffusion-xl-base-1.0';
}

// -- Gemini 配置 --
export class GeminiConfig {
    // Google Gemini API Key
    GOOGLE_API_KEY: string | null = null;
    // Google Gemini API
    GOOGLE_COMPLETIONS_API = 'https://generativelanguage.googleapis.com/v1beta/models/';
    // Google Gemini Model
    GOOGLE_COMPLETIONS_MODEL = 'gemini-pro';
}

// -- Mistral 配置 --
export class MistralConfig {
    // mistral api key
    MISTRAL_API_KEY: string | null = null;
    // mistral api base
    MISTRAL_API_BASE = 'https://api.mistral.ai/v1';
    // mistral api model
    MISTRAL_CHAT_MODEL = 'mistral-tiny';
}

// -- Cohere 配置 --
export class CohereConfig {
    // cohere api key
    COHERE_API_KEY: string | null = null;
    // cohere api base
    COHERE_API_BASE = 'https://api.cohere.com/v1';
    // cohere api model
    COHERE_CHAT_MODEL = 'command-r-plus';
}

// -- Anthropic 配置 --
export class AnthropicConfig {
    // Anthropic api key
    ANTHROPIC_API_KEY: string | null = null;
    // Anthropic api base
    ANTHROPIC_API_BASE = 'https://api.anthropic.com/v1';
    // Anthropic api model
    ANTHROPIC_CHAT_MODEL = 'claude-3-haiku-20240307';
}

export class DefineKeys {
    DEFINE_KEYS: string[] = [];

    trim(): Record<string, any> {
        const config: Record<string, any> = { ...this };
        const keysSet = new Set<string>(this.DEFINE_KEYS || []);
        for (const key of ENV.LOCK_USER_CONFIG_KEYS) {
            keysSet.delete(key);
        }
        keysSet.add('DEFINE_KEYS');
        for (const key of Object.keys(config)) {
            if (!keysSet.has(key)) {
                delete config[key];
            }
        }
        return config;
    }
}

export type AgentUserConfig = DefineKeys &
    AgentShareConfig &
    OpenAIConfig &
    DalleAIConfig &
    AzureConfig &
    WorkersConfig &
    GeminiConfig &
    MistralConfig &
    CohereConfig &
    AnthropicConfig;

export function newAgentUserConfig(): AgentUserConfig {
    return Object.assign(
        {},
        new AgentShareConfig(),
        new OpenAIConfig(),
        new DalleAIConfig(),
        new AzureConfig(),
        new WorkersConfig(),
        new GeminiConfig(),
        new MistralConfig(),
        new CohereConfig(),
        new AnthropicConfig(),
        new DefineKeys(),
    );
}
