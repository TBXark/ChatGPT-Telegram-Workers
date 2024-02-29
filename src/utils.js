import {CONST, DATABASE, ENV} from './env.js';
import {gpt3TokensCounter} from './vendors/gpt3.js';

/**
 * @param {number} length
 * @return {string}
 */
export function randomString(length) {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

/**
 * @return {Promise<string>}
 */
export async function historyPassword() {
  let password = await DATABASE.get(CONST.PASSWORD_KEY);
  if (password === null) {
    password = randomString(32);
    await DATABASE.put(CONST.PASSWORD_KEY, password);
  }
  return password;
}


/**
 * @param {string} body
 * @return {string}
 */
export function renderHTML(body) {
  return `
<html>  
  <head>
    <title>ChatGPT-Telegram-Workers</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="ChatGPT-Telegram-Workers">
    <meta name="author" content="TBXark">
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        font-size: 1rem;
        font-weight: 400;
        line-height: 1.5;
        color: #212529;
        text-align: left;
        background-color: #fff;
      }
      h1 {
        margin-top: 0;
        margin-bottom: 0.5rem;
      }
      p {
        margin-top: 0;
        margin-bottom: 1rem;
      }
      a {
        color: #007bff;
        text-decoration: none;
        background-color: transparent;
      }
      a:hover {
        color: #0056b3;
        text-decoration: underline;
      }
      strong {
        font-weight: bolder;
      }
    </style>
  </head>
  <body>
    ${body}
  </body>
</html>
  `;
}

/**
 *
 * @param {Error} e
 * @return {string}
 */
export function errorToString(e) {
  return JSON.stringify({
    message: e.message,
    stack: e.stack,
  });
}


/**
 * @param {object} config
 * @param {string} key
 * @param {string} value
 */
export function mergeConfig(config, key, value) {
  const type = typeof config[key];
  switch (type) {
    case 'number':
      config[key] = parseInt(value, 10);
      break;
    case 'boolean':
      config[key] = value === 'true';
      break;
    case 'string':
      config[key] = value;
      break;
    case 'object':
      const object = JSON.parse(value);
      if (typeof object === 'object') {
        config[key] = object;
        break;
      }
      throw new Error(ENV.I18N.utils.not_supported_configuration);
    default:
      throw new Error(ENV.I18N.utils.not_supported_configuration);
  }
}

/**
 * @return {Promise<(function(string): number)>}
 */
export async function tokensCounter() {
  let counter = (text) => Array.from(text).length;
  try {
    if (ENV.GPT3_TOKENS_COUNT) {
      const loader = async (key, url) => {
        try {
          const raw = await DATABASE.get(key);
          if (raw && raw !== '') {
            return raw;
          }
        } catch (e) {
          console.error(e);
        }
        try {
          const bpe = await fetchWithRetry(url, {
            headers: {
              'User-Agent': CONST.USER_AGENT,
            },
          }).then((x) => x.text());
          await DATABASE.put(key, bpe);
          return bpe;
        } catch (e) {
          console.error(e);
        }
        return null;
      };
      counter = await gpt3TokensCounter( ENV.GPT3_TOKENS_COUNT_REPO, loader);
    }
  } catch (e) {
    console.error(e);
  }
  return (text) => {
    try {
      return counter(text);
    } catch (e) {
      console.error(e);
      return Array.from(text).length;
    }
  };
}

/**
 *
 * @param {Response} resp
 * @return {Response}
 */
export async function makeResponse200(resp) {
  if (resp === null) {
    return new Response('NOT HANDLED', {status: 200});
  }
  if (resp.status === 200) {
    return resp;
  } else {
    // 如果返回4xx，5xx，Telegram会重试这个消息，后续消息就不会到达，所有webhook的错误都返回200
    return new Response(resp.body, {
      status: 200,
      headers: {
        'Original-Status': resp.status,
        ...resp.headers,
      }});
  }
}

/**
 *
 * @param {Response} resp
 * @return {boolean}
 */
export function isJsonResponse(resp) {
  return resp.headers.get('content-type').indexOf('json') !== -1;
}

/**
 *
 * @param {Response} resp
 * @return {boolean}
 */
export function isEventStreamResponse(resp) {
  return resp.headers.get('content-type').indexOf('text/event-stream') !== -1;
}
/**
 * 
 * @param {string} text 
 * @param {string} type 
 * @returns {string}
 */
export function escapeText(text, type = 'info') {
const regex = /[\[\]\/\{\}\(\)\#\+\-\=\|\.\\\!]/g; // TG支持的格式不转义
  if (type === 'info') {
  return text.replace(regex, '\\$&');
  } else {
  return text
    .replace(/\n[\-\*\+]\s/g, '\n• ')
    // \_*[]()~`>#- MD内默认已经经过转义，但普通文本可能没有，不处理\_~`
    .replace(/(?<!\\)[\+\=\{\}\.\|\!\_\*\[\]\(\)\~\#\-]/g, '\\$&')
    .replace(/\>(?!\s)/g, '\\>')
    .replace(/\\\*\\\*/g, '*')
    // .replace(/(\\\#){1,6}\s(.+)\n/g, '*$1*\n')
    .replace(/(\!)?\\\[(.+)?\\\]\\\((.+)?\\\)/g, '[$2]($3)')
  // .replace(/\`\\+\`/g, '`\\\\`')
}
}


/**
 * 
 * @returns {Function} ：
 *  - url {String} 
 *  - options {Object} 
 *  - retries {Number} 
 *  - delayMs {Number} 
 */
function fetchWithRetryFunc() {
  const status429RetryTime = {};
  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 1000;
  const RETRY_MULTIPLIER = 2;
  const DEFAULT_RETRY_AFTER = 10;

  return async (url, options, retries = MAX_RETRIES, delayMs = RETRY_DELAY_MS) => {
    while (retries > 0) {
      try {
        const parsedUrl = new URL(url);
        const domain = `${parsedUrl.protocol}//${parsedUrl.host}`;
        const now = Date.now();
        // console.log(`status429RetryTime[domain]: ${status429RetryTime[domain]}`);
        // console.log(`now: ${now}`);
        // console.log(`${((status429RetryTime[domain] ?? now) - now)/1000 }s`)

        if ((status429RetryTime[domain] ?? now) > now) {
          return new Response('{"ok":false}', {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': Math.ceil((status429RetryTime[domain] - now) / 1000)
            }
          });
        }
        if (status429RetryTime[domain]) {
          status429RetryTime[domain] = null;
        }
        let resp = await fetch(url, options);
        if (resp.ok) {
          if (retries < MAX_RETRIES) console.log(`[DONE] after ${MAX_RETRIES - retries} times`);
          return resp;
        }
        const clone_resp = await resp.clone().json();
        console.log(`${JSON.stringify(clone_resp)}`);
        if (resp.status === 429) {
          const isTgMsg = domain == ENV.TELEGRAM_API_DOMAIN;
          const retryAfter = (isTgMsg ? clone_resp?.parameters?.retry_after : resp.headers.get('Retry-After')) || DEFAULT_RETRY_AFTER;
          // const retryAfter = resp?.parameters?.retry_after || resp.headers.get('Retry-After') || DEFAULT_RETRY_AFTER;
          status429RetryTime[domain] = Date.now() + 1000 * retryAfter;
          return resp;
        } else if (resp.status !== 503) {
          return resp;
        }
      } catch (error) {
        console.log(`Request failed, retry after ${delayMs / 1000} s: ${error}`);
      }
      await delay(delayMs);
      delayMs *= RETRY_MULTIPLIER;
      retries--;
    }
    throw new Error('Failed after maximum retries');
  };
}

export const fetchWithRetry = fetchWithRetryFunc();

/**
 * 延迟执行一段时间
 * @param {number} ms 毫秒数
 * @returns {Promise<void>}
 */
export function delay(ms = 1000) {
  return new Promise(resolve => setTimeout(resolve, ms));
}