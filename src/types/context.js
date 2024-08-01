
/**
 * 用于保存用户配置
 *
 * @typedef {Object} UserConfigType
 *
 * @property {string[]} DEFINE_KEYS
 *
 * @property {string} AI_PROVIDER
 * @property {string} AI_IMAGE_PROVIDER
 * @property {string} SYSTEM_INIT_MESSAGE
 * @property {string} SYSTEM_INIT_MESSAGE_ROLE
 *
 * @property {string[]} OPENAI_API_KEY
 * @property {string} OPENAI_CHAT_MODEL
 * @property {string} OPENAI_API_BASE
 * @property {object} OPENAI_API_EXTRA_PARAMS
 *
 * @property {string} DALL_E_MODEL
 * @property {string} DALL_E_IMAGE_SIZE
 * @property {string} DALL_E_IMAGE_QUALITY
 * @property {string} DALL_E_IMAGE_STYLE
 *
 * @property {?string} AZURE_API_KEY
 * @property {?string} AZURE_COMPLETIONS_API
 * @property {?string} AZURE_DALLE_API
 *
 * @property {?string} CLOUDFLARE_ACCOUNT_ID
 * @property {?string} CLOUDFLARE_TOKEN
 * @property {string} WORKERS_CHAT_MODEL
 * @property {string} WORKERS_IMAGE_MODEL
 *
 * @property {?string} GOOGLE_API_KEY
 * @property {string} GOOGLE_COMPLETIONS_API
 * @property {string} GOOGLE_COMPLETIONS_MODEL
 *
 * @property {?string} MISTRAL_API_KEY
 * @property {string} MISTRAL_API_BASE
 * @property {string} MISTRAL_CHAT_MODEL
 *
 * @property {?string} COHERE_API_KEY
 * @property {string} COHERE_API_BASE
 * @property {string} COHERE_CHAT_MODEL
 *
 * @property {?string} ANTHROPIC_API_KEY
 * @property {string} ANTHROPIC_API_BASE
 * @property {string} ANTHROPIC_CHAT_MODEL
 *
 */

/**
 * 用于保存全局使用的临时变量
 *
 * @typedef {object} ShareContextType
 * @property {?string} currentBotId - 当前机器人 ID
 * @property {?string} currentBotToken - 当前机器人 Token
 * @property {?string} currentBotName - 当前机器人名称: xxx_bot
 * @property {?string} chatHistoryKey - history:chat_id:bot_id:$from_id
 * @property {?string} chatLastMessageIdKey - last_message_id:$chatHistoryKey
 * @property {?string} configStoreKey - user_config:chat_id:bot_id:$from_id
 * @property {?string} groupAdminKey - group_admin:group_id
 * @property {?string} usageKey - usage:bot_id
 * @property {?string} chatType - 会话场景, private/group/supergroup 等, 来源 message.chat.type
 * @property {?TelegramID} chatId - 会话 id, private 场景为发言人 id, group/supergroup 场景为群组 id
 * @property {?TelegramID} speakerId - 发言人 id
 * @property {?object} extraMessageContext - 额外消息上下文
 * */

/**
 * 用于保存发起telegram请求的聊天上下文
 *
 * @typedef {object} CurrentChatContextType
 * @property {?TelegramID} chat_id
 * @property {?TelegramID} reply_to_message_id - 如果是群组，这个值为消息ID，否则为null
 * @property {?string} parse_mode
 * @property {?TelegramID} message_id - 编辑消息的ID
 * @property {?object} reply_markup -  回复键盘
 * @property {boolean} allow_sending_without_reply
 * @property {boolean} disable_web_page_preview
 */

/**
 * @typedef {object} ContextType
 *
 * @property {UserConfigType} USER_CONFIG - 用户配置
 * @property {CurrentChatContextType} CURRENT_CHAT_CONTEXT - 当前聊天上下文
 * @property {ShareContextType} SHARE_CONTEXT - 共享上下文
 * @property {function(TelegramMessage)} initContext
 */
