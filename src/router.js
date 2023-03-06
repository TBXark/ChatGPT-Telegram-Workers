import {handleMessage} from './message.js';
import {ENV} from './env.js';
import { setCommandForTelegram } from './command.js';
import { bindTelegramWebHook } from './telegram.js';

async function bindWebHookAction() {
  const result = {};
  let domain = ENV.WORKERS_DOMAIN
  if(domain.toLocaleLowerCase().startsWith("http")){
    domain = new URL(domain).host
  }
  for (const token of ENV.TELEGRAM_AVAILABLE_TOKENS) {
    const url = `https://${domain}/telegram/${token}/webhook`
    const id = token.split(':')[0]
    result[id] = {
      webhook: await bindTelegramWebHook(token, url),
      command: await setCommandForTelegram(token),
    }
  }
  return new Response(JSON.stringify(result), {status: 200});
}

// 处理Telegram回调
async function telegramWebhookAction(request) {
  const resp = await handleMessage(request);
  return resp || new Response('NOT HANDLED', {status: 200});
}

async function defaultIndexAction() {
  const helpLink = 'https://github.com/TBXark/ChatGPT-Telegram-Workers/blob/master/DEPLOY.md'
  const issueLink = 'https://github.com/TBXark/ChatGPT-Telegram-Workers/issues'
  const initLink = './init'
  const HTML = `
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
    <h1>ChatGPT-Telegram-Workers</h1>
    <p>Deployed Successfully!</p>
    <p>You must <strong><a href="${initLink}"> >>>>> init <<<<< </a></strong> first.</p>
    <p>For more information, please visit <a href="${helpLink}">${helpLink}</a></p>
    <p>If you have any questions, please visit <a href="${issueLink}">${issueLink}</a></p>
  </body>
</html>
  `
  return new Response(HTML, {status: 200, headers: {'Content-Type': 'text/html'}});
}

export async function handleRequest(request) {
  const {pathname} = new URL(request.url);
  if (pathname === `/`) {
    return defaultIndexAction();
  }
  if (pathname.startsWith(`/init`)) {
    return bindWebHookAction();
  }
  if (pathname.startsWith(`/telegram`) && pathname.endsWith(`/webhook`)) {
    return telegramWebhookAction(request);
  }
  if (pathname.startsWith(`/env`)){
    return new Response(JSON.stringify(ENV), {status: 200})
  }
  return null;
}
