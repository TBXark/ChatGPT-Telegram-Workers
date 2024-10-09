import type { APIGuard, CommandConfig, KVNamespace } from './types';
import loadI18n from '../i18n';
import {
    AgentShareConfig,
    AnthropicConfig,
    AzureConfig,
    CohereConfig,
    DalleAIConfig,
    DefineKeys,
    EnvironmentConfig,
    GeminiConfig,
    MistralConfig,
    OpenAIConfig,
    WorkersConfig,
} from './config';
import { ConfigMerger } from './merger';

export type AgentUserConfig = Record<string, any> &
    DefineKeys &
    AgentShareConfig &
    OpenAIConfig &
    DalleAIConfig &
    AzureConfig &
    WorkersConfig &
    GeminiConfig &
    MistralConfig &
    CohereConfig &
    AnthropicConfig;

function createAgentUserConfig(): AgentUserConfig {
    return Object.assign(
        {},
        new DefineKeys(),
        new AgentShareConfig(),
        new OpenAIConfig(),
        new DalleAIConfig(),
        new AzureConfig(),
        new WorkersConfig(),
        new GeminiConfig(),
        new MistralConfig(),
        new CohereConfig(),
        new AnthropicConfig(),
    );
}

export const ENV_KEY_MAPPER: Record<string, string> = {
    CHAT_MODEL: 'OPENAI_CHAT_MODEL',
    API_KEY: 'OPENAI_API_KEY',
    WORKERS_AI_MODEL: 'WORKERS_CHAT_MODEL',
};

class Environment extends EnvironmentConfig {
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
    I18N = loadI18n();
    readonly PLUGINS_ENV: Record<string, string> = {};
    readonly USER_CONFIG: AgentUserConfig = createAgentUserConfig();
    readonly CUSTOM_COMMAND: Record<string, CommandConfig> = {};
    readonly PLUGINS_COMMAND: Record<string, CommandConfig> = {};

    DATABASE: KVNamespace = null as any;
    API_GUARD: APIGuard | null = null;

    constructor() {
        super();
        this.merge = this.merge.bind(this);
    }

    merge(source: any) {
        // 全局对象
        this.DATABASE = source.DATABASE;
        this.API_GUARD = source.API_GUARD;

        // 绑定自定义命令
        this.mergeCommands(
            'CUSTOM_COMMAND_',
            'COMMAND_DESCRIPTION_',
            'COMMAND_SCOPE_',
            source,
            this.CUSTOM_COMMAND,
        );

        // 绑定插件命令
        this.mergeCommands(
            'PLUGIN_COMMAND_',
            'PLUGIN_DESCRIPTION_',
            'PLUGIN_SCOPE_',
            source,
            this.PLUGINS_COMMAND,
        );

        // 绑定插件环境变量
        const pluginEnvPrefix = 'PLUGIN_ENV_';
        for (const key of Object.keys(source)) {
            if (key.startsWith(pluginEnvPrefix)) {
                const plugin = key.substring(pluginEnvPrefix.length);
                this.PLUGINS_ENV[plugin] = source[key];
            }
        }

        // 合并环境变量
        ConfigMerger.merge(this, source, [
            'BUILD_TIMESTAMP',
            'BUILD_VERSION',
            'I18N',
            'PLUGINS_ENV',
            'USER_CONFIG',
            'CUSTOM_COMMAND',
            'PLUGINS_COMMAND',
            'DATABASE',
            'API_GUARD',
        ]);
        ConfigMerger.merge(this.USER_CONFIG, source);
        this.migrateOldEnv(source);
        this.USER_CONFIG.DEFINE_KEYS = [];
        this.I18N = loadI18n(this.LANGUAGE.toLowerCase());
    }

    private mergeCommands(prefix: string, descriptionPrefix: string, scopePrefix: string, source: any, target: Record<string, CommandConfig>) {
        for (const key of Object.keys(source)) {
            if (key.startsWith(prefix)) {
                const cmd = key.substring(prefix.length);
                target[`/${cmd}`] = {
                    value: source[key],
                    description: source[`${descriptionPrefix}${cmd}`],
                    scope: source[`${scopePrefix}${cmd}`]?.split(',').map((s: string) => s.trim()),
                };
            }
        }
    }

    private migrateOldEnv(source: any) {
        // 兼容旧版 TELEGRAM_TOKEN
        if (source.TELEGRAM_TOKEN && !this.TELEGRAM_AVAILABLE_TOKENS.includes(source.TELEGRAM_TOKEN)) {
            if (source.BOT_NAME && this.TELEGRAM_AVAILABLE_TOKENS.length === this.TELEGRAM_BOT_NAME.length) {
                this.TELEGRAM_BOT_NAME.push(source.BOT_NAME);
            }
            this.TELEGRAM_AVAILABLE_TOKENS.push(source.TELEGRAM_TOKEN);
        }

        // 兼容旧版 OPENAI_API_DOMAIN
        if (source.OPENAI_API_DOMAIN && !this.USER_CONFIG.OPENAI_API_BASE) {
            this.USER_CONFIG.OPENAI_API_BASE = `${source.OPENAI_API_DOMAIN}/v1`;
        }

        // 兼容旧版 WORKERS_AI_MODEL
        if (source.WORKERS_AI_MODEL && !this.USER_CONFIG.WORKERS_CHAT_MODEL) {
            this.USER_CONFIG.WORKERS_CHAT_MODEL = source.WORKERS_AI_MODEL;
        }

        // 兼容旧版API_KEY
        if (source.API_KEY && this.USER_CONFIG.OPENAI_API_KEY.length === 0) {
            this.USER_CONFIG.OPENAI_API_KEY = source.API_KEY.split(',');
        }

        // 兼容旧版CHAT_MODEL
        if (source.CHAT_MODEL && !this.USER_CONFIG.OPENAI_CHAT_MODEL) {
            this.USER_CONFIG.OPENAI_CHAT_MODEL = source.CHAT_MODEL;
        }

        // 选择对应语言的SYSTEM_INIT_MESSAGE
        if (!this.USER_CONFIG.SYSTEM_INIT_MESSAGE) {
            this.USER_CONFIG.SYSTEM_INIT_MESSAGE = this.I18N?.env?.system_init_message || 'You are a helpful assistant';
        }
    }
}

export const ENV = new Environment();
