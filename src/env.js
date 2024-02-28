import './i18n/type.js';

/**
 * @class Environment
 */
class Environment {
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
  // AI提供商: auto, openai, azure, workers, gemini, mistral
  AI_PROVIDER = 'auto';

  // -- Telegram 相关 --
  //
  // Telegram API Domain
  TELEGRAM_API_DOMAIN = 'https://api.telegram.org';
  // 允许访问的Telegram Token， 设置时以逗号分隔
  TELEGRAM_AVAILABLE_TOKENS = [];

  // --  权限相关 --
  //
  // 允许所有人使用
  I_AM_A_GENEROUS_PERSON = false;
  // 白名单
  CHAT_WHITE_LIST = [];
  // 用户配置
  LOCK_USER_CONFIG_KEYS = [];

  // -- 群组相关 --
  //
  // 允许访问的Telegram Token 对应的Bot Name， 设置时以逗号分隔
  TELEGRAM_BOT_NAME = [];
  // 群组白名单
  CHAT_GROUP_WHITE_LIST = [];
  // 群组机器人开关
  GROUP_CHAT_BOT_ENABLE = true;
  // 群组机器人共享模式,关闭后，一个群组只有一个会话和配置。开启的话群组的每个人都有自己的会话上下文
  GROUP_CHAT_BOT_SHARE_MODE = false;

  // -- 历史记录相关 --
  //
  // 为了避免4096字符限制，将消息删减
  AUTO_TRIM_HISTORY = true;
  // 最大历史记录长度
  MAX_HISTORY_LENGTH = 20;
  // 最大消息长度
  MAX_TOKEN_LENGTH = 2048;
  // 使用GPT3的TOKEN计数
  GPT3_TOKENS_COUNT = false;
  // GPT3计数器资源地址
  GPT3_TOKENS_COUNT_REPO = 'https://raw.githubusercontent.com/tbxark-arc/GPT-3-Encoder/master';

  // -- Prompt 相关 --
  //
  // 全局默认初始化消息
  SYSTEM_INIT_MESSAGE = null;
  // 全局默认初始化消息角色
  SYSTEM_INIT_MESSAGE_ROLE = 'system';

  // -- Open AI 配置 --
  //
  // OpenAI API Key
  API_KEY = [];
  // OpenAI的模型名称
  CHAT_MODEL = 'gpt-3.5-turbo';
  // OpenAI API Domain 可替换兼容openai api的其他服务商
  OPENAI_API_DOMAIN = 'https://api.openai.com';
  // OpenAI API BASE `https://api.openai.com/v1`
  OPENAI_API_BASE = null;

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

  // -- 特性开关 --
  //
  // 是否开启使用统计
  ENABLE_USAGE_STATISTICS = false;
  // 隐藏部分命令按钮
  HIDE_COMMAND_BUTTONS = ['/role'];
  // 显示快捷回复按钮
  SHOW_REPLY_BUTTON = false;
  // 而外引用消息开关
  EXTRA_MESSAGE_CONTEXT = false;
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

  // -- AZURE 配置 --
  //
  // Azure API Key
  AZURE_API_KEY = null;
  // Azure Completions API
  AZURE_COMPLETIONS_API = null;
  // Azure DallE API
  AZURE_DALLE_API = null;

  // Cloudflare Account ID
  CLOUDFLARE_ACCOUNT_ID = null;
  // Cloudflare Token
  CLOUDFLARE_TOKEN = null;
  // Text Generation Model
  WORKERS_CHAT_MODEL = '@cf/mistral/mistral-7b-instruct-v0.1 ';
  // Text-to-Image Model
  WORKERS_IMAGE_MODEL = '@cf/stabilityai/stable-diffusion-xl-base-1.0';

  // Google Gemini API Key
  GOOGLE_API_KEY = null;
  // Google Gemini API
  GOOGLE_COMPLETIONS_API = 'https://generativelanguage.googleapis.com/v1beta/models/';
  // Google Gemini Model
  GOOGLE_COMPLETIONS_MODEL = 'gemini-pro';

  // mistral api key
  MISTRAL_API_KEY = null;
  // mistral api base
  MISTRAL_COMPLETIONS_API = 'https://api.mistral.ai/v1/chat/completions';
  // mistral api model
  MISTRAL_CHAT_MODEL = 'mistral-tiny';
}


// Environment Variables: Separate configuration values from a Worker script with Environment Variables.
export const ENV = new Environment();
// KV Namespace Bindings: Bind an instance of a KV Namespace to access its data in a Worker
export let DATABASE = null;
// Service Bindings: Bind to another Worker to invoke it directly from your code.
export let API_GUARD = null;

export const CUSTOM_COMMAND = {};

export const CONST = {
  PASSWORD_KEY: 'chat_history_password',
  GROUP_TYPES: ['group', 'supergroup'],
  USER_AGENT: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.2 Safari/605.1.15',
};


/**
 * @param {object} env
 * @param {I18nGenerator} i18n
 */
export function initEnv(env, i18n) {
  DATABASE = env.DATABASE;
  API_GUARD = env.API_GUARD;

  const envValueTypes = {
    SYSTEM_INIT_MESSAGE: 'string',
    OPENAI_API_BASE: 'string',
    AZURE_API_KEY: 'string',
    AZURE_COMPLETIONS_API: 'string',
    AZURE_DALLE_API: 'string',
    CLOUDFLARE_ACCOUNT_ID: 'string',
    CLOUDFLARE_TOKEN: 'string',
    GOOGLE_API_KEY: 'string',
    MISTRAL_API_KEY: 'string',
  };


  const customCommandPrefix = 'CUSTOM_COMMAND_';
  for (const key of Object.keys(env)) {
    if (key.startsWith(customCommandPrefix)) {
      const cmd = key.substring(customCommandPrefix.length);
      CUSTOM_COMMAND['/' + cmd] = env[key];
      // console.log(`Custom command: /${cmd} => ${env[key]}`);
    }
  }

  for (const key of Object.keys(ENV)) {
    const t = envValueTypes[key] ? envValueTypes[key] : (ENV[key] !== null ? typeof ENV[key] : 'string');
    if (env[key]) {
      switch (t) {
        case 'number':
          ENV[key] = parseInt(env[key]) || ENV[key];
          break;
        case 'boolean':
          ENV[key] = (env[key] || 'false') === 'true';
          break;
        case 'string':
          ENV[key] = env[key];
          break;
        case 'array':
          ENV[key] = env[key].split(',');
          break;
        case 'object':
          if (Array.isArray(ENV[key])) {
            ENV[key] = env[key].split(',');
          } else {
            try {
              ENV[key] = JSON.parse(env[key]);
            } catch (e) {
              console.error(e);
            }
          }
          break;
        default:
          ENV[key] = env[key];
          break;
      }
    }
  }
  {
    ENV.I18N = i18n((ENV.LANGUAGE || 'cn').toLowerCase());

    // TELEGRAM_TOKEN 兼容旧版
    if (env.TELEGRAM_TOKEN && !ENV.TELEGRAM_AVAILABLE_TOKENS.includes(env.TELEGRAM_TOKEN)) {
      if (env.BOT_NAME && ENV.TELEGRAM_AVAILABLE_TOKENS.length === ENV.TELEGRAM_BOT_NAME.length) {
        ENV.TELEGRAM_BOT_NAME.push(env.BOT_NAME);
      }
      ENV.TELEGRAM_AVAILABLE_TOKENS.push(env.TELEGRAM_TOKEN);
    }
    // WORKERS_AI_MODEL 兼容旧版
    if (env.WORKERS_AI_MODEL) {
      ENV.WORKERS_CHAT_MODEL = env.WORKERS_AI_MODEL;
    }

    // OPENAI_API_BASE
    if (!ENV.OPENAI_API_BASE) {
      ENV.OPENAI_API_BASE=`${ENV.OPENAI_API_DOMAIN}/v1`;
    }

    // SYSTEM_INIT_MESSAGE
    if (!ENV.SYSTEM_INIT_MESSAGE) {
      ENV.SYSTEM_INIT_MESSAGE = ENV.I18N?.env?.system_init_message || 'You are a helpful assistant';
    }
  }
  // console.log(ENV);
}
