import {DATABASE, ENV} from './env.js';

// 用戶配置
export const USER_CONFIG = {
  // 系統初始化消息
  SYSTEM_INIT_MESSAGE: ENV.SYSTEM_INIT_MESSAGE,
  // OpenAI API 額外參數
  OPENAI_API_EXTRA_PARAMS: {},
};

// 當前聊天上下文
export const CURRENT_CHAT_CONTEXT = {
  chat_id: null,
  reply_to_message_id: null, // 如果是群組，這個值為消息ID，否則為null
  parse_mode: 'Markdown',
};

// 共享上下文
export const SHARE_CONTEXT = {
  currentBotId: null, // 當前機器人 ID
  currentBotToken: null, // 當前機器人 Token
  currentBotName: null, // 當前機器人名稱: xxx_bot
  chatHistoryKey: null, // history:chat_id:bot_id:(from_id)
  configStoreKey: null, // user_config:chat_id:bot_id:(from_id)
  groupAdminKey: null, // group_admin:group_id
  usageKey: null, // usage:bot_id
  chatType: null, // 會話場景, private/group/supergroup 等, 來源 message.chat.type
  chatId: null, // 會話 id, private 場景為發言人 id, group/supergroup 場景為群組 id
  speekerId: null, // 發言人 id
};

// 初始化用戶配置
export async function initUserConfig(storeKey) {
  try {
    const userConfig = JSON.parse(await DATABASE.get(storeKey));
    for (const key in userConfig) {
      if (
        USER_CONFIG.hasOwnProperty(key) &&
      typeof USER_CONFIG[key] === typeof userConfig[key]
      ) {
        USER_CONFIG[key] = userConfig[key];
      }
    }
  } catch (e) {
    console.error(e);
  }
}
