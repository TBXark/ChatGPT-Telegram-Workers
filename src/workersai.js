/* eslint-disable no-unused-vars */
import {Context} from './context.js';
import {ENV} from './env.js';
import {isEventStreamResponse} from './utils.js';
import {anthropicSseJsonParser, Stream} from './vendors/stream.js';
import {requestChatCompletions} from "./request.js";

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

  const id = ENV.CLOUDFLARE_ACCOUNT_ID;
  const token = ENV.CLOUDFLARE_TOKEN;
  const model = ENV.WORKERS_CHAT_MODEL;
  const url = `https://api.cloudflare.com/client/v4/accounts/${id}/ai/run/${model}`;
  const header = {
    Authorization: `Bearer ${token}`
  };

  const body = {
    messages: [...history || [], {role: 'user', content: message}],
    stream: onStream !== null,
  };

  /**
   * @type {SseChatCompatibleOptions}
   */
  const options = {}
  options.contentExtractor = function (data) {
    return  data?.response;
  }
  options.fullContentExtractor = function (data) {
    return data?.result?.response;
  }
  options.errorExtractor = function (data) {
    return data?.errors?.[0]?.message;
  }
  return requestChatCompletions(url, header, body, context, onStream, null, options);
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
