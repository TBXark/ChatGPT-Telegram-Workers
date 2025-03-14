// -- 通用配置 --
export class AgentShareConfig {
    // AI提供商: auto, openai, azure, workers, gemini, mistral
    AI_PROVIDER = 'auto';
    // AI图片提供商: auto, openai, azure, workers
    AI_IMAGE_PROVIDER = 'auto';
    // 全局默认初始化消息
    SYSTEM_INIT_MESSAGE: string | null = null;
    // DEPRECATED: 全局默认初始化消息角色, 废弃此选项
    // SYSTEM_INIT_MESSAGE_ROLE = 'system';
}

// -- Open AI 配置 --
export class OpenAIConfig {
    // OpenAI API Key
    OPENAI_API_KEY: string[] = [];
    // OpenAI的模型名称
    OPENAI_CHAT_MODEL = 'gpt-4o-mini';
    // OpenAI API BASE
    OPENAI_API_BASE = 'https://api.openai.com/v1';
    // OpenAI API Extra Params
    OPENAI_API_EXTRA_PARAMS: Record<string, any> = {};
    // OpenAI Chat Models List
    OPENAI_CHAT_MODELS_LIST = '';
}

// -- DALLE 配置 --
export class DallEConfig {
    // DALL-E的模型名称
    DALL_E_MODEL = 'dall-e-3';
    // DALL-E图片尺寸
    DALL_E_IMAGE_SIZE = '1024x1024';
    // DALL-E图片质量
    DALL_E_IMAGE_QUALITY = 'standard';
    // DALL-E图片风格
    DALL_E_IMAGE_STYLE = 'vivid';
    // DALL-E Models List
    DALL_E_MODELS_LIST = '["dall-e-3"]';
}

// -- AZURE 配置 --
export class AzureConfig {
    // Azure API Key
    AZURE_API_KEY: string | null = null;
    // Azure Resource Name
    AZURE_RESOURCE_NAME: string | null = null;
    // Azure Chat Model
    AZURE_CHAT_MODEL: string = 'gpt-4o-mini';
    // Azure Image Model
    AZURE_IMAGE_MODEL: string = 'dall-e-3';
    // Azure API version
    AZURE_API_VERSION = '2024-06-01';
    // Azure Chat Models List
    AZURE_CHAT_MODELS_LIST = '';
    // AZURE Chat API Extra Params
    AZURE_CHAT_EXTRA_PARAMS: Record<string, any> = {};
}

// -- Workers 配置 --
export class WorkersConfig {
    // Cloudflare Account ID
    CLOUDFLARE_ACCOUNT_ID: string | null = null;
    // Cloudflare Token
    CLOUDFLARE_TOKEN: string | null = null;
    // Text Generation Model
    WORKERS_CHAT_MODEL = '@cf/qwen/qwen1.5-7b-chat-awq';
    // Text-to-Image Model
    WORKERS_IMAGE_MODEL = '@cf/black-forest-labs/flux-1-schnell';
    // Workers Chat Models List, When empty, will use the api to get the list
    WORKERS_CHAT_MODELS_LIST = '';
    // Workers Image Models List, When empty, will use the api to get the list
    WORKERS_IMAGE_MODELS_LIST = '';
    // Workers Chat API Extra Params
    WORKERS_CHAT_EXTRA_PARAMS: Record<string, any> = {};
}

// -- Gemini 配置 --
export class GeminiConfig {
    // Google Gemini API Key
    GOOGLE_API_KEY: string | null = null;
    // Google Gemini API: https://ai.google.dev/gemini-api/docs/openai#rest
    GOOGLE_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
    // Google Gemini Model
    GOOGLE_CHAT_MODEL = 'gemini-1.5-flash';
    // Google Chat Models List
    GOOGLE_CHAT_MODELS_LIST = '';
    // Google Chat API Extra Params
    GOOGLE_CHAT_EXTRA_PARAMS: Record<string, any> = {};
}

// -- Mistral 配置 --
export class MistralConfig {
    // Mistral api key
    MISTRAL_API_KEY: string | null = null;
    // Mistral api base
    MISTRAL_API_BASE = 'https://api.mistral.ai/v1';
    // Mistral api model
    MISTRAL_CHAT_MODEL = 'mistral-tiny';
    // Mistral api chat models list
    MISTRAL_CHAT_MODELS_LIST = '';
    // Mistral Chat API Extra Params
    MISTRAL_CHAT_EXTRA_PARAMS: Record<string, any> = {};
}

// -- Cohere 配置 --
export class CohereConfig {
    // Cohere api key
    COHERE_API_KEY: string | null = null;
    // Cohere api base
    COHERE_API_BASE = 'https://api.cohere.com/v2';
    // Cohere api model
    COHERE_CHAT_MODEL = 'command-r-plus';
    // Cohere api chat models list
    COHERE_CHAT_MODELS_LIST = '';
    // Cohere Chat API Extra Params
    COHERE_CHAT_EXTRA_PARAMS: Record<string, any> = {};
}

// -- Anthropic 配置 --
export class AnthropicConfig {
    // Anthropic api key
    ANTHROPIC_API_KEY: string | null = null;
    // Anthropic api base
    ANTHROPIC_API_BASE = 'https://api.anthropic.com/v1';
    // Anthropic api model
    ANTHROPIC_CHAT_MODEL = 'claude-3-5-haiku-latest';
    // Anthropic api chat models list
    ANTHROPIC_CHAT_MODELS_LIST = '';
    // Anthropic Chat API Extra Params
    ANTHROPIC_CHAT_EXTRA_PARAMS: Record<string, any> = {};
}

// -- DeepSeek 配置 --
export class DeepSeekConfig {
    // DeepSeek api key
    DEEPSEEK_API_KEY: string | null = null;
    // DeepSeek api base
    DEEPSEEK_API_BASE = 'https://api.deepseek.com';
    // DeepSeek api model
    DEEPSEEK_CHAT_MODEL = 'deepseek-chat';
    // DeepSeek api chat models list
    DEEPSEEK_CHAT_MODELS_LIST = '';
    // DeepSeek Chat API Extra Params
    DEEPSEEK_CHAT_EXTRA_PARAMS: Record<string, any> = {};
}

// -- Groq 配置 --
export class GroqConfig {
    // Groq api key
    GROQ_API_KEY: string | null = null;
    // Groq api base
    GROQ_API_BASE = 'https://api.groq.com/openai/v1';
    // Groq api model
    GROQ_CHAT_MODEL = 'groq-chat';
    // Groq api chat models list
    GROQ_CHAT_MODELS_LIST = '';
    // Groq Chat API Extra Params
    GROQ_CHAT_EXTRA_PARAMS: Record<string, any> = {};
}

export class XAIConfig {
    // XAI api key
    XAI_API_KEY: string | null = null;
    // XAI api base
    XAI_API_BASE = 'https://api.x.ai/v1';
    // XAI api model
    XAI_CHAT_MODEL = 'grok-2-latest';
    // XAI api chat models list
    XAI_CHAT_MODELS_LIST = '';
    // XAI Chat API Extra Params
    XAI_CHAT_EXTRA_PARAMS: Record<string, any> = {};
}

type UserConfig = AgentShareConfig & OpenAIConfig & DallEConfig & AzureConfig & WorkersConfig & GeminiConfig & MistralConfig & CohereConfig & AnthropicConfig & DeepSeekConfig & GroqConfig & XAIConfig;
export type AgentUserConfigKey = keyof UserConfig;

export class DefineKeys {
    DEFINE_KEYS: AgentUserConfigKey[] = [];
}

export type AgentUserConfig = Record<string, any> & DefineKeys & UserConfig;

// -- 只能通过环境变量覆盖的配置 --
export class EnvironmentConfig {
    // 多语言支持
    LANGUAGE = 'zh-cn';
    // 检查更新的分支
    UPDATE_BRANCH = 'master';
    // Chat Complete API Timeout
    CHAT_COMPLETE_API_TIMEOUT = 0;

    // -- Telegram 相关 --
    //
    // Telegram API Domain
    TELEGRAM_API_DOMAIN = 'https://api.telegram.org';
    // 允许访问的Telegram Token， 设置时以逗号分隔
    TELEGRAM_AVAILABLE_TOKENS: string[] = [];
    // 默认消息模式
    DEFAULT_PARSE_MODE = 'Markdown';
    // 最小stream模式消息间隔，小于等于0则不限制
    TELEGRAM_MIN_STREAM_INTERVAL = 0;
    // 图片尺寸偏移 0为第一位，-1为最后一位, 越靠后的图片越大。PS: 图片过大可能导致token消耗过多，或者workers超时或内存不足
    // 默认选择次低质量的图片
    TELEGRAM_PHOTO_SIZE_OFFSET = 1;
    // 向LLM优先传递图片方式：url, base64
    TELEGRAM_IMAGE_TRANSFER_MODE = 'base64';
    // 模型列表列数
    MODEL_LIST_COLUMNS = 1;

    // --  权限相关 --
    //
    // 允许所有人使用
    I_AM_A_GENEROUS_PERSON = false;
    // 白名单
    CHAT_WHITE_LIST: string[] = [];
    // 用户配置
    LOCK_USER_CONFIG_KEYS: AgentUserConfigKey[] = [
        // 默认为API BASE 防止被替换导致token 泄露
        'OPENAI_API_BASE',
        'GOOGLE_API_BASE',
        'MISTRAL_API_BASE',
        'COHERE_API_BASE',
        'ANTHROPIC_API_BASE',
        'DEEPSEEK_API_BASE',
        'GROQ_API_BASE',
    ];

    // -- 群组相关 --
    //
    // 允许访问的Telegram Token 对应的Bot Name， 设置时以逗号分隔
    TELEGRAM_BOT_NAME: string[] = [];
    // 群组白名单
    CHAT_GROUP_WHITE_LIST: string[] = [];
    // 群组机器人开关
    GROUP_CHAT_BOT_ENABLE = true;
    // 群组机器人共享模式,关闭后，一个群组只有一个会话和配置。开启的话群组的每个人都有自己的会话上下文
    GROUP_CHAT_BOT_SHARE_MODE = true;

    // -- 历史记录相关 --
    //
    // 为了避免4096字符限制，将消息删减
    AUTO_TRIM_HISTORY = true;
    // 最大历史记录长度
    MAX_HISTORY_LENGTH = 20;
    // 最大消息长度
    MAX_TOKEN_LENGTH = -1;
    // Image占位符: 当此环境变量存在时，则历史记录中的图片将被替换为此占位符
    HISTORY_IMAGE_PLACEHOLDER: string | null = null;

    // -- 特性开关 --
    //
    // 隐藏部分命令按钮
    HIDE_COMMAND_BUTTONS: string[] = [];
    // 显示快捷回复按钮
    SHOW_REPLY_BUTTON = false;
    // 额外引用消息开关
    EXTRA_MESSAGE_CONTEXT = false;
    // 额外引用多媒体消息特性: image
    EXTRA_MESSAGE_MEDIA_COMPATIBLE = ['image'];

    // -- 模式开关 --
    //
    // 使用流模式
    STREAM_MODE = true;
    // 安全模式
    SAFE_MODE = true;
    // 调试模式
    DEBUG_MODE = false;
    // 开发模式
    DEV_MODE = false;
}
