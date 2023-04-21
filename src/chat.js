import {sendChatActionToTelegramWithContext, sendMessageToTelegramWithContext} from './telegram.js';
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
    console.log('Ask:' + text || '');
    try {
      const msg = await sendMessageToTelegramWithContext(context)(ENV.I18N.message.loading, false).then((r) => r.json());
      context.CURRENT_CHAT_CONTEXT.editMessageId = msg.result.message_id;
    } catch (e) {
      console.error(e);
    }
    setTimeout(() => sendChatActionToTelegramWithContext(context)('typing').catch(console.error), 0);
    let onStream = null;
    const parseMode = context.CURRENT_CHAT_CONTEXT.parse_mode;
    if (ENV.STREAM_MODE) {
      context.CURRENT_CHAT_CONTEXT.parse_mode = null;
      onStream = async (text) => {
        await sendMessageToTelegramWithContext(context, true)(text);
      };
    }
    const answer = await requestCompletionsFromChatGPT(text, context, modifier, onStream);
    context.CURRENT_CHAT_CONTEXT.parse_mode = parseMode;
    return sendMessageToTelegramWithContext(context, true)(answer);
  } catch (e) {
    return sendMessageToTelegramWithContext(context)(`Error: ${e.message}`);
  }
}
