const ENV_VALUE_TYPE = {
  API_KEY: 'string',
};

export const ENV = {
  // OpenAI API Key
  API_KEY: null,
  // OpenAI的模型名称
  CHAT_MODEL: 'gpt-3.5-turbo',

  // 允许访问的Telegram Token， 设置时以逗号分隔
  TELEGRAM_AVAILABLE_TOKENS: [],
  // 允许访问的Telegram Token 对应的Bot Name， 设置时以逗号分隔
  TELEGRAM_BOT_NAME: [],

  // 允许所有人使用
  I_AM_A_GENEROUS_PERSON: false,
  // 白名单
  CHAT_WHITE_LIST: [],
  // 群组白名单
  CHAT_GROUP_WHITE_LIST: [],

  // 群组机器人开关
  GROUP_CHAT_BOT_ENABLE: true,
  // 群组机器人共享模式,关闭后，一个群组只有一个会话和配置。开启的话群组的每个人都有自己的会话上下文
  GROUP_CHAT_BOT_SHARE_MODE: false,

  // 为了避免4096字符限制，将消息删减
  AUTO_TRIM_HISTORY: true,
  // 最大历史记录长度
  MAX_HISTORY_LENGTH: 20,

  // 全局默认初始化消息
  SYSTEM_INIT_MESSAGE: '你是一个得力的助手',
  // 全局默认初始化消息角色
  SYSTEM_INIT_MESSAGE_ROLE: 'system',
  // 是否开启使用统计
  ENABLE_USAGE_STATISTICS: false,
  // 隐藏部分命令按钮
  HIDE_COMMAND_BUTTONS: [],

  // 检查更新的分支
  UPDATE_BRANCH: 'master',
  // 当前版本
  BUILD_TIMESTAMP: process.env.BUILD_TIMESTAMP || 0,
  // 当前版本 commit id
  BUILD_VERSION: process.env.BUILD_VERSION || '',

  // DEBUG 专用
  // 调试模式
  DEBUG_MODE: false,
  // 开发模式
  DEV_MODE: false,
  // Inline keyboard: 实验性功能请勿开启
  INLINE_KEYBOARD_ENABLE: [],
  TELEGRAM_API_DOMAIN: 'https://api.telegram.org',
  OPENAI_API_DOMAIN: 'https://api.openai.com',
};

export const CONST = {
  PASSWORD_KEY: 'chat_history_password',
  GROUP_TYPES: ['group', 'supergroup'],
};

export let DATABASE = null;

export function initEnv(env) {
  DATABASE = env.DATABASE;
  for (const key in ENV) {
    if (env[key]) {
      switch (ENV_VALUE_TYPE[key] || (typeof ENV[key])) {
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
}
