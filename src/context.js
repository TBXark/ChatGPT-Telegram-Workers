import {DATABASE} from './env.js';

// 用户配置
export const USER_CONFIG = {
  // 系统初始化消息
  SYSTEM_INIT_MESSAGE: '你是一个得力的助手',
  // OpenAI API 额外参数
  OPENAI_API_EXTRA_PARAMS: {},
};

// 当前聊天上下文
export const CURRENR_CHAT_CONTEXT = {
  chat_id: null,
  reply_to_message_id: null,
  parse_mode: 'Markdown',
};

// 共享上下文
export const SHARE_CONTEXT = {
  currentBotId: null,
  chatHistoryKey: null, // history:user_id:bot_id:group_id
  configStoreKey: null, // user_config:user_id:bot_id
  groupAdminKey: null, // group_admin:group_id
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
