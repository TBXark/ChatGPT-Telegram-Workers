import '../types/i18n.js';
import '../types/context.js';

/**
 * @class
 * @implements {UserConfigType}
 */
export class UserConfig {
    // -- 非配置属性 --
    DEFINE_KEYS = [];

    // -- 通用配置 --
    //
    // AI提供商: auto, openai, azure, workers, gemini, mistral
    AI_PROVIDER = 'auto';
    // AI图片提供商: auto, openai, azure, workers
    AI_IMAGE_PROVIDER = 'auto';
    // 全局默认初始化消息
    SYSTEM_INIT_MESSAGE = null;
    // 全局默认初始化消息角色
    SYSTEM_INIT_MESSAGE_ROLE = 'system';

    // -- Open AI 配置 --
    //
    // OpenAI API Key
    OPENAI_API_KEY = [];
    // OpenAI的模型名称
    OPENAI_CHAT_MODEL = 'gpt-4o-mini';
    // OpenAI API BASE ``
    OPENAI_API_BASE = 'https://api.openai.com/v1';
    // OpenAI API Extra Params
    OPENAI_API_EXTRA_PARAMS = {};

    // -- DALLE 配置 --
    //
    // DALL-E的模型名称
    DALL_E_MODEL = 'dall-e-2';
    // DALL-E图片尺寸
    DALL_E_IMAGE_SIZE = '512x512';
    // DALL-E图片质量
    DALL_E_IMAGE_QUALITY = 'standard';
    // DALL-E图片风格
    DALL_E_IMAGE_STYLE = 'vivid';

    // -- AZURE 配置 --
    //
    // Azure API Key
    AZURE_API_KEY = null;
    // Azure Completions API
    // https://RESOURCE_NAME.openai.azure.com/openai/deployments/MODEL_NAME/chat/completions?api-version=VERSION_NAME
    AZURE_COMPLETIONS_API = null;
    // Azure DallE API
    // https://RESOURCE_NAME.openai.azure.com/openai/deployments/MODEL_NAME/images/generations?api-version=VERSION_NAME
    AZURE_DALLE_API = null;

    // -- Workers 配置 --
    //
    // Cloudflare Account ID
    CLOUDFLARE_ACCOUNT_ID = null;
    // Cloudflare Token
    CLOUDFLARE_TOKEN = null;
    // Text Generation Model
    WORKERS_CHAT_MODEL = '@cf/mistral/mistral-7b-instruct-v0.1 ';
    // Text-to-Image Model
    WORKERS_IMAGE_MODEL = '@cf/stabilityai/stable-diffusion-xl-base-1.0';

    // -- Gemini 配置 --
    //
    // Google Gemini API Key
    GOOGLE_API_KEY = null;
    // Google Gemini API
    GOOGLE_COMPLETIONS_API = 'https://generativelanguage.googleapis.com/v1beta/models/';
    // Google Gemini Model
    GOOGLE_COMPLETIONS_MODEL = 'gemini-pro';

    // -- Mistral 配置 --
    //
    // mistral api key
    MISTRAL_API_KEY = null;
    // mistral api base
    MISTRAL_API_BASE = 'https://api.mistral.ai/v1';
    // mistral api model
    MISTRAL_CHAT_MODEL = 'mistral-tiny';

    // -- Cohere 配置 --
    //
    // cohere api key
    COHERE_API_KEY = null;
    // cohere api base
    COHERE_API_BASE = 'https://api.cohere.com/v1';
    // cohere api model
    COHERE_CHAT_MODEL = 'command-r-plus';

    // -- Anthropic 配置 --
    //
    // Anthropic api key
    ANTHROPIC_API_KEY = null;
    // Anthropic api base
    ANTHROPIC_API_BASE = 'https://api.anthropic.com/v1';
    // Anthropic api model
    ANTHROPIC_CHAT_MODEL = 'claude-3-haiku-20240307';
}


export class Environment {

    // -- 版本数据 --
    //
    // 当前版本
    BUILD_TIMESTAMP = process?.env?.BUILD_TIMESTAMP || 0;
    // 当前版本 commit id
    BUILD_VERSION = process?.env?.BUILD_VERSION || '';


    // -- 基础配置 --
    /**
     * @type {I18n | null}
     */
    I18N = null;
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
    TELEGRAM_AVAILABLE_TOKENS = [];
    // 默认消息模式
    DEFAULT_PARSE_MODE = 'Markdown';
    // 最小stream模式消息间隔，小于等于0则不限制
    TELEGRAM_MIN_STREAM_INTERVAL = 0;
    // 图片尺寸偏移 0为第一位，-1为最后一位, 越靠后的图片越大。PS: 图片过大可能导致token消耗过多，或者workers超时或内存不足
    // 默认选择次低质量的图片
    TELEGRAM_PHOTO_SIZE_OFFSET = 1;
    // 向LLM优先传递图片方式：url, base64
    TELEGRAM_IMAGE_TRANSFER_MODE = 'url';


    // --  权限相关 --
    //
    // 允许所有人使用
    I_AM_A_GENEROUS_PERSON = false;
    // 白名单
    CHAT_WHITE_LIST = [];
    // 用户配置
    LOCK_USER_CONFIG_KEYS = [
    // 默认为API BASE 防止被替换导致token 泄露
        'OPENAI_API_BASE',
        'GOOGLE_COMPLETIONS_API',
        'MISTRAL_API_BASE',
        'COHERE_API_BASE',
        'ANTHROPIC_API_BASE',
        'AZURE_COMPLETIONS_API',
        'AZURE_DALLE_API',
    ];

    // -- 群组相关 --
    //
    // 允许访问的Telegram Token 对应的Bot Name， 设置时以逗号分隔
    TELEGRAM_BOT_NAME = [];
    // 群组白名单
    CHAT_GROUP_WHITE_LIST = [];
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


    // -- 特性开关 --
    //
    // 隐藏部分命令按钮
    HIDE_COMMAND_BUTTONS = [];
    // 显示快捷回复按钮
    SHOW_REPLY_BUTTON = false;
    // 而外引用消息开关
    EXTRA_MESSAGE_CONTEXT = false;
    // 开启Telegraph图床
    TELEGRAPH_ENABLE = false;

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


    USER_CONFIG = new UserConfig();
}


// Environment Variables: Separate configuration values from a Worker script with Environment Variables.
export const ENV = new Environment();
// KV Namespace Bindings: Bind an instance of a KV Namespace to access its data in a Worker
export let DATABASE = null;
// Service Bindings: Bind to another Worker to invoke it directly from your code.
export let API_GUARD = null;

export const CUSTOM_COMMAND = {};
export const CUSTOM_COMMAND_DESCRIPTION = {};

export const CONST = {
    PASSWORD_KEY: 'chat_history_password',
    GROUP_TYPES: ['group', 'supergroup'],
};

const ENV_TYPES = {
    SYSTEM_INIT_MESSAGE: 'string',
    AZURE_API_KEY: 'string',
    AZURE_COMPLETIONS_API: 'string',
    AZURE_DALLE_API: 'string',
    CLOUDFLARE_ACCOUNT_ID: 'string',
    CLOUDFLARE_TOKEN: 'string',
    GOOGLE_API_KEY: 'string',
    MISTRAL_API_KEY: 'string',
    COHERE_API_KEY: 'string',
    ANTHROPIC_API_KEY: 'string',
};

export const ENV_KEY_MAPPER = {
    CHAT_MODEL: 'OPENAI_CHAT_MODEL',
    API_KEY: 'OPENAI_API_KEY',
    WORKERS_AI_MODEL: 'WORKERS_CHAT_MODEL',
};

/**
 *
 * @param {string} raw
 * @returns {string[]}
 */
function parseArray(raw) {
    if (raw.startsWith('[') && raw.endsWith(']')) {
        try {
            return JSON.parse(raw);
        } catch (e) {
            console.error(e);
        }
    }
    return raw.split(',');
}

/**
 *
 * @param {object} target
 * @param {object} source
 */
export function mergeEnvironment(target, source) {
    const sourceKeys = new Set(Object.keys(source));
    for (const key of Object.keys(target)) {
    // 不存在的key直接跳过
        if (!sourceKeys.has(key)) {
            continue;
        }
        const t = ENV_TYPES[key] || typeof target[key];
        // 不是字符串直接赋值
        if (typeof source[key] !== 'string') {
            target[key] = source[key];
            continue;
        }
        switch (t) {
        case 'number':
            target[key] = parseInt(source[key], 10);
            break;
        case 'boolean':
            target[key] = (source[key] || 'false') === 'true';
            break;
        case 'string':
            target[key] = source[key];
            break;
        case 'array':
            target[key] = parseArray(source[key]);
            break;
        case 'object':
            if (Array.isArray(target[key])) {
                target[key] = parseArray(source[key]);
            } else {
                try {
                    target[key] = JSON.parse(source[key]);
                } catch (e) {
                    console.error(e);
                }
            }
            break;
        default:
            target[key] = source[key];
            break;
        }
    }
}


/**
 * @param {object} env
 * @param {I18nGenerator} i18n
 */
export function initEnv(env, i18n) {

    // 全局对象
    DATABASE = env.DATABASE;
    API_GUARD = env.API_GUARD;

    // 绑定自定义命令
    const customCommandPrefix = 'CUSTOM_COMMAND_';
    const customCommandDescriptionPrefix = 'COMMAND_DESCRIPTION_';
    for (const key of Object.keys(env)) {
        if (key.startsWith(customCommandPrefix)) {
            const cmd = key.substring(customCommandPrefix.length);
            CUSTOM_COMMAND['/' + cmd] = env[key];
            CUSTOM_COMMAND_DESCRIPTION['/' + cmd] = env[customCommandDescriptionPrefix + cmd];
        }
    }

    // 合并环境变量
    mergeEnvironment(ENV, env);
    mergeEnvironment(ENV.USER_CONFIG, env);
    ENV.USER_CONFIG.DEFINE_KEYS = [];


    // 兼容旧版配置
    {
        ENV.I18N = i18n((ENV.LANGUAGE || 'cn').toLowerCase());

        // 兼容旧版 TELEGRAM_TOKEN
        if (env.TELEGRAM_TOKEN && !ENV.TELEGRAM_AVAILABLE_TOKENS.includes(env.TELEGRAM_TOKEN)) {
            if (env.BOT_NAME && ENV.TELEGRAM_AVAILABLE_TOKENS.length === ENV.TELEGRAM_BOT_NAME.length) {
                ENV.TELEGRAM_BOT_NAME.push(env.BOT_NAME);
            }
            ENV.TELEGRAM_AVAILABLE_TOKENS.push(env.TELEGRAM_TOKEN);
        }

        // 兼容旧版 OPENAI_API_DOMAIN
        if (env.OPENAI_API_DOMAIN && !ENV.OPENAI_API_BASE) {
            ENV.USER_CONFIG.OPENAI_API_BASE = `${env.OPENAI_API_DOMAIN}/v1`;
        }

        // 兼容旧版 WORKERS_AI_MODEL
        if (env.WORKERS_AI_MODEL && !ENV.USER_CONFIG.WORKERS_CHAT_MODEL) {
            ENV.USER_CONFIG.WORKERS_CHAT_MODEL = env.WORKERS_AI_MODEL;
        }

        // 兼容旧版API_KEY
        if (env.API_KEY && ENV.USER_CONFIG.OPENAI_API_KEY.length === 0) {
            ENV.USER_CONFIG.OPENAI_API_KEY = env.API_KEY.split(',');
        }

        // 兼容旧版CHAT_MODEL
        if (env.CHAT_MODEL && !ENV.USER_CONFIG.OPENAI_CHAT_MODEL) {
            ENV.USER_CONFIG.OPENAI_CHAT_MODEL = env.CHAT_MODEL;
        }

        // 选择对应语言的SYSTEM_INIT_MESSAGE
        if (!ENV.USER_CONFIG.SYSTEM_INIT_MESSAGE) {
            ENV.USER_CONFIG.SYSTEM_INIT_MESSAGE = ENV.I18N?.env?.system_init_message || 'You are a helpful assistant';
        }
    }
}
