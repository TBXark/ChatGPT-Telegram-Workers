import {handleMessage} from './telegram/message.js';
import {API_GUARD, ENV} from './config/env.js';
import {bindCommandForTelegram, commandsDocument} from './telegram/command.js';
import {bindTelegramWebHook, getBot} from './telegram/telegram.js';
import {errorToString, makeResponse200, renderHTML} from './utils/utils.js';
import { Router } from './utils/router.js';


const helpLink = 'https://github.com/TBXark/ChatGPT-Telegram-Workers/blob/master/doc/en/DEPLOY.md';
const issueLink = 'https://github.com/TBXark/ChatGPT-Telegram-Workers/issues';
const initLink = './init';

const footer = `
<br/>
<p>For more information, please visit <a href="${helpLink}">${helpLink}</a></p>
<p>If you have any questions, please visit <a href="${issueLink}">${issueLink}</a></p>
`;

/**
 * @param {string} key
 * @returns {string}
 */
function buildKeyNotFoundHTML(key) {
    return `<p style="color: red">Please set the <strong>${key}</strong> environment variable in Cloudflare Workers.</p> `;
}

/**
 *
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function bindWebHookAction(request) {
    const result = [];
    const domain = new URL(request.url).host;
    const hookMode = API_GUARD ? 'safehook' : 'webhook';
    for (const token of ENV.TELEGRAM_AVAILABLE_TOKENS) {
        const url = `https://${domain}/telegram/${token.trim()}/${hookMode}`;
        const id = token.split(':')[0];
        result[id] = {
            webhook: await bindTelegramWebHook(token, url).catch((e) => errorToString(e)),
            command: await bindCommandForTelegram(token).catch((e) => errorToString(e)),
        };
    }

    const HTML = renderHTML(`
    <h1>ChatGPT-Telegram-Workers</h1>
    <h2>${domain}</h2>
    ${
        ENV.TELEGRAM_AVAILABLE_TOKENS.length === 0 ? buildKeyNotFoundHTML('TELEGRAM_AVAILABLE_TOKENS') : ''
    }
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


/**
 * 处理Telegram回调
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function telegramWebhook(request) {
    try {
        const { token } = request.params;
        const body = await request.json();
        return makeResponse200(await handleMessage(token, body));
    } catch (e) {
        console.error(e);
        return new Response(errorToString(e), {status: 200});
    }
}


/**
 *
 *用API_GUARD处理Telegram回调
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function telegramSafeHook(request) {
    try {
        if (API_GUARD === undefined || API_GUARD === null) {
            return telegramWebhook(request);
        }
        console.log('API_GUARD is enabled');
        const url = new URL(request.url);
        url.pathname = url.pathname.replace('/safehook', '/webhook');
        request = new Request(url, request);
        return makeResponse200(await API_GUARD.fetch(request));
    } catch (e) {
        console.error(e);
        return new Response(errorToString(e), {status: 200});
    }
}

/**
 * @returns {Promise<Response>}
 */
async function defaultIndexAction() {
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
        commandsDocument().map((item) => `<p><strong>${item.command}</strong> - ${item.description}</p>`).join('')
    }
    <br/>
    <p>You can get bot information by visiting the following URL:</p>
    <p><strong>/telegram/:token/bot</strong> - Get bot information</p>
    ${footer}
  `);
    return new Response(HTML, {status: 200, headers: {'Content-Type': 'text/html'}});
}

/**
 * @returns {Promise<Response>}
 */
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

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
export async function handleRequest(request) {
    const router = new Router();
    router.get('/', defaultIndexAction);
    router.get('/init', bindWebHookAction);
    router.post('/telegram/:token/webhook', telegramWebhook);
    router.post('/telegram/:token/safehook', telegramSafeHook);
    if (ENV.DEV_MODE || ENV.DEBUG_MODE) {
        router.get('/telegram/:token/bot', loadBotInfo);
    }
    router.all('*', () => new Response('Not Found', {status: 404}));
    return router.fetch(request);
}
