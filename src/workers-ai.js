import {ENV} from './env.js';
import {Stream} from './vendors/stream.js';

/**
 * Run the specified AI model with the provided body data.
 *
 * @param {string} model - The AI model to run.
 * @param {Object} body - The data to provide to the AI model.
 * @return {Promise<Response>} The response from the AI model.
 */
async function run(model, body) {
  const id = ENV.CLOUDFLARE_ACCOUNT_ID;
  const token = ENV.CLOUDFLARE_TOKEN;
  return await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${id}/ai/run/${model}`,
      {
        headers: {Authorization: `Bearer ${token}`},
        method: 'POST',
        body: JSON.stringify(body),
      },
  );
}

/**
 * @param {Context} context
 * @return {boolean}
 */
export function isWorkersAIEnable(context) {
  return !!(ENV.CLOUDFLARE_ACCOUNT_ID && ENV.CLOUDFLARE_TOKEN);
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
  const model = ENV.WORKERS_CHAT_MODEL;
  const request = {
    messages: [...history || [], {role: 'user', content: message}],
    stream: onStream !== null,
  };
  const resp = await run(model, request);
  const controller = new AbortController();

  if (onStream) {
    const stream = new Stream(resp, controller);
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
    const data = await resp.json();
    return data.result.response;
  }
}

/**
 * @param {string} prompt
 * @param {Context} context
 * @return {Promise<Blob>}
 */
export async function requestImageFromWorkersAI(prompt, context) {
  const raw = await run(ENV.WORKERS_IMAGE_MODEL, {prompt});
  return await raw.blob();
}
