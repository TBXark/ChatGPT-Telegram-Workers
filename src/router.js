import {handleMessage} from './message.js';
import {DATABASE, ENV} from './env.js';
import {setCommandForTelegram} from './command.js';
import {bindTelegramWebHook} from './telegram.js';
import {historyPassword, renderHTML} from './utils.js';

async function bindWebHookAction(request) {
  const result = {};
  let domain = new URL(request.url).host
  result.domain = domain
  for (const token of ENV.TELEGRAM_AVAILABLE_TOKENS) {
    const url = `https://${domain}/telegram/${token.trim()}/webhook`;
    const id = token.split(':')[0];
    result[id] = {
      webhook: await bindTelegramWebHook(token, url),
      command: await setCommandForTelegram(token),
    };
  }
  return new Response(JSON.stringify(result), {status: 200});
}

async function loadChatHistory(request) {
  const password = await historyPassword();
  const {pathname} = new URL(request.url);
  const historyKey = pathname.match(/^\/telegram\/(.+)\/history/)[1];
  const params = new URL(request.url).searchParams;
  const passwordParam = params.get('password');
  if (passwordParam !== password) {
    return new Response('Password Error', {status: 200});
  }
  const history = await DATABASE.get(historyKey).then((res) => JSON.parse(res));
  const HTML = renderHTML(`
        <div id="history" style="width: 100%; height: 100%; overflow: auto; padding: 10px;">
            ${history.map((item) => `
                <div style="margin-bottom: 10px;">
                    <hp style="font-size: 16px; color: #999; margin-bottom: 5px;">${item.role}:</hp>
                    <p style="font-size: 12px; color: #333;">${item.content}</p>
                </div>
            `).join('')}
        </div>
  `);
  return new Response(HTML, {status: 200, headers: {'Content-Type': 'text/html'}});
}

// 处理Telegram回调
async function telegramWebhookAction(request) {
  const resp = await handleMessage(request);
  return resp || new Response('NOT HANDLED', {status: 200});
}

async function defaultIndexAction() {
  const helpLink = 'https://github.com/TBXark/ChatGPT-Telegram-Workers/blob/master/DEPLOY.md';
  const issueLink = 'https://github.com/TBXark/ChatGPT-Telegram-Workers/issues';
  const initLink = './init';
  const HTML = renderHTML(`
    <h1>ChatGPT-Telegram-Workers</h1>
    <p>Deployed Successfully!</p>
    <p>You must <strong><a href="${initLink}"> >>>>> init <<<<< </a></strong> first.</p>
    <p>For more information, please visit <a href="${helpLink}">${helpLink}</a></p>
    <p>If you have any questions, please visit <a href="${issueLink}">${issueLink}</a></p>
  `);
  return new Response(HTML, {status: 200, headers: {'Content-Type': 'text/html'}});
}

export async function handleRequest(request) {
  const {pathname} = new URL(request.url);
  if (pathname === `/`) {
    return defaultIndexAction();
  }
  if (pathname.startsWith(`/init`)) {
    return bindWebHookAction(request);
  }
  if (pathname.startsWith(`/telegram`) && pathname.endsWith(`/history`)) {
    return loadChatHistory(request);
  }
  if (pathname.startsWith(`/telegram`) && pathname.endsWith(`/webhook`)) {
    return telegramWebhookAction(request);
  }
  if (pathname.startsWith(`/env`)) {
    return new Response(JSON.stringify(ENV), {status: 200});
  }
  return null;
}
