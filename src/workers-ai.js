import {ENV, AI} from './env.js';
import {Ai} from './vendors/cloudflare-ai.js';


/**
 * @param {Context} context
 * @return {boolean}
 */
export function isWorkersAIEnable(context) {
    return AI && AI.fetch
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
  };
  const response = await ai.run(model, request);
  return response.response;
}
