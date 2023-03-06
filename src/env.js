export const ENV = {
  // OpenAI API Key
  API_KEY: null,
  // Telegram Bot Token
  TELEGRAM_TOKEN: null,
  // Available Telegram Bot Tokens
  TELEGRAM_AVAILABLE_TOKENS: [],
  // Workers Domain
  WORKERS_DOMAIN: null,
  // Disable white list
  I_AM_A_GENEROUS_PERSON: false,
  // Chat White List
  CHAT_WHITE_LIST: [],
  // Telegram Bot Username
  BOT_NAME: null,
  // Group Chat Bot Share History
  GROUP_CHAT_BOT_MODE: false,
  // Debug Mode
  DEBUG_MODE: false,
  // Max History Length
  MAX_HISTORY_LENGTH: 20,
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
}
