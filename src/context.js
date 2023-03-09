import {DATABASE, ENV} from './env.js';
import {retry} from './utils.js';

// 用户配置
export const USER_CONFIG = {
  // 系统初始化消息
  SYSTEM_INIT_MESSAGE: ENV.SYSTEM_INIT_MESSAGE,
  // OpenAI API 额外参数
  OPENAI_API_EXTRA_PARAMS: {},
};

// 当前聊天上下文
export const CURRENT_CHAT_CONTEXT = {
  chat_id: null,
  reply_to_message_id: null, // 如果是群组，这个值为消息ID，否则为null
  parse_mode: 'Markdown',
};

// 共享上下文
export const SHARE_CONTEXT = {
  currentBotId: null, // 当前机器人 ID
  currentBotToken: null, // 当前机器人 Token
  currentBotName: null, // 当前机器人名称: xxx_bot
  chatHistoryKey: null, // history:chat_id:bot_id:(from_id)
  configStoreKey: null, // user_config:chat_id:bot_id:(from_id)
  groupAdminKey: null, // group_admin:group_id
  usageKey: null, // usage:bot_id
  chatType: null, // 会话场景, private/group/supergroup 等, 来源 message.chat.type
  chatId: null, // 会话 id, private 场景为发言人 id, group/supergroup 场景为群组 id
  speekerId: null, // 发言人 id
};

// 初始化用户配置
export async function initUserConfig(id) {
  return retry(async function(){
    const userConfig = await DATABASE.get(SHARE_CONTEXT.configStoreKey).then(
        (res) => JSON.parse(res) || {},
    );
    for (const key in userConfig) {
      if (
        USER_CONFIG.hasOwnProperty(key) &&
        typeof USER_CONFIG[key] === typeof userConfig[key]
      ) {
        USER_CONFIG[key] = userConfig[key];
      }
    }
  },3,500)
}
