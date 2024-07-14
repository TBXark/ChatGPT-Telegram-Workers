import { Stream } from './vendors/cohereStream.js';
import {isEventStreamResponse, isJsonResponse} from './utils.js';
import { ENV } from "./env.js";

/**
 * @param {Context} context
 * @return {boolean}
 */
export function isCohereAIEnable(context) {
  return !!(context.USER_CONFIG.COHERE_API_KEY && context.USER_CONFIG.COHERE_API_BASE && context.USER_CONFIG.COHERE_CHAT_MODEL);
}

export async function requestCompletionsFromCohereAI(message, history, context, onStream) {
  const url = `${context.USER_CONFIG.COHERE_API_BASE}/chat`;
  const header = {
    'Authorization': `Bearer ${context.USER_CONFIG.COHERE_API_KEY}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  const contentsTemp = [];
  let preamble = '';
  for (const msg of history) {
    switch (msg.role) {
      case 'system':
        preamble = msg.content;
        // contentsTemp.push([{ role: 'SYSTEM', message: msg.content }]);
        break;
      case 'assistant':
        contentsTemp.push({ role: 'CHATBOT', message: msg.content });
        break;
      case 'user':
        contentsTemp.push({ role: 'USER', message: msg.content });
        break;
      default:
        continue;
    }
  }
  let connectors = [];
  Object.entries(context.USER_CONFIG.COHERE_CONNECT_TRIGGER).forEach(([id, triggers]) => {
    const result = triggers.some((trigger) => {
      const triggerRegex = new RegExp(trigger, 'i');
      return triggerRegex.test(message);
    });
    if (result) connectors.push({ id });
  });

  const body = {
    message,
    model: context.USER_CONFIG.COHERE_CHAT_MODEL,
    stream: onStream != null,
    preamble,
    chat_history: contentsTemp,
    ...(connectors.length && { connectors }),
    ...context.USER_CONFIG.COHERE_API_EXTRA_PARAMS,
  };
  const controller = new AbortController();
  const signal = controller.signal;
  const timeout = 1000 * 60 * 5;
  setTimeout(() => controller.abort(), timeout);
  const resp = await fetch(url, {
      method: 'POST',
      headers: header,
      body: JSON.stringify(body),
      signal,
  });

  const immediatePromise = Promise.resolve('immediate');

  if (onStream && resp.ok && isEventStreamResponse(resp)) {
    const stream = new Stream(resp, controller);
    let contentFull = '';
    let lengthDelta = 0;
    let updateStep = 20;
    let msgPromise = null;
    let lastChunk = null;
    try {
      for await (const data of stream) {
        if (data.event_type === 'stream-end') {
          // contentFull = data?.response?.text || contentFull;
          // if (data.finish_reason !== 'COMPLETE') contentFull += '\n' + data?.finish_reason;
          continue;
        }
        const c = data?.text || '';
        lengthDelta += c.length;
        if (lastChunk) contentFull = contentFull + lastChunk;
        if (lastChunk && lengthDelta > updateStep) {
          lengthDelta = 0;
          updateStep += 10;
          if (!msgPromise || (await Promise.race([msgPromise, immediatePromise])) !== 'immediate') {
            msgPromise = onStream(`${contentFull}●`);
          }
        }
        lastChunk = c;
      }
    } catch (e) {
      contentFull += `\nERROR: ${e.message}`;
      console.log(`errorEnd`);
    }
    contentFull += lastChunk;
    await msgPromise;
    return contentFull;
  }
  if (!isJsonResponse(resp)) {
    throw new Error(resp.statusText);
  }

  const result = await resp.json();

  if (!result) {
    throw new Error('Empty response');
  }

  if (result?.message) {
    throw new Error(result.message);
  }
  try {
    return result.text;
  } catch (e) {
    throw Error(result?.message || JSON.stringify(result));
  }
}