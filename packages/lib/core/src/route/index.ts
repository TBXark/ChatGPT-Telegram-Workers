import type * as Telegram from 'telegram-bot-api-types';
import type { RouterRequest } from '../utils/router';
import { ENV } from '../config/env';
import { createTelegramBotAPI } from '../telegram/api';
import { commandsBindScope, commandsDocument } from '../telegram/command';
import { handleUpdate } from '../telegram/handler';
import { Router } from '../utils/router';
import { errorToString, makeResponse200, renderHTML } from './utils';

const helpLink = 'https://github.com/TBXark/ChatGPT-Telegram-Workers/blob/master/doc/en/DEPLOY.md';
const issueLink = 'https://github.com/TBXark/ChatGPT-Telegram-Workers/issues';
const initLink = './init';
const footer = `
<br/>
<p>For more information, please visit <a href="${helpLink}">${helpLink}</a></p>
<p>If you have any questions, please visit <a href="${issueLink}">${issueLink}</a></p>
`;

async function bindWebHookAction(request: RouterRequest): Promise<Response> {
    const result: Record<string, Record<string, any>> = {};
    const domain = new URL(request.url).host;
    const hookMode = ENV.API_GUARD ? 'safehook' : 'webhook';
    const scope = commandsBindScope();
    for (const token of ENV.TELEGRAM_AVAILABLE_TOKENS) {
        const api = createTelegramBotAPI(token);
        const url = `https://${domain}/telegram/${token.trim()}/${hookMode}`;
        const id = token.split(':')[0];
        result[id] = {};
        result[id].webhook = await api.setWebhook({ url }).then(res => res.json()).catch(e => errorToString(e));
        for (const [s, data] of Object.entries(scope)) {
            result[id][s] = await api.setMyCommands(data).then(res => res.json()).catch(e => errorToString(e));
        }
    }
    let html = `<h1>ChatGPT-Telegram-Workers</h1>`;
    html += `<h2>${domain}</h2>`;
    if (ENV.TELEGRAM_AVAILABLE_TOKENS.length === 0) {
        html += `<p style="color: red">Please set the <strong> TELEGRAM_AVAILABLE_TOKENS </strong> environment variable in Cloudflare Workers.</p> `;
    } else {
        for (const [key, res] of Object.entries(result)) {
            html += `<h3>Bot: ${key}</h3>`;
            for (const [s, data] of Object.entries(res)) {
                html += `<p style="color: ${data.ok ? 'green' : 'red'}">${s}: ${JSON.stringify(data)}</p>`;
            }
        }
    }
    html += footer;
    const HTML = renderHTML(html);
    return new Response(HTML, { status: 200, headers: { 'Content-Type': 'text/html' } });
}

async function telegramWebhook(request: RouterRequest): Promise<Response> {
    try {
        const { token } = request.params as any;
        const body = await request.json() as Telegram.Update;
        return makeResponse200(await handleUpdate(token, body));
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
        if (ENV.API_GUARD === undefined || ENV.API_GUARD === null) {
            return telegramWebhook(request);
        }
        console.log('API_GUARD is enabled');
        const url = new URL(request.url);
        url.pathname = url.pathname.replace('/safehook', '/webhook');
        const newRequest = new Request(url, request);
        return makeResponse200(await ENV.API_GUARD.fetch(newRequest));
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

export function createRouter(): Router {
    const router = new Router();
    router.get('/', defaultIndexAction);
    router.get('/init', bindWebHookAction);
    router.post('/telegram/:token/webhook', telegramWebhook);
    router.post('/telegram/:token/safehook', telegramSafeHook);
    router.all('*', () => new Response('Not Found', { status: 404 }));
    return router;
}
