import {handleMessage} from './message.js';
import {DATABASE, ENV} from './env.js';
import {bindCommandForTelegram} from './command.js';
import {bindTelegramWebHook, getBot} from './telegram.js';
import {historyPassword, renderHTML} from './utils.js';


const helpLink = 'https://github.com/TBXark/ChatGPT-Telegram-Workers/blob/master/DEPLOY.md';
const issueLink = 'https://github.com/TBXark/ChatGPT-Telegram-Workers/issues';
const initLink = './init';

const footer = `
<br/>
<p>For more information, please visit <a href="${helpLink}">${helpLink}</a></p>
<p>If you have any questions, please visit <a href="${issueLink}">${issueLink}</a></p>
`;

async function bindWebHookAction(request) {
  const result = [];
  const domain = new URL(request.url).host;
  for (const token of ENV.TELEGRAM_AVAILABLE_TOKENS) {
    const url = `https://${domain}/telegram/${token.trim()}/webhook`;
    const id = token.split(':')[0];
    result[id] = {
      webhook: await bindTelegramWebHook(token, url),
      command: await bindCommandForTelegram(token),
    };
  }

  const HTML = renderHTML(`
    <h1>ChatGPT-Telegram-Workers</h1>
    <h2>${domain}</h2>
    ${
  Object.keys(result).map((id) => `
        <br/>
        <h4>Bot ID: ${id}</h4>
        <p style="color: ${result[id].webhook.ok ? 'green' : 'red'}">Webhook: ${JSON.stringify(result[id].webhook)}</p>
        <p style="color: ${result[id].command.ok ? 'green' : 'red'}">Command: ${JSON.stringify(result[id].command)}</p>
        `).join('')

}
      ${footer}
    `);
  return new Response(HTML, {status: 200, headers: {'Content-Type': 'text/html'}});
}

async function loadChatHistory(request) {
  const password = await historyPassword();
  const {pathname} = new URL(request.url);
  const historyKey = pathname.match(/^\/telegram\/(.+)\/history/)[1];
  const params = new URL(request.url).searchParams;
  const passwordParam = params.get('password');
  if (passwordParam !== password) {
    return new Response('Password Error', {status: 401});
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
  const HTML = renderHTML(`
    <h1>ChatGPT-Telegram-Workers</h1>
    <br/>
    <p>Deployed Successfully!</p>
    <p>You must <strong><a href="${initLink}"> >>>>> click here <<<<< </a></strong> to bind the webhook.</p>
    <br/>
    <p>After binding the webhook, you can use the following commands to control the bot:</p>
    <p><strong>/start</strong> - Start the bot</p>
    <p><strong>/new</strong> - Start a new conversation</p>
    <p><strong>/setenv</strong> - Set the environment variable</p>
    <p><strong>/version</strong> - Get the current version number</p>
    <p><strong>/help</strong> - Get the command help</p>
    <br/>
    <p>You can get bot information by visiting the following URL:</p>
    <p><strong>/telegram/:token/bot</strong> - Get bot information</p>
    ${footer}
  `);
  return new Response(HTML, {status: 200, headers: {'Content-Type': 'text/html'}});
}

async function loadBotInfo() {
  const result = [];
  for (const token of ENV.TELEGRAM_AVAILABLE_TOKENS) {
    const id = token.split(':')[0];
    result[id] = await getBot(token);
  }
  const HTML = renderHTML(`
    <h1>ChatGPT-Telegram-Workers</h1>
    <br/>
    <h4>Environment About Bot</h4>
    <p><strong>GROUP_CHAT_BOT_ENABLE:</strong> ${ENV.GROUP_CHAT_BOT_ENABLE}</p>
    <p><strong>GROUP_CHAT_BOT_SHARE_MODE:</strong> ${ENV.GROUP_CHAT_BOT_SHARE_MODE}</p>
    <p><strong>TELEGRAM_BOT_NAME:</strong> ${ENV.TELEGRAM_BOT_NAME.join(',')}</p>
    ${
  Object.keys(result).map((id) => `
            <br/>
            <h4>Bot ID: ${id}</h4>
            <p style="color: ${result[id].ok ? 'green' : 'red'}">${JSON.stringify(result[id])}</p>
            `).join('')
}
    ${footer}
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
  if (pathname.startsWith(`/telegram`) && pathname.endsWith(`/bot`)) {
    return loadBotInfo(request);
  }
  return null;
}
