import {CONST, DATABASE} from './env.js';

export function randomString(length) {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

export async function historyPassword() {
  let password = await DATABASE.get(CONST.PASSWORD_KEY);
  if (password === null) {
    password = randomString(32);
    await DATABASE.put(CONST.PASSWORD_KEY, password);
  }
  return password;
}


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
 * 重试方法
 *
 * @param {Function} fn 异步方法
 * @param {int} maxAttemptCount 最大重试次数
 * @param {int} retryInterval 间隔时间ms,默认100ms
 * @return {Promise<any>}
 */
export async function retry(fn, maxAttemptCount, retryInterval = 100) {
  for (let i = 0; i < maxAttemptCount; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxAttemptCount - 1) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, retryInterval));
    }
  }
}

export async function catchWithDefault(defaultValue, fn) {
  try {
    const res = fn();
    if (res instanceof Promise) {
      return await res;
    }
    return res;
  } catch (e) {
    return defaultValue;
  }
}

export function errorToString(e) {
  return JSON.stringify({
    message: e.message,
    stack: e.stack,
  });
}
