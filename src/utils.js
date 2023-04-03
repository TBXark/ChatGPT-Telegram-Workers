import {CONST, DATABASE, ENV} from './env.js';
import {gpt3TokensCounter} from './gpt3.js';

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
 * @param {*} value
 */
export function mergeConfig(config, key, value) {
  switch (typeof config[key]) {
    case 'number':
      config[key] = Number(value);
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
      counter = await gpt3TokensCounter();
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
export function makeResponse200(resp) {
  if (resp === null) {
    return new Response('NOT HANDLED', {status: 200});
  }
  if (resp.status === 200) {
    return resp;
  } else {
    // 如果返回4xx，5xx，Telegram会重试这个消息，后续消息就不会到达，所有webhook的错误都返回200
    return new Response(resp.body, {status: 200, headers: {
      'Original-Status': resp.status,
      ...resp.headers,
    }});
  }
}
