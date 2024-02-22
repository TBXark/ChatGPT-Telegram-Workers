import logger from './logger.js'

const ENV_VALUE_TYPE = {
  API_KEY: 'string',
  AMOUNT_OF_FREE_MESSAGES: 'number',
  ACTIVATION_CODE: 'string',
  LINK_TO_PAY_FOR_CODE: 'string',
}

const OPENAI_MODELS = {
  gpt3Turbo: 'gpt-3.5-turbo',
  gpt4: 'gpt-4',
  gpt4Turbo: 'gpt-4-turbo-preview',
}

export const ENV = {
  // OpenAI API Key
  API_KEY: null,
  // OpenAI model name
  CHAT_MODEL: `gpt-4-turbo-preview`,

  // Allowed access Telegram Token， Separated by commas when setting up
  TELEGRAM_AVAILABLE_TOKENS: [],
  // Allowed access Telegram Tokencorresponding Bot Name， Separated by commas when setting up
  TELEGRAM_BOT_NAME: [],

  // Allow everyone to use
  I_AM_A_GENEROUS_PERSON: false,
  // Whitelist
  CHAT_WHITE_LIST: [],
  // Group whitelist
  CHAT_GROUP_WHITE_LIST: [],

  // Group robot switch
  GROUP_CHAT_BOT_ENABLE: true,
  // Group robot sharing mode, after it is turned off,
  // there is only one session and configuration for a group.
  // If you open it, everyone in the group has their own conversation context
  GROUP_CHAT_BOT_SHARE_MODE: false,

  // In order to avoid the 4096 character limit, delete the message
  AUTO_TRIM_HISTORY: true,
  // Maximum history length
  MAX_HISTORY_LENGTH: 20,
  // Maximum message length
  MAX_TOKEN_LENGTH: 2048,
  // use GPT3 of TOKEN count
  GPT3_TOKENS_COUNT: true,

  // Global default initialization message
  SYSTEM_INIT_MESSAGE: `спроси у пользователя что у него за продукт (или ссылку на сайт) и кому они это продают. когда получишь нужные данные сформируй  сообщение. {apiCall:"https://stunning-space-barnacle-jqw75jj7vfpgj-3010.app.github.dev/callPipeline", {product:"его продукт",audience:"аудитория",chatId:"29165285"}} (целиком в месте с url endpointa) . твоя версия v1.2.2`,
  // Global default initialization message role
  SYSTEM_INIT_MESSAGE_ROLE: 'system',
  // Whether to turn on usage statistics
  ENABLE_USAGE_STATISTICS: false,
  // Hide part of the command button
  HIDE_COMMAND_BUTTONS: [],

  // Check for updated branches
  UPDATE_BRANCH: 'master',
  // Current version
  BUILD_TIMESTAMP: process.env.BUILD_TIMESTAMP || 0,
  // Current version commit id
  BUILD_VERSION: process.env.BUILD_VERSION || '',

  // Payment related
  AMOUNT_OF_FREE_MESSAGES: Infinity,
  ACTIVATION_CODE: null,
  LINK_TO_PAY_FOR_CODE: null,

  // DEBUG related
  DEBUG_MODE: false,
  DEV_MODE: false,
  // Dedicated for local debugging
  TELEGRAM_API_DOMAIN: 'https://api.telegram.org',
  OPENAI_API_DOMAIN: 'https://api.openai.com',
}

export const CONST = {
  PASSWORD_KEY: 'chat_history_password',
  GROUP_TYPES: ['group', 'supergroup'],
  USER_AGENT:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.2 Safari/605.1.15',
}

export let DATABASE = null

export function initEnv(env) {
  DATABASE = env.DATABASE
  for (const key in ENV) {
    if (env[key]) {
      switch (ENV_VALUE_TYPE[key] || typeof ENV[key]) {
        case 'number':
          ENV[key] = parseInt(env[key]) || ENV[key]
          break
        case 'boolean':
          ENV[key] = (env[key] || 'false') === 'true'
          break
        case 'string':
          ENV[key] = env[key]
          break
        case 'object':
          if (Array.isArray(ENV[key])) {
            ENV[key] = env[key].split(',')
          } else {
            try {
              ENV[key] = JSON.parse(env[key])
            } catch (e) {
              logger('error', e)
            }
          }
          break
        default:
          ENV[key] = env[key]
          break
      }
    }
  }
  {
    if (env.TELEGRAM_TOKEN && !ENV.TELEGRAM_AVAILABLE_TOKENS.includes(env.TELEGRAM_TOKEN)) {
      if (env.BOT_NAME && ENV.TELEGRAM_AVAILABLE_TOKENS.length === ENV.TELEGRAM_BOT_NAME.length) {
        ENV.TELEGRAM_BOT_NAME.push(env.BOT_NAME)
      }
      ENV.TELEGRAM_AVAILABLE_TOKENS.push(env.TELEGRAM_TOKEN)
    }
  }
}
