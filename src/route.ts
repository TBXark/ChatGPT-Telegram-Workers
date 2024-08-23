import { handleMessage } from './telegram/message';
import { API_GUARD, ENV } from './config/env';
import { bindCommandForTelegram, commandsDocument } from './telegram/command';
import { bindTelegramWebHook } from './telegram/telegram';
import { errorToString, makeResponse200, renderHTML } from './utils/utils';
import type { RouterRequest } from './utils/router';
import { Router } from './utils/router';
import type { TelegramWebhookRequest } from './types/telegram';

const helpLink = 'https://github.com/TBXark/ChatGPT-Telegram-Workers/blob/master/doc/en/DEPLOY.md';
const issueLink = 'https://github.com/TBXark/ChatGPT-Telegram-Workers/issues';
const initLink = './init';

const footer = `
<br/>
<p>For more information, please visit <a href="${helpLink}">${helpLink}</a></p>
<p>If you have any questions, please visit <a href="${issueLink}">${issueLink}</a></p>
`;

function buildKeyNotFoundHTML(key: string): string {
    return `<p style="color: red">Please set the <strong>${key}</strong> environment variable in Cloudflare Workers.</p> `;
}

async function bindWebHookAction(request: RouterRequest): Promise<Response> {
    const result: any = [];
    const domain = new URL(request.url).host;
    const hookMode = API_GUARD ? 'safehook' : 'webhook';
    for (const token of ENV.TELEGRAM_AVAILABLE_TOKENS) {
        const url = `https://${domain}/telegram/${token.trim()}/${hookMode}`;
        const id = token.split(':')[0];
        result[id] = {
            webhook: await bindTelegramWebHook(token, url).then(res => res.json()).catch(e => errorToString(e)),
            command: await bindCommandForTelegram(token).catch(e => errorToString(e)),
        };
    }

    const HTML = renderHTML(`
    <h1>ChatGPT-Telegram-Workers</h1>
    <h2>${domain}</h2>
    ${
    ENV.TELEGRAM_AVAILABLE_TOKENS.length === 0 ? buildKeyNotFoundHTML('TELEGRAM_AVAILABLE_TOKENS') : ''
}
    ${
    Object.keys(result).map(id => `
        <br/>
        <h4>Bot ID: ${id}</h4>
        <p style="color: ${result[id].webhook.ok ? 'green' : 'red'}">Webhook: ${JSON.stringify(result[id].webhook)}</p>
        <p style="color: ${result[id].command.ok ? 'green' : 'red'}">Command: ${JSON.stringify(result[id].command)}</p>
        `).join('')

}
      ${footer}
    `);
    return new Response(HTML, { status: 200, headers: { 'Content-Type': 'text/html' } });
}

async function telegramWebhook(request: RouterRequest): Promise<Response> {
    try {
        const { token } = request.params as any;
        const body = await request.json() as TelegramWebhookRequest;
        return makeResponse200(await handleMessage(token, body));
    } catch (e) {
        console.error(e);
        return new Response(errorToString(e), { status: 200 });
    }
}

/**
 *用API_GUARD处理Telegram回调
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function telegramSafeHook(request: RouterRequest): Promise<Response> {
    try {
        if (API_GUARD === undefined || API_GUARD === null) {
            return telegramWebhook(request);
        }
        console.log('API_GUARD is enabled');
        const url = new URL(request.url);
        url.pathname = url.pathname.replace('/safehook', '/webhook');
        const newRequest = new Request(url, request);
        return makeResponse200(await API_GUARD.fetch(newRequest));
    } catch (e) {
        console.error(e);
        return new Response(errorToString(e), { status: 200 });
    }
}

async function defaultIndexAction(): Promise<Response> {
    const HTML = renderHTML(`
    <h1>ChatGPT-Telegram-Workers</h1>
    <br/>
    <p>Deployed Successfully!</p>
    <p> Version (ts:${ENV.BUILD_TIMESTAMP},sha:${ENV.BUILD_VERSION})</p>
    <br/>
    <p>You must <strong><a href="${initLink}"> >>>>> click here <<<<< </a></strong> to bind the webhook.</p>
    <br/>
    <p>After binding the webhook, you can use the following commands to control the bot:</p>
    ${
    commandsDocument().map(item => `<p><strong>${item.command}</strong> - ${item.description}</p>`).join('')
}
    <br/>
    <p>You can get bot information by visiting the following URL:</p>
    <p><strong>/telegram/:token/bot</strong> - Get bot information</p>
    ${footer}
  `);
    return new Response(HTML, { status: 200, headers: { 'Content-Type': 'text/html' } });
}

export async function handleRequest(request: Request): Promise<Response | null> {
    const router = new Router();
    router.get('/', defaultIndexAction);
    router.get('/init', bindWebHookAction);
    router.post('/telegram/:token/webhook', telegramWebhook);
    router.post('/telegram/:token/safehook', telegramSafeHook);
    router.all('*', () => new Response('Not Found', { status: 404 }));
    return router.fetch(request);
}
