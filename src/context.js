import {DATABASE} from './env.js';

// 用户配置
export const USER_CONFIG = {
  // 系统初始化消息
  SYSTEM_INIT_MESSAGE: '你是一个得力的助手',
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
  currentBotId: null, // 当前机器人ID
  currentBotToken: null, // 当前机器人Token
  currentBotName: null, // 当前机器人名称: xxx_bot
  chatHistoryKey: null, // history:chat_id:bot_id:(from_id)
  configStoreKey: null, // user_config:chat_id:bot_id:(from_id)
  groupAdminKey: null, // group_admin:group_id
  chatType:null,// 会话场景, private/group/supergroup等, 来源message.chat.type
  chatId:null, // 会话id, private场景为发言人id, group/supergroup场景为群组id
  speekerId:null, // 发言人id
};

// 初始化用户配置
export async function initUserConfig(id) {
  try {
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
  } catch (e) {
    console.error(e);
  }
}
