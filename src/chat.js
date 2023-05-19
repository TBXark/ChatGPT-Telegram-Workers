import {sendChatActionToTelegramWithContext, sendMessageToTelegramWithContext, deleteMessageFromTelegramWithContext} from './telegram.js';
import {ENV} from './env.js';
import {requestCompletionsFromChatGPT} from './openai.js';
// eslint-disable-next-line no-unused-vars
import {Context} from './context.js';

/**
 * 与OpenAI聊天
 *
 * @param {string} text
 * @param {Context} context
 * @param {function} modifier
 * @return {Promise<Response>}
 */
export async function chatWithOpenAI(text, context, modifier) {
  try {
    try {
      const msg = await sendMessageToTelegramWithContext(context)(ENV.I18N.message.loading).then((r) => r.json());
      context.CURRENT_CHAT_CONTEXT.message_id = msg.result.message_id;
      context.CURRENT_CHAT_CONTEXT.reply_markup = null;
    } catch (e) {
      console.error(e);
    }
    setTimeout(() => sendChatActionToTelegramWithContext(context)('typing').catch(console.error), 0);
    let onStream = null;
    const parseMode = context.CURRENT_CHAT_CONTEXT.parse_mode;
    if (ENV.STREAM_MODE) {
      context.CURRENT_CHAT_CONTEXT.parse_mode = null;
      onStream = async (text) => {
        try {
          const resp = await sendMessageToTelegramWithContext(context)(text);
          if (!context.CURRENT_CHAT_CONTEXT.message_id && resp.ok) {
            context.CURRENT_CHAT_CONTEXT.message_id = (await resp.json()).result.message_id;
          }
        } catch (e) {
          console.error(e);
        }
      };
    }

    const answer = await requestCompletionsFromChatGPT(text, context, modifier, onStream);
    context.CURRENT_CHAT_CONTEXT.parse_mode = parseMode;
    if (ENV.SHOW_REPLY_BUTTON && context.CURRENT_CHAT_CONTEXT.message_id) {
      try {
        await deleteMessageFromTelegramWithContext(context)(context.CURRENT_CHAT_CONTEXT.message_id);
        context.CURRENT_CHAT_CONTEXT.message_id = null;
        context.CURRENT_CHAT_CONTEXT.reply_markup={
          keyboard: [[{text: '/new'}, {text: '/redo'}]],
          selective: true,
          resize_keyboard: true,
          one_time_keyboard: true,
        };
      } catch (e) {
        console.error(e);
      }
    }
    return sendMessageToTelegramWithContext(context)(answer);
  } catch (e) {
    return sendMessageToTelegramWithContext(context)(`Error: ${e.message}`);
  }
}
