import type { I18n } from '../types/i18n';
import type { APIGuard, KVNamespace } from '../types/workers';
import type { AgentUserConfig, CommandConfig } from './config';
import { USER_CONFIG_LOCK_KEYS, createAgentUserConfig } from './config';

export class Environment implements Record<string, any> {
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
    LOCK_USER_CONFIG_KEYS = USER_CONFIG_LOCK_KEYS;

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

    PLUGINS_ENV: Record<string, string> = {};
    USER_CONFIG: AgentUserConfig = createAgentUserConfig();
    CUSTOM_COMMAND: Record<string, CommandConfig> = {};
    PLUGINS_COMMAND: Record<string, CommandConfig> = {};

    DATABASE: KVNamespace = null as any;
    API_GUARD: APIGuard | null = null;
}

export const ENV_LOCK_KEYS: Set<string> = new Set([
    'CUSTOM_COMMAND',
    'PLUGIN_COMMAND',
    'PLUGINS_ENV',
    'USER_CONFIG',
    'DATABASE',
    'API_GUARD',
]);
export const ENV_KEY_MAPPER: Record<string, string> = {
    CHAT_MODEL: 'OPENAI_CHAT_MODEL',
    API_KEY: 'OPENAI_API_KEY',
    WORKERS_AI_MODEL: 'WORKERS_CHAT_MODEL',
};
