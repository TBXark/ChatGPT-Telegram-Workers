import {ENV, AI} from './env.js';
import {Ai} from './vendors/cloudflare-ai.js';
import {Stream} from './vendors/stream.js';


/**
 * @param {Context} context
 * @return {boolean}
 */
export function isWorkersAIEnable(context) {
  return AI && AI.fetch;
}


/**
 * 发送消息到Workers AI
 *
 * @param {string} message
 * @param {Array} history
 * @param {Context} context
 * @param {function} onStream
 * @return {Promise<string>}
 */
export async function requestCompletionsFromWorkersAI(message, history, context, onStream) {
  const ai = new Ai(AI);
  const model = ENV.WORKERS_AI_MODEL;
  const request = {
    messages: [...history || [], {role: 'user', content: message}],
    stream: onStream !== null,
  };
  const resp = await ai.run(model, request);
  const controller = new AbortController();

  if (onStream) {
    const stream = new Stream(new Response(resp), controller);
    let contentFull = '';
    let lengthDelta = 0;
    let updateStep = 20;
    try {
      for await (const chunk of stream) {
        const c = chunk.response || '';
        lengthDelta += c.length;
        contentFull = contentFull + c;
        if (lengthDelta > updateStep) {
          lengthDelta = 0;
          updateStep += 5;
          await onStream(`${contentFull}\n${ENV.I18N.message.loading}...`);
        }
      }
    } catch (e) {
      contentFull = `ERROR: ${e.message}`;
    }
    return contentFull;
  } else {
    return resp.response;
  }
}
