/**
 * @typedef {Object} TelegramUser
 * @property {number} id - The ID of the user.
 * @property {boolean} is_bot - True, if the user is a bot.
 * @property {string} first_name - The first name of the user.
 * @property {string} [last_name] - The last name of the user.
 * @property {string} [username] - The username of the user.
 * @property {string} [language_code] - The language code of the user.
 */

/**
 * @typedef {Object} TelegramChat
 * @property {number} id - The ID of the chat.
 * @property {string} type - The type of the chat.
 * @property {boolean} is_forum - True, if the chat is a forum.
 */

/**
 * @typedef {Object} TelegramMessageEntity
 * @property {string} type - Type of the entity.
 * @property {number} offset - Offset in UTF-16 code units to the start of the entity.
 * @property {number} length - Length of the entity in UTF-16 code units.
 * @property {string} [url] - URL of the entity.
 * @property {TelegramUser} [user] - The user this entity refers to.
 */

/**
 * @typedef {Object} TelegramMessage
 * @property {number} message_id - The message's unique identifier.
 * @property {TelegramUser} from - The user that sent the message.
 * @property {TelegramChat} chat - The chat where the message was sent.
 * @property {number} date - The date the message was sent.
 * @property {string} text - The text of the message.
 * @property {TelegramMessageEntity[]} [entities] - An array of message entities.
 * @property {TelegramMessage} [reply_to_message] - The message that this message is a reply to.
 * @property {boolean} is_topic_message - True, if the message is a topic message.
 * @property {string|number} message_thread_id - The message thread ID.
 */

/**
 * @typedef {Object} TelegramWebhookRequest
 * @property {number} update_id - The update's unique identifier.
 * @property {TelegramMessage} message - The message
 * @property {TelegramMessage} edited_message - The edited message
 */
