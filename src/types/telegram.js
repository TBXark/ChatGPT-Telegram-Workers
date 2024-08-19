/**
 * @typedef {(string|number)} TelegramID
 */

/**
 * @typedef {object} TelegramBaseFile
 * @property {string} file_id - Unique identifier for this file.
 * @property {string} file_unique_id - Unique identifier for this file, which is supposed to be the same over time and for different bots.
 * @property {number} file_size - Optional. File size, if known.
 * @typedef {TelegramBaseFile} TelegramPhoto
 * @property {number} width - Photo width.
 * @property {number} height - Photo height.
 * @typedef {TelegramBaseFile} TelegramVoice
 * @property {number} duration - Duration of the audio in seconds.
 * @property {string} mime_type - Optional. MIME type of the file as defined by sender.
 */

/**
 * @typedef {object} TelegramUser
 * @property {TelegramID} id - The ID of the user.
 * @property {boolean} is_bot - True, if the user is a bot.
 * @property {string} first_name - The first name of the user.
 * @property {string} [last_name] - The last name of the user.
 * @property {string} [username] - The username of the user.
 * @property {string} [language_code] - The language code of the user.
 */

/**
 * @typedef {object} TelegramChat
 * @property {TelegramID} id - The ID of the chat.
 * @property {string} type - The type of the chat.
 * @property {boolean} is_forum - True, if the chat is a forum.
 * @property {boolean} all_members_are_administrators - True, if all members of the chat are administrators.
 */

/**
 * @typedef {object} TelegramMessageEntity
 * @property {string} type - Type of the entity.
 * @property {number} offset - Offset in UTF-16 code units to the start of the entity.
 * @property {number} length - Length of the entity in UTF-16 code units.
 * @property {string} [url] - URL of the entity.
 * @property {TelegramUser} [user] - The user this entity refers to.
 */

/**
 * @typedef {object} TelegramMessage
 * @property {number} message_id - The message's unique identifier.
 * @property {TelegramUser} from - The user that sent the message.
 * @property {TelegramChat} chat - The chat where the message was sent.
 * @property {number} date - The date the message was sent.
 * @property {?string} [text] - The text of the message.
 * @property {?string} [caption] - The caption of the message.
 * @property {TelegramPhoto[]} [photo] - An array of photos.
 * @property {TelegramVoice} [voice] - The voice message.
 * @property {TelegramMessageEntity[]} [entities] - An array of message entities.
 * @property {TelegramMessageEntity[]} [caption_entities] - An array of caption entities.
 * @property {TelegramMessage} [reply_to_message] - The message that this message is a reply to.
 * @property {boolean} is_topic_message - True, if the message is a topic message.
 * @property {string|number} message_thread_id - The message thread ID.
 */

/**
 * @typedef {object} TelegramWebhookRequest
 * @property {TelegramID} update_id - The update's unique identifier.
 * @property {TelegramMessage} message - The message
 * @property {TelegramMessage} edited_message - The edited message
 */
