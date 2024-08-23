import type { I18n, I18nGenerator } from '../types/i18n';
import { newAgentUserConfig } from './config';

export class Environment {
    // -- 版本数据 --
    //
    // 当前版本
    // eslint-disable-next-line ts/ban-ts-comment
    // @ts-expect-error
    BUILD_TIMESTAMP = typeof __BUILD_TIMESTAMP__ === 'number' ? __BUILD_TIMESTAMP__ : 0;
    // 当前版本 commit id
    // eslint-disable-next-line ts/ban-ts-comment
    // @ts-expect-error
    BUILD_VERSION = typeof __BUILD_VERSION__ === 'string' ? __BUILD_VERSION__ : 'unknown';

    // -- 基础配置 --
    I18N: I18n = null as any;
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
    TELEGRAM_IMAGE_TRANSFER_MODE = 'url';

    // --  权限相关 --
    //
    // 允许所有人使用
    I_AM_A_GENEROUS_PERSON = false;
    // 白名单
    CHAT_WHITE_LIST: string[] = [];
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
    HISTORY_IMAGE_PLACEHOLDER = null;

    // -- 特性开关 --
    //
    // 隐藏部分命令按钮
    HIDE_COMMAND_BUTTONS: string[] = [];
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

    USER_CONFIG = newAgentUserConfig();

    PLUGINS_ENV: Record<string, string> = {};
}

export const ENV = new Environment();

export interface KVNamespace {
    get: (key: string) => Promise<string | any>;
    put: (key: string, value: any, options?: { expirationTtl?: number; expiration?: number }) => Promise<void>;
    delete: (key: string) => Promise<void>;
}

// eslint-disable-next-line import/no-mutable-exports
export let DATABASE: KVNamespace = null as any;

export interface APIGuard {
    fetch: (request: Request) => Promise<Response>;
}

// eslint-disable-next-line import/no-mutable-exports
export let API_GUARD: APIGuard | null = null;

export const CUSTOM_COMMAND: Record<string, string> = {};
export const CUSTOM_COMMAND_DESCRIPTION: Record<string, string> = {};

export const PLUGINS_COMMAND: Record<string, string> = {};
export const PLUGINS_COMMAND_DESCRIPTION: Record<string, string> = {};

const ENV_TYPES: Record<string, string> = {
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
    HISTORY_IMAGE_PLACEHOLDER: 'string',
};

export const ENV_KEY_MAPPER: Record<string, string> = {
    CHAT_MODEL: 'OPENAI_CHAT_MODEL',
    API_KEY: 'OPENAI_API_KEY',
    WORKERS_AI_MODEL: 'WORKERS_CHAT_MODEL',
};

function parseArray(raw: string): string[] {
    raw = raw.trim();
    if (raw === '') {
        return [];
    }
    if (raw.startsWith('[') && raw.endsWith(']')) {
        try {
            return JSON.parse(raw);
        } catch (e) {
            console.error(e);
        }
    }
    return raw.split(',');
}

export function mergeEnvironment(target: any, source: Record<string, any>) {
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
                target[key] = Number.parseInt(source[key], 10);
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

export function initEnv(env: any, i18n: I18nGenerator) {
    // 全局对象
    DATABASE = env.DATABASE;
    API_GUARD = env.API_GUARD;

    // 绑定自定义命令
    const customCommandPrefix = 'CUSTOM_COMMAND_';
    const customCommandDescriptionPrefix = 'COMMAND_DESCRIPTION_';
    for (const key of Object.keys(env)) {
        if (key.startsWith(customCommandPrefix)) {
            const cmd = key.substring(customCommandPrefix.length);
            CUSTOM_COMMAND[`/${cmd}`] = env[key];
            CUSTOM_COMMAND_DESCRIPTION[`/${cmd}`] = env[customCommandDescriptionPrefix + cmd];
        }
    }

    const pluginCommandPrefix = 'PLUGIN_COMMAND_';
    const pluginCommandDescriptionPrefix = 'PLUGIN_COMMAND_DESCRIPTION_';
    for (const key of Object.keys(env)) {
        if (key.startsWith(pluginCommandPrefix)) {
            const cmd = key.substring(pluginCommandPrefix.length);
            PLUGINS_COMMAND[`/${cmd}`] = env[key];
            PLUGINS_COMMAND_DESCRIPTION[`/${cmd}`] = env[pluginCommandDescriptionPrefix + cmd];
        }
    }

    const pluginEnvPrefix = 'PLUGIN_ENV_';
    for (const key of Object.keys(env)) {
        if (key.startsWith(pluginEnvPrefix)) {
            const plugin = key.substring(pluginEnvPrefix.length);
            ENV.PLUGINS_ENV[plugin] = env[key];
        }
    }

    // 合并环境变量
    mergeEnvironment(ENV, env);
    mergeEnvironment(ENV.USER_CONFIG, env);
    migrateOldEnv(env, i18n);
    ENV.USER_CONFIG.DEFINE_KEYS = [];
}

function migrateOldEnv(env: any, i18n: I18nGenerator) {
    ENV.I18N = i18n((ENV.LANGUAGE || 'cn').toLowerCase());

    // 兼容旧版 TELEGRAM_TOKEN
    if (env.TELEGRAM_TOKEN && !ENV.TELEGRAM_AVAILABLE_TOKENS.includes(env.TELEGRAM_TOKEN)) {
        if (env.BOT_NAME && ENV.TELEGRAM_AVAILABLE_TOKENS.length === ENV.TELEGRAM_BOT_NAME.length) {
            ENV.TELEGRAM_BOT_NAME.push(env.BOT_NAME);
        }
        ENV.TELEGRAM_AVAILABLE_TOKENS.push(env.TELEGRAM_TOKEN);
    }

    // 兼容旧版 OPENAI_API_DOMAIN
    if (env.OPENAI_API_DOMAIN && !ENV.USER_CONFIG.OPENAI_API_BASE) {
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
