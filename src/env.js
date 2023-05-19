/**
 * @typedef {Object} Environment
 * @property {null | string} API_KEY
 * @property {string[]} TELEGRAM_AVAILABLE_TOKENS
 * @property {boolean} I_AM_A_GENEROUS_PERSON
 * @property {string[]} CHAT_WHITE_LIST
 * @property {string[]} TELEGRAM_BOT_NAME
 * @property {string[]} CHAT_GROUP_WHITE_LIST
 * @property {boolean} GROUP_CHAT_BOT_ENABLE
 * @property {boolean} GROUP_CHAT_BOT_SHARE_MODE
 * @property {string} CHAT_MODEL
 * @property {boolean} AUTO_TRIM_HISTORY
 * @property {number} MAX_HISTORY_LENGTH
 * @property {number} MAX_TOKEN_LENGTH
 * @property {boolean} GPT3_TOKENS_COUNT
 * @property {string} SYSTEM_INIT_MESSAGE
 * @property {string} SYSTEM_INIT_MESSAGE_ROLE
 * @property {boolean} ENABLE_USAGE_STATISTICS
 * @property {string[]} HIDE_COMMAND_BUTTONS
 * @property {boolean} SHOW_REPLY_BUTTON
 * @property {string} UPDATE_BRANCH
 * @property {number} BUILD_TIMESTAMP
 * @property {string} BUILD_VERSION
 * @property {null | I18n} I18N
 * @property {string} LANGUAGE
 * @property {boolean} STREAM_MODE
 * @property {boolean} SAFE_MODE
 * @property {boolean} DEBUG_MODE
 * @property {boolean} DEV_MODE
 * @property {string} TELEGRAM_API_DOMAIN
 * @property {string} OPENAI_API_DOMAIN
 */
/**
 * @type {Environment}
 */
export const ENV = {

  // OpenAI API Key
  API_KEY: null,
  // 允许访问的Telegram Token， 设置时以逗号分隔
  TELEGRAM_AVAILABLE_TOKENS: [],

  // 允许所有人使用
  I_AM_A_GENEROUS_PERSON: false,
  // 白名单
  CHAT_WHITE_LIST: [],

  // 允许访问的Telegram Token 对应的Bot Name， 设置时以逗号分隔
  TELEGRAM_BOT_NAME: [],
  // 群组白名单
  CHAT_GROUP_WHITE_LIST: [],
  // 群组机器人开关
  GROUP_CHAT_BOT_ENABLE: true,
  // 群组机器人共享模式,关闭后，一个群组只有一个会话和配置。开启的话群组的每个人都有自己的会话上下文
  GROUP_CHAT_BOT_SHARE_MODE: false,

  // OpenAI的模型名称
  CHAT_MODEL: 'gpt-3.5-turbo',
  // 为了避免4096字符限制，将消息删减
  AUTO_TRIM_HISTORY: true,
  // 最大历史记录长度
  MAX_HISTORY_LENGTH: 20,
  // 最大消息长度
  MAX_TOKEN_LENGTH: 2048,
  // 使用GPT3的TOKEN计数
  GPT3_TOKENS_COUNT: false,
  // 全局默认初始化消息
  SYSTEM_INIT_MESSAGE: 'You are a helpful assistant',
  // 全局默认初始化消息角色
  SYSTEM_INIT_MESSAGE_ROLE: 'system',

  // 是否开启使用统计
  ENABLE_USAGE_STATISTICS: false,
  // 隐藏部分命令按钮
  HIDE_COMMAND_BUTTONS: ['/role'],
  // 显示快捷回复按钮
  SHOW_REPLY_BUTTON: false,


  // 检查更新的分支
  UPDATE_BRANCH: 'master',
  // 当前版本
  BUILD_TIMESTAMP: process.env.BUILD_TIMESTAMP || 0,
  // 当前版本 commit id
  BUILD_VERSION: process.env.BUILD_VERSION || '',

  I18N: null,
  LANGUAGE: 'zh-cn',

  // 使用流模式
  STREAM_MODE: true,
  // 安全模式
  SAFE_MODE: true,
  // 调试模式
  DEBUG_MODE: false,
  // 开发模式
  DEV_MODE: false,

  TELEGRAM_API_DOMAIN: 'https://api.telegram.org',
  OPENAI_API_DOMAIN: 'https://api.openai.com',

};

export const CONST = {
  PASSWORD_KEY: 'chat_history_password',
  GROUP_TYPES: ['group', 'supergroup'],
  USER_AGENT: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.2 Safari/605.1.15',
};

export let DATABASE = null;
export let API_GUARD = null;

const ENV_VALUE_TYPE = {
  API_KEY: [],
};

/**
 * @callback I18nGenerator
 * @param {string} language
 * @return {I18n}
 */

/**
 * @param {object} env
 * @param {I18nGenerator} i18n
 */
export function initEnv(env, i18n) {
  DATABASE = env.DATABASE;
  API_GUARD = env.API_GUARD;
  for (const key in ENV) {
    if (env[key]) {
      switch (ENV_VALUE_TYPE[key]?typeof ENV_VALUE_TYPE[key]:(typeof ENV[key])) {
        case 'number':
          ENV[key] = parseInt(env[key]) || ENV[key];
          break;
        case 'boolean':
          ENV[key] = (env[key] || 'false') === 'true';
          break;
        case 'string':
          ENV[key] = env[key];
          break;
        case 'object':
          if (Array.isArray(ENV[key])) {
            ENV[key] = env[key].split(',');
          } else if (ENV_VALUE_TYPE[key] && Array.isArray(ENV_VALUE_TYPE[key])) {
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
    // 兼容性代码 兼容旧版本
    if (env.TELEGRAM_TOKEN && !ENV.TELEGRAM_AVAILABLE_TOKENS.includes(env.TELEGRAM_TOKEN)) {
      if (env.BOT_NAME && ENV.TELEGRAM_AVAILABLE_TOKENS.length === ENV.TELEGRAM_BOT_NAME.length) {
        ENV.TELEGRAM_BOT_NAME.push(env.BOT_NAME);
      }
      ENV.TELEGRAM_AVAILABLE_TOKENS.push(env.TELEGRAM_TOKEN);
    }
  }
  ENV.I18N = i18n((ENV.LANGUAGE || 'cn').toLowerCase());
  ENV.SYSTEM_INIT_MESSAGE = ENV.I18N.env.system_init_message;
  console.log(ENV);
}
