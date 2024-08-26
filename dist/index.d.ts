import type * as Telegram from 'telegram-bot-api-types';

declare class AgentShareConfig {
    AI_PROVIDER: string;
    AI_IMAGE_PROVIDER: string;
    SYSTEM_INIT_MESSAGE: string | null;
    SYSTEM_INIT_MESSAGE_ROLE: string;
}

declare type AgentUserConfig = Record<string, any> & DefineKeys & AgentShareConfig & OpenAIConfig & DalleAIConfig & AzureConfig & WorkersConfig & GeminiConfig & MistralConfig & CohereConfig & AnthropicConfig;

declare class AnthropicConfig {
    ANTHROPIC_API_KEY: string | null;
    ANTHROPIC_API_BASE: string;
    ANTHROPIC_CHAT_MODEL: string;
}

declare class APIClientBase {
    readonly token: string;
    readonly baseURL: string;
    constructor(token: string, baseURL?: string);
    private jsonRequest;
    private formDataRequest;
    request<T>(method: Telegram.BotMethod, params: T): Promise<Response>;
    requestJSON<T, R>(method: Telegram.BotMethod, params: T): Promise<R>;
}

declare interface APIGuard {
    fetch: (request: Request) => Promise<Response>;
}

declare class AzureConfig {
    AZURE_API_KEY: string | null;
    AZURE_COMPLETIONS_API: string | null;
    AZURE_DALLE_API: string | null;
}

declare class CohereConfig {
    COHERE_API_KEY: string | null;
    COHERE_API_BASE: string;
    COHERE_CHAT_MODEL: string;
}

declare interface CommandConfig {
    value: string;
    description?: string | null;
}

export declare function createRouter(): Router;

export declare function createTelegramBotAPI(token: string): TelegramBotAPI;

declare class DalleAIConfig {
    DALL_E_MODEL: string;
    DALL_E_IMAGE_SIZE: string;
    DALL_E_IMAGE_QUALITY: string;
    DALL_E_IMAGE_STYLE: string;
}

declare const _default: {
    fetch(request: Request, env: any): Promise<Response>;
};
export default _default;

declare class DefineKeys {
    DEFINE_KEYS: string[];
    trim: (lock: string[]) => Record<string, any>;
}

export declare const ENV: Environment;

declare class Environment extends EnvironmentConfig {
    BUILD_TIMESTAMP: any;
    BUILD_VERSION: any;
    I18N: I18n;
    readonly PLUGINS_ENV: Record<string, string>;
    readonly USER_CONFIG: AgentUserConfig;
    readonly CUSTOM_COMMAND: Record<string, CommandConfig>;
    readonly PLUGINS_COMMAND: Record<string, CommandConfig>;
    DATABASE: KVNamespace;
    API_GUARD: APIGuard | null;
    merge(source: any): void;
    private mergeCommands;
    private migrateOldEnv;
}

declare class EnvironmentConfig {
    LANGUAGE: string;
    UPDATE_BRANCH: string;
    CHAT_COMPLETE_API_TIMEOUT: number;
    TELEGRAM_API_DOMAIN: string;
    TELEGRAM_AVAILABLE_TOKENS: string[];
    DEFAULT_PARSE_MODE: string;
    TELEGRAM_MIN_STREAM_INTERVAL: number;
    TELEGRAM_PHOTO_SIZE_OFFSET: number;
    TELEGRAM_IMAGE_TRANSFER_MODE: string;
    I_AM_A_GENEROUS_PERSON: boolean;
    CHAT_WHITE_LIST: string[];
    LOCK_USER_CONFIG_KEYS: string[];
    TELEGRAM_BOT_NAME: string[];
    CHAT_GROUP_WHITE_LIST: string[];
    GROUP_CHAT_BOT_ENABLE: boolean;
    GROUP_CHAT_BOT_SHARE_MODE: boolean;
    AUTO_TRIM_HISTORY: boolean;
    MAX_HISTORY_LENGTH: number;
    MAX_TOKEN_LENGTH: number;
    HISTORY_IMAGE_PLACEHOLDER: string | null;
    HIDE_COMMAND_BUTTONS: string[];
    SHOW_REPLY_BUTTON: boolean;
    EXTRA_MESSAGE_CONTEXT: boolean;
    TELEGRAPH_ENABLE: boolean;
    STREAM_MODE: boolean;
    SAFE_MODE: boolean;
    DEBUG_MODE: boolean;
    DEV_MODE: boolean;
}

declare class GeminiConfig {
    GOOGLE_API_KEY: string | null;
    GOOGLE_COMPLETIONS_API: string;
    GOOGLE_COMPLETIONS_MODEL: string;
}

export declare function handleUpdate(token: string, update: Telegram.Update): Promise<Response | null>;

declare interface HelpI18n {
    summary: string;
    help: string;
    new: string;
    start: string;
    img: string;
    version: string;
    setenv: string;
    setenvs: string;
    delenv: string;
    system: string;
    redo: string;
    echo: string;
}

declare interface I18n {
    env: {
        system_init_message: string;
    };
    command: {
        help: HelpI18n & Record<string, string>;
        new: {
            new_chat_start: string;
        };
    };
}

declare interface KVNamespace {
    get: (key: string) => Promise<string | any>;
    put: (key: string, value: any, options?: {
        expirationTtl?: number;
        expiration?: number;
    }) => Promise<void>;
    delete: (key: string) => Promise<void>;
}

declare class MistralConfig {
    MISTRAL_API_KEY: string | null;
    MISTRAL_API_BASE: string;
    MISTRAL_CHAT_MODEL: string;
}

declare class OpenAIConfig {
    OPENAI_API_KEY: string[];
    OPENAI_CHAT_MODEL: string;
    OPENAI_API_BASE: string;
    OPENAI_API_EXTRA_PARAMS: Record<string, any>;
}

declare type QueryParams = Record<string, string | string[]>;

declare class Router {
    private readonly routes;
    private readonly base;
    errorHandler: (req: RouterRequest, error: Error) => Promise<Response> | Response;
    constructor({ base, routes, ...other }?: {
        base?: string | undefined;
        routes?: never[] | undefined;
    });
    private parseQueryParams;
    private normalizePath;
    private createRouteRegex;
    fetch(request: RouterRequest, ...args: any): Promise<Response>;
    route(method: string, path: string, ...handlers: RouterHandler[]): Router;
    get(path: string, ...handlers: RouterHandler[]): Router;
    post(path: string, ...handlers: RouterHandler[]): Router;
    put(path: string, ...handlers: RouterHandler[]): Router;
    delete(path: string, ...handlers: RouterHandler[]): Router;
    patch(path: string, ...handlers: RouterHandler[]): Router;
    head(path: string, ...handlers: RouterHandler[]): Router;
    options(path: string, ...handlers: RouterHandler[]): Router;
    all(path: string, ...handlers: RouterHandler[]): Router;
}

declare type RouterHandler = (req: RouterRequest, ...args: any) => Promise<Response | null> | Response | null;

declare type RouterRequest = Request & {
    query?: QueryParams;
    params?: Record<string, any>;
    route?: string;
};

declare type TelegramBotAPI = APIClientBase & Telegram.AllBotMethods;

declare class WorkersConfig {
    CLOUDFLARE_ACCOUNT_ID: string | null;
    CLOUDFLARE_TOKEN: string | null;
    WORKERS_CHAT_MODEL: string;
    WORKERS_IMAGE_MODEL: string;
}

export { }
