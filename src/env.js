import './i18n/type.js';

/**
 * @class Environment
 */
class Environment {
  // OpenAI API Key
  API_KEY = [];
  // 允许访问的Telegram Token， 设置时以逗号分隔
  TELEGRAM_AVAILABLE_TOKENS = [];

  // 允许所有人使用
  I_AM_A_GENEROUS_PERSON = false;
  // 白名单
  CHAT_WHITE_LIST = [];

  // 允许访问的Telegram Token 对应的Bot Name， 设置时以逗号分隔
  TELEGRAM_BOT_NAME = [];
  // 群组白名单
  CHAT_GROUP_WHITE_LIST = [];
  // 群组机器人开关
  GROUP_CHAT_BOT_ENABLE = true;
  // 群组机器人共享模式,关闭后，一个群组只有一个会话和配置。开启的话群组的每个人都有自己的会话上下文
  GROUP_CHAT_BOT_SHARE_MODE = false;

  // OpenAI的模型名称
  CHAT_MODEL = '雪碧';
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
  // 全局默认初始化消息
  SYSTEM_INIT_MESSAGE = null;
  // 全局默认初始化消息角色
  SYSTEM_INIT_MESSAGE_ROLE = 'system';

  // 是否开启使用统计
  ENABLE_USAGE_STATISTICS = false;
  // 隐藏部分命令按钮
  HIDE_COMMAND_BUTTONS = ['/role'];
  // 显示快捷回复按钮
  SHOW_REPLY_BUTTON = false;


  // 检查更新的分支
  UPDATE_BRANCH = 'master';
  // 当前版本
  BUILD_TIMESTAMP = process?.env?.BUILD_TIMESTAMP || 0;
  // 当前版本 commit id
  BUILD_VERSION = process?.env?.BUILD_VERSION || '';

  /**
   * @type {I18n | null}
   */
  I18N = null;
  LANGUAGE = 'zh-cn';

  // 使用流模式
  STREAM_MODE = true;
  // 安全模式
  SAFE_MODE = true;
  // 调试模式
  DEBUG_MODE = false;
  // 开发模式
  DEV_MODE = false;

  // Telegram API Domain
  TELEGRAM_API_DOMAIN = 'https://api.telegram.org';
  // OpenAI API Domain 可替换兼容openai api的其他服务商
  OPENAI_API_DOMAIN = 'https://openkey.cloud';
  // OpenAI API BASE `https://api.openai.com/v1`
  OPENAI_API_BASE = null;

  // Azure API Key
  AZURE_API_KEY = null;
  // Azure Completions API
  AZURE_COMPLETIONS_API = null;

  // workers ai模型
  WORKERS_AI_MODEL = '@cf/meta/llama-2-7b-chat-int8';
}


// Environment Variables: Separate configuration values from a Worker script with Environment Variables.
export const ENV = new Environment();
// KV Namespace Bindings: Bind an instance of a KV Namespace to access its data in a Worker
export let DATABASE = null;
// Service Bindings: Bind to another Worker to invoke it directly from your code.
export let API_GUARD = null;
// AI Bindings: Bind the Workers AI catalogue of generative AI models to this Worker.
export let AI = null;

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
  AI = env.AI;

  const envValueTypes = {
    SYSTEM_INIT_MESSAGE: 'string',
    OPENAI_API_BASE: 'string',
    AZURE_API_KEY: 'string',
    AZURE_COMPLETIONS_API: 'string',
  };

  for (const key of Object.keys(ENV)) {
    const t = envValueTypes[key]?envValueTypes[key]:(typeof ENV[key]);
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

    // OPENAI_API_BASE
    if (!ENV.OPENAI_API_BASE) {
      ENV.OPENAI_API_BASE=`${ENV.OPENAI_API_DOMAIN}/v1`;
    }

    // SYSTEM_INIT_MESSAGE
    if (!ENV.SYSTEM_INIT_MESSAGE) {
      ENV.SYSTEM_INIT_MESSAGE = ENV.I18N?.env?.system_init_message || 'You are a helpful assistant';
    }
  }
  console.log(ENV);
}
