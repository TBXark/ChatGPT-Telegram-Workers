import type { I18nGenerator } from '../types/i18n';
import { ENV_LOCK_KEYS, Environment } from './env';
import { mergeEnvironment } from './utils';
import type { CommandConfig } from './config';

export const ENV = new Environment();

export function initEnv(source: any, target: Environment, i18n: I18nGenerator) {
    // 全局对象
    target.DATABASE = source.DATABASE;
    target.API_GUARD = source.API_GUARD;

    // 清理锁定的环境变量
    for (const key of ENV_LOCK_KEYS) {
        delete source[key];
    }

    // 绑定自定义命令
    target.CUSTOM_COMMAND = createCommandConfig(
        'CUSTOM_COMMAND_',
        'COMMAND_DESCRIPTION_',
        source,
    );

    // 绑定插件命令
    target.PLUGINS_COMMAND = createCommandConfig(
        'PLUGIN_COMMAND_',
        'PLUGIN_COMMAND_DESCRIPTION_',
        source,
    );

    // 绑定插件环境变量
    const pluginEnvPrefix = 'PLUGIN_ENV_';
    for (const key of Object.keys(source)) {
        if (key.startsWith(pluginEnvPrefix)) {
            const plugin = key.substring(pluginEnvPrefix.length);
            target.PLUGINS_ENV[plugin] = source[key];
        }
    }

    // 合并环境变量
    mergeEnvironment(target, source);
    mergeEnvironment(target.USER_CONFIG, source);
    migrateOldEnv(source, target, i18n);
    target.USER_CONFIG.DEFINE_KEYS = [];
}

function createCommandConfig(prefix: string, descriptionPrefix: string, source: any): Record<string, CommandConfig> {
    const target: Record<string, CommandConfig> = {};
    for (const key of Object.keys(source)) {
        if (key.startsWith(prefix)) {
            const cmd = key.substring(prefix.length);
            target[`/${cmd}`] = {
                value: source[key],
                description: source[`${descriptionPrefix}${cmd}`],
            };
        }
    }
    return target;
}

function migrateOldEnv(source: any, target: Environment, i18n: I18nGenerator) {
    target.I18N = i18n((target.LANGUAGE || 'cn').toLowerCase());

    // 兼容旧版 TELEGRAM_TOKEN
    if (source.TELEGRAM_TOKEN && !target.TELEGRAM_AVAILABLE_TOKENS.includes(source.TELEGRAM_TOKEN)) {
        if (source.BOT_NAME && target.TELEGRAM_AVAILABLE_TOKENS.length === target.TELEGRAM_BOT_NAME.length) {
            target.TELEGRAM_BOT_NAME.push(source.BOT_NAME);
        }
        target.TELEGRAM_AVAILABLE_TOKENS.push(source.TELEGRAM_TOKEN);
    }

    // 兼容旧版 OPENAI_API_DOMAIN
    if (source.OPENAI_API_DOMAIN && !target.USER_CONFIG.OPENAI_API_BASE) {
        target.USER_CONFIG.OPENAI_API_BASE = `${source.OPENAI_API_DOMAIN}/v1`;
    }

    // 兼容旧版 WORKERS_AI_MODEL
    if (source.WORKERS_AI_MODEL && !target.USER_CONFIG.WORKERS_CHAT_MODEL) {
        target.USER_CONFIG.WORKERS_CHAT_MODEL = source.WORKERS_AI_MODEL;
    }

    // 兼容旧版API_KEY
    if (source.API_KEY && target.USER_CONFIG.OPENAI_API_KEY.length === 0) {
        target.USER_CONFIG.OPENAI_API_KEY = source.API_KEY.split(',');
    }

    // 兼容旧版CHAT_MODEL
    if (source.CHAT_MODEL && !target.USER_CONFIG.OPENAI_CHAT_MODEL) {
        target.USER_CONFIG.OPENAI_CHAT_MODEL = source.CHAT_MODEL;
    }

    // 选择对应语言的SYSTEM_INIT_MESSAGE
    if (!target.USER_CONFIG.SYSTEM_INIT_MESSAGE) {
        target.USER_CONFIG.SYSTEM_INIT_MESSAGE = target.I18N?.env?.system_init_message || 'You are a helpful assistant';
    }
}
