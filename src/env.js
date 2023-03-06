export const ENV = {
  // OpenAI API Key
  API_KEY: null,
  // Available Telegram Bot Tokens
  TELEGRAM_AVAILABLE_TOKENS: [],
  // Bot Name
  TELEGRAM_BOT_NAME: [],
  // Workers Domain
  WORKERS_DOMAIN: null,
  // Disable white list
  I_AM_A_GENEROUS_PERSON: false,
  // Chat White List
  CHAT_WHITE_LIST: [],
  // Group Chat Bot Enable
  GROUP_CHAT_BOT_ENABLE: true,
  // Group Chat Bot Share History
  GROUP_CHAT_BOT_SHARE_MODE: false,
  // Debug Mode
  DEBUG_MODE: false,
  // Max History Length
  MAX_HISTORY_LENGTH: 20,
  // Build Timestamp
  BUILD_TIMESTAMP: process.env.BUILD_TIMESTAMP || 0,
};

export let DATABASE = null;

export function initEnv(env) {
  DATABASE = env.DATABASE;
  for (const key in ENV) {
    if (env[key]) {
      switch (typeof ENV[key]) {
        case 'number':
          ENV[key] = parseInt(env[key]) || ENV[key];
          break;
        case 'boolean':
          ENV[key] = (env[key] || 'false') === 'true';
          break;
        case 'object':
          if (Array.isArray(ENV[key])) {
            ENV[key] = env[key].split(',');
          } else {
            ENV[key] = env[key];
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
    if (env.TELEGRAM_TOKEN && ENV.TELEGRAM_AVAILABLE_TOKENS.length === 0) {
      ENV.TELEGRAM_AVAILABLE_TOKENS.push(env.TELEGRAM_TOKEN);
    }
    if (env.BOT_NAME && ENV.TELEGRAM_BOT_NAME.length === 0) {
      ENV.TELEGRAM_BOT_NAME.push(env.BOT_NAME);
    }
  }
}
