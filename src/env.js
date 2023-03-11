const ENV_VALUE_TYPE = {
  API_KEY: 'string',
};

export const ENV = {
  // OpenAI API Key
  API_KEY: null,
  // OpenAI的模型名稱
  CHAT_MODEL: 'gpt-3.5-turbo',
  // 允許訪問的Telegram Token， 設置時以逗號分隔
  TELEGRAM_AVAILABLE_TOKENS: [],
  // 允許訪問的Telegram Token 對應的Bot Name， 設置時以逗號分隔
  TELEGRAM_BOT_NAME: [],
  // 允許所有人使用
  I_AM_A_GENEROUS_PERSON: false,
  // 白名單
  CHAT_WHITE_LIST: [],
  // 群組白名單
  CHAT_GROUP_WHITE_LIST: [],
  // 群組機器人開關
  GROUP_CHAT_BOT_ENABLE: true,
  // 群組機器人共享模式,關閉後，一個群組只有一個會話和配置。開啟的話群組的每個人都有自己的會話上下文
  GROUP_CHAT_BOT_SHARE_MODE: false,
  // 為了避免4096字符限制，將消息刪減
  AUTO_TRIM_HISTORY: true,
  // 最大歷史記錄長度
  MAX_HISTORY_LENGTH: 20,
  // 調試模式
  DEBUG_MODE: false,
  // 開發模式
  DEV_MODE: false,
  // 當前版本
  BUILD_TIMESTAMP: process.env.BUILD_TIMESTAMP || 0,
  // 當前版本 commit id
  BUILD_VERSION: process.env.BUILD_VERSION || '',
  // 全局默認初始化消息
  SYSTEM_INIT_MESSAGE: '你是一個得力的助手',
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
    // 兼容性代碼 兼容舊版本
    if (env.TELEGRAM_TOKEN && !ENV.TELEGRAM_AVAILABLE_TOKENS.includes(env.TELEGRAM_TOKEN)) {
      if (env.BOT_NAME && ENV.TELEGRAM_AVAILABLE_TOKENS.length === ENV.TELEGRAM_BOT_NAME.length) {
        ENV.TELEGRAM_BOT_NAME.push(env.BOT_NAME);
      }
      ENV.TELEGRAM_AVAILABLE_TOKENS.push(env.TELEGRAM_TOKEN);
    }
  }
}
