class UserConfig {
  DEFINE_KEYS = [];
  AI_PROVIDER = "auto";
  AI_IMAGE_PROVIDER = "auto";
  SYSTEM_INIT_MESSAGE = null;
  SYSTEM_INIT_MESSAGE_ROLE = "system";
  OPENAI_API_KEY = [];
  OPENAI_CHAT_MODEL = "gpt-4o-mini";
  OPENAI_API_BASE = "https://api.openai.com/v1";
  OPENAI_API_EXTRA_PARAMS = {};
  DALL_E_MODEL = "dall-e-2";
  DALL_E_IMAGE_SIZE = "512x512";
  DALL_E_IMAGE_QUALITY = "standard";
  DALL_E_IMAGE_STYLE = "vivid";
  AZURE_API_KEY = null;
  AZURE_COMPLETIONS_API = null;
  AZURE_DALLE_API = null;
  CLOUDFLARE_ACCOUNT_ID = null;
  CLOUDFLARE_TOKEN = null;
  WORKERS_CHAT_MODEL = "@cf/mistral/mistral-7b-instruct-v0.1 ";
  WORKERS_IMAGE_MODEL = "@cf/stabilityai/stable-diffusion-xl-base-1.0";
  GOOGLE_API_KEY = null;
  GOOGLE_COMPLETIONS_API = "https://generativelanguage.googleapis.com/v1beta/models/";
  GOOGLE_COMPLETIONS_MODEL = "gemini-pro";
  MISTRAL_API_KEY = null;
  MISTRAL_API_BASE = "https://api.mistral.ai/v1";
  MISTRAL_CHAT_MODEL = "mistral-tiny";
  COHERE_API_KEY = null;
  COHERE_API_BASE = "https://api.cohere.com/v1";
  COHERE_CHAT_MODEL = "command-r-plus";
  ANTHROPIC_API_KEY = null;
  ANTHROPIC_API_BASE = "https://api.anthropic.com/v1";
  ANTHROPIC_CHAT_MODEL = "claude-3-haiku-20240307";
}
class Environment {
  BUILD_TIMESTAMP = 1724293866 ;
  BUILD_VERSION = "3925908" ;
  I18N = null;
  LANGUAGE = "zh-cn";
  UPDATE_BRANCH = "master";
  CHAT_COMPLETE_API_TIMEOUT = 0;
  TELEGRAM_API_DOMAIN = "https://api.telegram.org";
  TELEGRAM_AVAILABLE_TOKENS = [];
  DEFAULT_PARSE_MODE = "Markdown";
  TELEGRAM_MIN_STREAM_INTERVAL = 0;
  TELEGRAM_PHOTO_SIZE_OFFSET = 1;
  TELEGRAM_IMAGE_TRANSFER_MODE = "url";
  I_AM_A_GENEROUS_PERSON = false;
  CHAT_WHITE_LIST = [];
  LOCK_USER_CONFIG_KEYS = [
    "OPENAI_API_BASE",
    "GOOGLE_COMPLETIONS_API",
    "MISTRAL_API_BASE",
    "COHERE_API_BASE",
    "ANTHROPIC_API_BASE",
    "AZURE_COMPLETIONS_API",
    "AZURE_DALLE_API"
  ];
  TELEGRAM_BOT_NAME = [];
  CHAT_GROUP_WHITE_LIST = [];
  GROUP_CHAT_BOT_ENABLE = true;
  GROUP_CHAT_BOT_SHARE_MODE = true;
  AUTO_TRIM_HISTORY = true;
  MAX_HISTORY_LENGTH = 20;
  MAX_TOKEN_LENGTH = -1;
  HISTORY_IMAGE_PLACEHOLDER = null;
  HIDE_COMMAND_BUTTONS = [];
  SHOW_REPLY_BUTTON = false;
  EXTRA_MESSAGE_CONTEXT = false;
  TELEGRAPH_ENABLE = false;
  STREAM_MODE = true;
  SAFE_MODE = true;
  DEBUG_MODE = false;
  DEV_MODE = false;
  USER_CONFIG = new UserConfig();
  PLUGINS_ENV = {};
}
const ENV = new Environment();
let DATABASE = null;
let API_GUARD = null;
const CUSTOM_COMMAND = {};
const CUSTOM_COMMAND_DESCRIPTION = {};
const PLUGINS_COMMAND = {};
const PLUGINS_COMMAND_DESCRIPTION = {};
const CONST = {
  PASSWORD_KEY: "chat_history_password",
  GROUP_TYPES: ["group", "supergroup"]
};
const ENV_TYPES = {
  SYSTEM_INIT_MESSAGE: "string",
  AZURE_API_KEY: "string",
  AZURE_COMPLETIONS_API: "string",
  AZURE_DALLE_API: "string",
  CLOUDFLARE_ACCOUNT_ID: "string",
  CLOUDFLARE_TOKEN: "string",
  GOOGLE_API_KEY: "string",
  MISTRAL_API_KEY: "string",
  COHERE_API_KEY: "string",
  ANTHROPIC_API_KEY: "string",
  HISTORY_IMAGE_PLACEHOLDER: "string"
};
const ENV_KEY_MAPPER = {
  CHAT_MODEL: "OPENAI_CHAT_MODEL",
  API_KEY: "OPENAI_API_KEY",
  WORKERS_AI_MODEL: "WORKERS_CHAT_MODEL"
};
function parseArray(raw) {
  raw = raw.trim();
  if (raw === "") {
    return [];
  }
  if (raw.startsWith("[") && raw.endsWith("]")) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
  }
  return raw.split(",");
}
function mergeEnvironment(target, source) {
  const sourceKeys = new Set(Object.keys(source));
  for (const key of Object.keys(target)) {
    if (!sourceKeys.has(key)) {
      continue;
    }
    const t = ENV_TYPES[key] || typeof target[key];
    if (typeof source[key] !== "string") {
      target[key] = source[key];
      continue;
    }
    switch (t) {
      case "number":
        target[key] = Number.parseInt(source[key], 10);
        break;
      case "boolean":
        target[key] = (source[key] || "false") === "true";
        break;
      case "string":
        target[key] = source[key];
        break;
      case "array":
        target[key] = parseArray(source[key]);
        break;
      case "object":
        if (Array.isArray(target[key])) {
          target[key] = parseArray(source[key]);
        } else {
          try {
            target[key] = JSON.parse(source[key]);
          } catch (e) {
            console.error(e);
          }
        }
        break;
      default:
        target[key] = source[key];
        break;
    }
  }
}
function initEnv(env, i18n) {
  DATABASE = env.DATABASE;
  API_GUARD = env.API_GUARD;
  const customCommandPrefix = "CUSTOM_COMMAND_";
  const customCommandDescriptionPrefix = "COMMAND_DESCRIPTION_";
  for (const key of Object.keys(env)) {
    if (key.startsWith(customCommandPrefix)) {
      const cmd = key.substring(customCommandPrefix.length);
      CUSTOM_COMMAND[`/${cmd}`] = env[key];
      CUSTOM_COMMAND_DESCRIPTION[`/${cmd}`] = env[customCommandDescriptionPrefix + cmd];
    }
  }
  const pluginCommandPrefix = "PLUGIN_COMMAND_";
  const pluginCommandDescriptionPrefix = "PLUGIN_COMMAND_DESCRIPTION_";
  for (const key of Object.keys(env)) {
    if (key.startsWith(pluginCommandPrefix)) {
      const cmd = key.substring(pluginCommandPrefix.length);
      PLUGINS_COMMAND[`/${cmd}`] = env[key];
      PLUGINS_COMMAND_DESCRIPTION[`/${cmd}`] = env[pluginCommandDescriptionPrefix + cmd];
    }
  }
  const pluginEnvPrefix = "PLUGIN_ENV_";
  for (const key of Object.keys(env)) {
    if (key.startsWith(pluginEnvPrefix)) {
      const plugin = key.substring(pluginEnvPrefix.length);
      ENV.PLUGINS_ENV[plugin] = env[key];
    }
  }
  mergeEnvironment(ENV, env);
  mergeEnvironment(ENV.USER_CONFIG, env);
  migrateOldEnv(env, i18n);
  ENV.USER_CONFIG.DEFINE_KEYS = [];
}
function migrateOldEnv(env, i18n) {
  ENV.I18N = i18n((ENV.LANGUAGE || "cn").toLowerCase());
  if (env.TELEGRAM_TOKEN && !ENV.TELEGRAM_AVAILABLE_TOKENS.includes(env.TELEGRAM_TOKEN)) {
    if (env.BOT_NAME && ENV.TELEGRAM_AVAILABLE_TOKENS.length === ENV.TELEGRAM_BOT_NAME.length) {
      ENV.TELEGRAM_BOT_NAME.push(env.BOT_NAME);
    }
    ENV.TELEGRAM_AVAILABLE_TOKENS.push(env.TELEGRAM_TOKEN);
  }
  if (env.OPENAI_API_DOMAIN && !ENV.OPENAI_API_BASE) {
    ENV.USER_CONFIG.OPENAI_API_BASE = `${env.OPENAI_API_DOMAIN}/v1`;
  }
  if (env.WORKERS_AI_MODEL && !ENV.USER_CONFIG.WORKERS_CHAT_MODEL) {
    ENV.USER_CONFIG.WORKERS_CHAT_MODEL = env.WORKERS_AI_MODEL;
  }
  if (env.API_KEY && ENV.USER_CONFIG.OPENAI_API_KEY.length === 0) {
    ENV.USER_CONFIG.OPENAI_API_KEY = env.API_KEY.split(",");
  }
  if (env.CHAT_MODEL && !ENV.USER_CONFIG.OPENAI_CHAT_MODEL) {
    ENV.USER_CONFIG.OPENAI_CHAT_MODEL = env.CHAT_MODEL;
  }
  if (!ENV.USER_CONFIG.SYSTEM_INIT_MESSAGE) {
    ENV.USER_CONFIG.SYSTEM_INIT_MESSAGE = ENV.I18N?.env?.system_init_message || "You are a helpful assistant";
  }
}

function trimUserConfig(userConfig) {
    const config = {
        ...(userConfig || {}),
    };
    const keysSet = new Set(userConfig?.DEFINE_KEYS || []);
    for (const key of ENV.LOCK_USER_CONFIG_KEYS) {
        keysSet.delete(key);
    }
    keysSet.add('DEFINE_KEYS');
    for (const key of Object.keys(config)) {
        if (!keysSet.has(key)) {
            delete config[key];
        }
    }
    return config;
}
class ShareContext {
    currentBotId = null;
    currentBotToken = null;
    currentBotName = null;
    chatHistoryKey = null;
    chatLastMessageIdKey = null;
    configStoreKey = null;
    groupAdminKey = null;
    usageKey = null;
    chatType = null;
    chatId = null;
    speakerId = null;
    extraMessageContext = null;
    allMemberAreAdmin = false;
}
class CurrentChatContext {
    chat_id = null;
    reply_to_message_id = null;
    parse_mode = ENV.DEFAULT_PARSE_MODE;
    message_id = null;
    reply_markup = null;
    allow_sending_without_reply = null;
    disable_web_page_preview = null;
}
class Context {
    USER_CONFIG = new UserConfig();
    CURRENT_CHAT_CONTEXT = new CurrentChatContext();
    SHARE_CONTEXT = new ShareContext();
    _initChatContext(chatId, replyToMessageId) {
        this.CURRENT_CHAT_CONTEXT.chat_id = chatId;
        this.CURRENT_CHAT_CONTEXT.reply_to_message_id = replyToMessageId;
        if (replyToMessageId) {
            this.CURRENT_CHAT_CONTEXT.allow_sending_without_reply = true;
        }
    }
    async _initUserConfig(storeKey) {
        try {
            this.USER_CONFIG = {
                ...ENV.USER_CONFIG,
            };
            const userConfig = JSON.parse(await DATABASE.get(storeKey));
            mergeEnvironment(this.USER_CONFIG, trimUserConfig(userConfig));
        } catch (e) {
            console.error(e);
        }
    }
    initTelegramContext(token) {
        const telegramIndex = ENV.TELEGRAM_AVAILABLE_TOKENS.indexOf(token);
        if (telegramIndex === -1) {
            throw new Error('Token not allowed');
        }
        this.SHARE_CONTEXT.currentBotToken = token;
        this.SHARE_CONTEXT.currentBotId = token.split(':')[0];
        if (ENV.TELEGRAM_BOT_NAME.length > telegramIndex) {
            this.SHARE_CONTEXT.currentBotName = ENV.TELEGRAM_BOT_NAME[telegramIndex];
        }
    }
    async _initShareContext(message) {
        this.SHARE_CONTEXT.usageKey = `usage:${this.SHARE_CONTEXT.currentBotId}`;
        const id = message?.chat?.id;
        if (id === undefined || id === null) {
            throw new Error('Chat id not found');
        }
        const botId = this.SHARE_CONTEXT.currentBotId;
        let historyKey = `history:${id}`;
        let configStoreKey = `user_config:${id}`;
        let groupAdminKey = null;
        if (botId) {
            historyKey += `:${botId}`;
            configStoreKey += `:${botId}`;
        }
        if (CONST.GROUP_TYPES.includes(message.chat?.type)) {
            if (!ENV.GROUP_CHAT_BOT_SHARE_MODE && message.from.id) {
                historyKey += `:${message.from.id}`;
                configStoreKey += `:${message.from.id}`;
            }
            groupAdminKey = `group_admin:${id}`;
        }
        if (message?.chat?.is_forum && message?.is_topic_message) {
            if (message?.message_thread_id) {
                historyKey += `:${message.message_thread_id}`;
                configStoreKey += `:${message.message_thread_id}`;
            }
        }
        this.SHARE_CONTEXT.chatHistoryKey = historyKey;
        this.SHARE_CONTEXT.chatLastMessageIdKey = `last_message_id:${historyKey}`;
        this.SHARE_CONTEXT.configStoreKey = configStoreKey;
        this.SHARE_CONTEXT.groupAdminKey = groupAdminKey;
        this.SHARE_CONTEXT.chatType = message.chat?.type;
        this.SHARE_CONTEXT.chatId = message.chat.id;
        this.SHARE_CONTEXT.speakerId = message.from.id || message.chat.id;
        this.SHARE_CONTEXT.allMemberAreAdmin = message?.chat?.all_members_are_administrators;
    }
    async initContext(message) {
        const chatId = message?.chat?.id;
        const replyId = CONST.GROUP_TYPES.includes(message.chat?.type) ? message.message_id : null;
        this._initChatContext(chatId, replyId);
        await this._initShareContext(message);
        await this._initUserConfig(this.SHARE_CONTEXT.configStoreKey);
    }
}

class Cache {
    constructor() {
        this.maxItems = 10;
        this.maxAge = 1000 * 60 * 60;
        this.cache = {};
    }
    set(key, value) {
        this.trim();
        this.cache[key] = {
            value,
            time: Date.now(),
        };
    }
    get(key) {
        this.trim();
        return this.cache[key]?.value;
    }
    trim() {
        let keys = Object.keys(this.cache);
        for (const key of keys) {
            if (Date.now() - this.cache[key].time > this.maxAge) {
                delete this.cache[key];
            }
        }
        keys = Object.keys(this.cache);
        if (keys.length > this.maxItems) {
            keys.sort((a, b) => this.cache[a].time - this.cache[b].time);
            for (let i = 0; i < keys.length - this.maxItems; i++) {
                delete this.cache[keys[i]];
            }
        }
    }
}

const IMAGE_CACHE = new Cache();
async function fetchImage(url) {
    if (IMAGE_CACHE[url]) {
        return IMAGE_CACHE.get(url);
    }
    return fetch(url)
        .then(resp => resp.blob())
        .then((blob) => {
            IMAGE_CACHE.set(url, blob);
            return blob;
        });
}
async function uploadImageToTelegraph(url) {
    if (url.startsWith('https://telegra.ph')) {
        return url;
    }
    const raw = await fetchImage(url);
    const formData = new FormData();
    formData.append('file', raw, 'blob');
    const resp = await fetch('https://telegra.ph/upload', {
        method: 'POST',
        body: formData,
    });
    let [{ src }] = await resp.json();
    src = `https://telegra.ph${src}`;
    IMAGE_CACHE.set(src, raw);
    return src;
}
async function urlToBase64String(url) {
    try {
        const { Buffer } = await import('node:buffer');
        return fetchImage(url)
            .then(blob => blob.arrayBuffer())
            .then(buffer => Buffer.from(buffer).toString('base64'));
    } catch {
        return fetchImage(url)
            .then(blob => blob.arrayBuffer())
            .then(buffer => btoa(String.fromCharCode.apply(null, new Uint8Array(buffer))));
    }
}
function getImageFormatFromBase64(base64String) {
    const firstChar = base64String.charAt(0);
    switch (firstChar) {
        case '/':
            return 'jpeg';
        case 'i':
            return 'png';
        case 'R':
            return 'gif';
        case 'U':
            return 'webp';
        default:
            throw new Error('Unsupported image format');
    }
}
async function imageToBase64String(url) {
    const base64String = await urlToBase64String(url);
    const format = getImageFormatFromBase64(base64String);
    return {
        data: base64String,
        format: `image/${format}`,
    };
}
function renderBase64DataURI(params) {
    return `data:${params.format};base64,${params.data}`;
}

function renderHTML(body) {
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
function errorToString(e) {
    return JSON.stringify({
        message: e.message,
        stack: e.stack,
    });
}
function makeResponse200(resp) {
    if (resp === null) {
        return new Response('NOT HANDLED', { status: 200 });
    }
    if (resp.status === 200) {
        return resp;
    } else {
        return new Response(resp.body, {
            status: 200,
            headers: {
                'Original-Status': resp.status,
                ...resp.headers,
            },
        });
    }
}

const escapeChars = /([_*[\]()\\~`>#+\-=|{}.!])/g;
function escape(text) {
    const lines = text.split('\n');
    const stack = [];
    const result = [];
    let linetrim = '';
    for (const [i, line] of lines.entries()) {
        linetrim = line.trim();
        let startIndex;
        if (/^```.+/.test(linetrim)) {
            stack.push(i);
        } else if (linetrim === '```') {
            if (stack.length) {
                startIndex = stack.pop();
                if (!stack.length) {
                    const content = lines.slice(startIndex, i + 1).join('\n');
                    result.push(handleEscape(content, 'code'));
                    continue;
                }
            } else {
                stack.push(i);
            }
        }
        if (!stack.length) {
            result.push(handleEscape(line));
        }
    }
    if (stack.length) {
        const last = `${lines.slice(stack[0]).join('\n')}\n\`\`\``;
        result.push(handleEscape(last, 'code'));
    }
    return result.join('\n');
}
function handleEscape(text, type = 'text') {
    if (!text.trim()) {
        return text;
    }
    if (type === 'text') {
        text = text
            .replace(escapeChars, '\\$1')
            .replace(/\\\*\\\*(.*?[^\\])\\\*\\\*/g, '*$1*')
            .replace(/\\_\\_(.*?[^\\])\\_\\_/g, '__$1__')
            .replace(/\\_(.*?[^\\])\\_/g, '_$1_')
            .replace(/\\~(.*?[^\\])\\~/g, '~$1~')
            .replace(/\\\|\\\|(.*?[^\\])\\\|\\\|/g, '||$1||')
            .replace(/\\\[([^\]]+?)\\\]\\\((.+?)\\\)/g, '[$1]($2)')
            .replace(/\\`(.*?[^\\])\\`/g, '`$1`')
            .replace(/\\\\\\([_*[\]()\\~`>#+\-=|{}.!])/g, '\\$1')
            .replace(/^(\s*)\\(>.+\s*)$/gm, '$1$2')
            .replace(/^(\s*)\\-\s*(.+)$/gm, '$1• $2')
            .replace(/^((\\#){1,3}\s)(.+)/gm, '$1*$3*');
    } else {
        const codeBlank = text.length - text.trimStart().length;
        if (codeBlank > 0) {
            const blankReg = new RegExp(`^\\s{${codeBlank}}`, 'gm');
            text = text.replace(blankReg, '');
        }
        text = text
            .trimEnd()
            .replace(/([\\`])/g, '\\$1')
            .replace(/^\\`\\`\\`([\s\S]+)\\`\\`\\`$/g, '```$1```');
    }
    return text;
}

async function sendTelegramRequest(method, token, body = null) {
    const headers = {};
    if (!(body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }
    return fetch(
        `${ENV.TELEGRAM_API_DOMAIN}/bot${token}/${method}`,
        {
            method: 'POST',
            headers,
            body: body && ((body instanceof FormData) ? body : JSON.stringify(body)),
        },
    );
}
async function sendMessage(message, token, context) {
    const body = {
        text: message,
    };
    for (const key of Object.keys(context)) {
        if (context[key] !== undefined && context[key] !== null) {
            body[key] = context[key];
        }
    }
    let method = 'sendMessage';
    if (context?.message_id) {
        method = 'editMessageText';
    }
    return sendTelegramRequest(method, token, body);
}
async function sendMessageToTelegram(message, token, context) {
    const chatContext = context;
    const originMessage = message;
    const limit = 4096;
    if (chatContext.parse_mode === 'MarkdownV2') {
        message = escape(message);
    }
    if (message.length <= limit) {
        const resp = await sendMessage(message, token, chatContext);
        if (resp.status === 200) {
            return resp;
        } else {
            message = originMessage;
            chatContext.parse_mode = null;
            return await sendMessage(message, token, chatContext);
        }
    }
    message = originMessage;
    chatContext.parse_mode = null;
    let lastMessageResponse = null;
    for (let i = 0; i < message.length; i += limit) {
        const msg = message.slice(i, Math.min(i + limit, message.length));
        if (i > 0) {
            chatContext.message_id = null;
        }
        lastMessageResponse = await sendMessage(msg, token, chatContext);
        if (lastMessageResponse.status !== 200) {
            break;
        }
    }
    return lastMessageResponse;
}
async function sendPhotoToTelegram(photo, token, context) {
    if (typeof photo === 'string') {
        const body = {
            photo,
        };
        for (const key of Object.keys(context)) {
            if (context[key] !== undefined && context[key] !== null) {
                body[key] = context[key];
            }
        }
        return sendTelegramRequest('sendPhoto', token, body);
    } else {
        const body = new FormData();
        body.append('photo', photo, 'photo.png');
        for (const key of Object.keys(context)) {
            if (context[key] !== undefined && context[key] !== null) {
                body.append(key, `${context[key]}`);
            }
        }
        return sendTelegramRequest('sendPhoto', token, body);
    }
}
async function sendChatActionToTelegram(action, token, chatId) {
    return sendTelegramRequest('sendChatAction', token, {
        chat_id: chatId,
        action,
    });
}
async function bindTelegramWebHook(token, url) {
    return sendTelegramRequest('setWebhook', token, { url });
}
async function getChatAdministrators(chatId, token) {
    return sendTelegramRequest('getChatAdministrators', token, { chat_id: chatId })
        .then(res => res.json()).catch(() => null);
}
async function getBotName(token) {
    const { result: { username } } = await sendTelegramRequest('getMe', token)
        .then(res => res.json());
    return username;
}
async function getFileLink(fileId, token) {
    try {
        const { result: { file_path } } = await sendTelegramRequest('getFile', token, { file_id: fileId })
            .then(res => res.json());
        return `https://api.telegram.org/file/bot${token}/${file_path}`;
    } catch (e) {
        console.error(e);
    }
    return '';
}
async function setMyCommands(config, token) {
    return sendTelegramRequest('setMyCommands', token, config);
}
function sendMessageToTelegramWithContext(context) {
    return async (message) => {
        return sendMessageToTelegram(message, context.SHARE_CONTEXT.currentBotToken, context.CURRENT_CHAT_CONTEXT);
    };
}
function sendPhotoToTelegramWithContext(context) {
    return (url) => {
        return sendPhotoToTelegram(url, context.SHARE_CONTEXT.currentBotToken, context.CURRENT_CHAT_CONTEXT);
    };
}
function sendChatActionToTelegramWithContext(context) {
    return (action) => {
        return sendChatActionToTelegram(action, context.SHARE_CONTEXT.currentBotToken, context.CURRENT_CHAT_CONTEXT.chat_id);
    };
}

class Stream {
    constructor(response, controller, decoder = null, parser = null) {
        this.response = response;
        this.controller = controller;
        this.decoder = decoder || new SSEDecoder();
        this.parser = parser || openaiSseJsonParser;
    }
    async* iterMessages() {
        if (!this.response.body) {
            this.controller.abort();
            throw new Error('Attempted to iterate over a response with no body');
        }
        const lineDecoder = new LineDecoder();
        const iter = this.response.body;
        for await (const chunk of iter) {
            for (const line of lineDecoder.decode(chunk)) {
                const sse = this.decoder.decode(line);
                if (sse) {
                    yield sse;
                }
            }
        }
        for (const line of lineDecoder.flush()) {
            const sse = this.decoder.decode(line);
            if (sse) {
                yield sse;
            }
        }
    }
    async* [Symbol.asyncIterator]() {
        let done = false;
        try {
            for await (const sse of this.iterMessages()) {
                if (done) {
                    continue;
                }
                if (!sse) {
                    continue;
                }
                const { finish, data } = this.parser(sse);
                if (finish) {
                    done = finish;
                    continue;
                }
                if (data) {
                    yield data;
                }
            }
            done = true;
        } catch (e) {
            if (e instanceof Error && e.name === 'AbortError') {
                return;
            }
            throw e;
        } finally {
            if (!done) {
                this.controller.abort();
            }
        }
    }
}
class SSEDecoder {
    constructor() {
        this.event = null;
        this.data = [];
        this.chunks = [];
    }
    decode(line) {
        if (line.endsWith('\r')) {
            line = line.substring(0, line.length - 1);
        }
        if (!line) {
            if (!this.event && !this.data.length) {
                return null;
            }
            const sse = {
                event: this.event,
                data: this.data.join('\n'),
            };
            this.event = null;
            this.data = [];
            this.chunks = [];
            return sse;
        }
        this.chunks.push(line);
        if (line.startsWith(':')) {
            return null;
        }
        let [fieldName, _, value] = this.partition(line, ':');
        if (value.startsWith(' ')) {
            value = value.substring(1);
        }
        if (fieldName === 'event') {
            this.event = value;
        } else if (fieldName === 'data') {
            this.data.push(value);
        }
        return null;
    }
    partition(str, delimiter) {
        const index = str.indexOf(delimiter);
        if (index !== -1) {
            return [str.substring(0, index), delimiter, str.substring(index + delimiter.length)];
        }
        return [str, '', ''];
    }
}
function openaiSseJsonParser(sse) {
    if (sse.data.startsWith('[DONE]')) {
        return { finish: true };
    }
    if (sse.event === null) {
        try {
            return { data: JSON.parse(sse.data) };
        } catch (e) {
            console.error(e, sse);
        }
    }
    return {};
}
function cohereSseJsonParser(sse) {
    switch (sse.event) {
        case 'text-generation':
            try {
                return { data: JSON.parse(sse.data) };
            } catch (e) {
                console.error(e, sse.data);
                return {};
            }
        case 'stream-start':
            return {};
        case 'stream-end':
            return { finish: true };
        default:
            return {};
    }
}
function anthropicSseJsonParser(sse) {
    switch (sse.event) {
        case 'content_block_delta':
            try {
                return { data: JSON.parse(sse.data) };
            } catch (e) {
                console.error(e, sse.data);
                return {};
            }
        case 'message_start':
        case 'content_block_start':
        case 'content_block_stop':
            return {};
        case 'message_stop':
            return { finish: true };
        default:
            return {};
    }
}
class LineDecoder {
    constructor() {
        this.buffer = [];
        this.trailingCR = false;
    }
    decode(chunk) {
        let text = this.decodeText(chunk);
        if (this.trailingCR) {
            text = `\r${text}`;
            this.trailingCR = false;
        }
        if (text.endsWith('\r')) {
            this.trailingCR = true;
            text = text.slice(0, -1);
        }
        if (!text) {
            return [];
        }
        const trailingNewline = LineDecoder.NEWLINE_CHARS.has(text[text.length - 1] || '');
        let lines = text.split(LineDecoder.NEWLINE_REGEXP);
        if (lines.length === 1 && !trailingNewline) {
            this.buffer.push(lines[0]);
            return [];
        }
        if (this.buffer.length > 0) {
            lines = [this.buffer.join('') + lines[0], ...lines.slice(1)];
            this.buffer = [];
        }
        if (!trailingNewline) {
            this.buffer = [lines.pop() || ''];
        }
        return lines;
    }
    decodeText(bytes) {
        if (bytes == null) {
            return '';
        }
        if (typeof bytes === 'string') {
            return bytes;
        }
        if (typeof Buffer !== 'undefined') {
            if (bytes instanceof Buffer) {
                return bytes.toString();
            }
            if (bytes instanceof Uint8Array) {
                return Buffer.from(bytes).toString();
            }
            throw new Error(`Unexpected: received non-Uint8Array (${bytes.constructor.name}) stream chunk in an environment with a global "Buffer" defined, which this library assumes to be Node. Please report this error.`);
        }
        if (typeof TextDecoder !== 'undefined') {
            if (bytes instanceof Uint8Array || bytes instanceof ArrayBuffer) {
                if (!this.textDecoder) {
                    this.textDecoder = new TextDecoder('utf8');
                }
                return this.textDecoder.decode(bytes, { stream: true });
            }
            throw new Error(`Unexpected: received non-Uint8Array/ArrayBuffer (${bytes.constructor.name}) in a web platform. Please report this error.`);
        }
        throw new Error('Unexpected: neither Buffer nor TextDecoder are available as globals. Please report this error.');
    }
    flush() {
        if (!this.buffer.length && !this.trailingCR) {
            return [];
        }
        const lines = [this.buffer.join('')];
        this.buffer = [];
        this.trailingCR = false;
        return lines;
    }
}
LineDecoder.NEWLINE_CHARS = new Set(['\n', '\r']);
LineDecoder.NEWLINE_REGEXP = /\r\n|[\n\r]/g;

function fixOpenAICompatibleOptions(options) {
    options = options || {};
    options.streamBuilder = options.streamBuilder || function (r, c) {
        return new Stream(r, c);
    };
    options.contentExtractor = options.contentExtractor || function (d) {
        return d?.choices?.[0]?.delta?.content;
    };
    options.fullContentExtractor = options.fullContentExtractor || function (d) {
        return d.choices?.[0]?.message.content;
    };
    options.errorExtractor = options.errorExtractor || function (d) {
        return d.error?.message;
    };
    return options;
}
function isJsonResponse(resp) {
    return resp.headers.get('content-type').includes('json');
}
function isEventStreamResponse(resp) {
    const types = ['application/stream+json', 'text/event-stream'];
    const content = resp.headers.get('content-type');
    for (const type of types) {
        if (content.includes(type)) {
            return true;
        }
    }
    return false;
}
async function requestChatCompletions(url, header, body, context, onStream, onResult = null, options = null) {
    const controller = new AbortController();
    const { signal } = controller;
    let timeoutID = null;
    let lastUpdateTime = Date.now();
    if (ENV.CHAT_COMPLETE_API_TIMEOUT > 0) {
        timeoutID = setTimeout(() => controller.abort(), ENV.CHAT_COMPLETE_API_TIMEOUT);
    }
    const resp = await fetch(url, {
        method: 'POST',
        headers: header,
        body: JSON.stringify(body),
        signal,
    });
    if (timeoutID) {
        clearTimeout(timeoutID);
    }
    options = fixOpenAICompatibleOptions(options);
    if (onStream && resp.ok && isEventStreamResponse(resp)) {
        const stream = options.streamBuilder(resp, controller);
        let contentFull = '';
        let lengthDelta = 0;
        let updateStep = 50;
        try {
            for await (const data of stream) {
                const c = options.contentExtractor(data) || '';
                if (c === '') {
                    continue;
                }
                lengthDelta += c.length;
                contentFull = contentFull + c;
                if (lengthDelta > updateStep) {
                    if (ENV.TELEGRAM_MIN_STREAM_INTERVAL > 0) {
                        const delta = Date.now() - lastUpdateTime;
                        if (delta < ENV.TELEGRAM_MIN_STREAM_INTERVAL) {
                            continue;
                        }
                        lastUpdateTime = Date.now();
                    }
                    lengthDelta = 0;
                    updateStep += 20;
                    await onStream(`${contentFull}\n...`);
                }
            }
        } catch (e) {
            contentFull += `\nERROR: ${e.message}`;
        }
        return contentFull;
    }
    if (!isJsonResponse(resp)) {
        throw new Error(resp.statusText);
    }
    const result = await resp.json();
    if (!result) {
        throw new Error('Empty response');
    }
    if (options.errorExtractor(result)) {
        throw new Error(options.errorExtractor(result));
    }
    try {
        await onResult?.(result);
        return options.fullContentExtractor(result);
    } catch (e) {
        console.error(e);
        throw new Error(JSON.stringify(result));
    }
}

function openAIKeyFromContext(context) {
    const length = context.USER_CONFIG.OPENAI_API_KEY.length;
    return context.USER_CONFIG.OPENAI_API_KEY[Math.floor(Math.random() * length)];
}
function isOpenAIEnable(context) {
    return context.USER_CONFIG.OPENAI_API_KEY.length > 0;
}
async function renderOpenAIMessage(item) {
    const res = {
        role: item.role,
        content: item.content,
    };
    if (item.images && item.images.length > 0) {
        res.content = [];
        if (item.content) {
            res.content.push({ type: 'text', text: item.content });
        }
        for (const image of item.images) {
            switch (ENV.TELEGRAM_IMAGE_TRANSFER_MODE) {
                case 'base64':
                    res.content.push({ type: 'image_url', image_url: {
                        url: renderBase64DataURI(await imageToBase64String(image)),
                    } });
                    break;
                case 'url':
                default:
                    res.content.push({ type: 'image_url', image_url: { url: image } });
                    break;
            }
        }
    }
    return res;
}
async function requestCompletionsFromOpenAI(params, context, onStream) {
    const { message, images, prompt, history } = params;
    const url = `${context.USER_CONFIG.OPENAI_API_BASE}/chat/completions`;
    const header = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIKeyFromContext(context)}`,
    };
    const messages = [...(history || []), { role: 'user', content: message, images }];
    if (prompt) {
        messages.unshift({ role: context.USER_CONFIG.SYSTEM_INIT_MESSAGE_ROLE, content: prompt });
    }
    const body = {
        model: context.USER_CONFIG.OPENAI_CHAT_MODEL,
        ...context.USER_CONFIG.OPENAI_API_EXTRA_PARAMS,
        messages: await Promise.all(messages.map(renderOpenAIMessage)),
        stream: onStream != null,
    };
    return requestChatCompletions(url, header, body, context, onStream);
}
async function requestImageFromOpenAI(prompt, context) {
    const url = `${context.USER_CONFIG.OPENAI_API_BASE}/images/generations`;
    const header = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIKeyFromContext(context)}`,
    };
    const body = {
        prompt,
        n: 1,
        size: context.USER_CONFIG.DALL_E_IMAGE_SIZE,
        model: context.USER_CONFIG.DALL_E_MODEL,
    };
    if (body.model === 'dall-e-3') {
        body.quality = context.USER_CONFIG.DALL_E_IMAGE_QUALITY;
        body.style = context.USER_CONFIG.DALL_E_IMAGE_STYLE;
    }
    const resp = await fetch(url, {
        method: 'POST',
        headers: header,
        body: JSON.stringify(body),
    }).then(res => res.json());
    if (resp.error?.message) {
        throw new Error(resp.error.message);
    }
    return resp?.data?.[0]?.url;
}

async function run(model, body, id, token) {
    return await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${id}/ai/run/${model}`,
        {
            headers: { Authorization: `Bearer ${token}` },
            method: 'POST',
            body: JSON.stringify(body),
        },
    );
}
function isWorkersAIEnable(context) {
    return !!(context.USER_CONFIG.CLOUDFLARE_ACCOUNT_ID && context.USER_CONFIG.CLOUDFLARE_TOKEN);
}
function renderWorkerAIMessage(item) {
    return {
        role: item.role,
        content: item.content,
    };
}
async function requestCompletionsFromWorkersAI(params, context, onStream) {
    const { message, prompt, history } = params;
    const id = context.USER_CONFIG.CLOUDFLARE_ACCOUNT_ID;
    const token = context.USER_CONFIG.CLOUDFLARE_TOKEN;
    const model = context.USER_CONFIG.WORKERS_CHAT_MODEL;
    const url = `https://api.cloudflare.com/client/v4/accounts/${id}/ai/run/${model}`;
    const header = {
        Authorization: `Bearer ${token}`,
    };
    const messages = [...(history || []), { role: 'user', content: message }];
    if (prompt) {
        messages.unshift({ role: context.USER_CONFIG.SYSTEM_INIT_MESSAGE_ROLE, content: prompt });
    }
    const body = {
        messages: messages.map(renderWorkerAIMessage),
        stream: onStream !== null,
    };
    const options = {};
    options.contentExtractor = function (data) {
        return data?.response;
    };
    options.fullContentExtractor = function (data) {
        return data?.result?.response;
    };
    options.errorExtractor = function (data) {
        return data?.errors?.[0]?.message;
    };
    return requestChatCompletions(url, header, body, context, onStream, null, options);
}
async function requestImageFromWorkersAI(prompt, context) {
    const id = context.USER_CONFIG.CLOUDFLARE_ACCOUNT_ID;
    const token = context.USER_CONFIG.CLOUDFLARE_TOKEN;
    const raw = await run(context.USER_CONFIG.WORKERS_IMAGE_MODEL, { prompt }, id, token);
    return await raw.blob();
}

function isGeminiAIEnable(context) {
    return !!(context.USER_CONFIG.GOOGLE_API_KEY);
}
const GEMINI_ROLE_MAP = {
    assistant: 'model',
    system: 'user',
    user: 'user',
};
function renderGeminiMessage(item) {
    return {
        role: GEMINI_ROLE_MAP[item.role],
        parts: [
            {
                text: item.content || '',
            },
        ],
    };
}
async function requestCompletionsFromGeminiAI(params, context, onStream) {
    const { message, prompt, history } = params;
    onStream = null;
    const url = `${context.USER_CONFIG.GOOGLE_COMPLETIONS_API}${context.USER_CONFIG.GOOGLE_COMPLETIONS_MODEL}:${
        onStream ? 'streamGenerateContent' : 'generateContent'
    }?key=${context.USER_CONFIG.GOOGLE_API_KEY}`;
    const contentsTemp = [...history || [], { role: 'user', content: message }];
    if (prompt) {
        contentsTemp.unshift({ role: 'assistant', content: prompt });
    }
    const contents = [];
    for (const msg of contentsTemp) {
        msg.role = GEMINI_ROLE_MAP[msg.role];
        if (contents.length === 0 || contents[contents.length - 1].role !== msg.role) {
            contents.push(renderGeminiMessage(msg));
        } else {
            contents[contents.length - 1].parts[0].text += msg.content;
        }
    }
    const resp = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contents }),
    });
    const data = await resp.json();
    try {
        return data.candidates[0].content.parts[0].text;
    } catch (e) {
        console.error(e);
        if (!data) {
            throw new Error('Empty response');
        }
        throw new Error(data?.error?.message || JSON.stringify(data));
    }
}

function isMistralAIEnable(context) {
    return !!(context.USER_CONFIG.MISTRAL_API_KEY);
}
function renderMistralMessage(item) {
    return {
        role: item.role,
        content: item.content,
    };
}
async function requestCompletionsFromMistralAI(params, context, onStream) {
    const { message, prompt, history } = params;
    const url = `${context.USER_CONFIG.MISTRAL_API_BASE}/chat/completions`;
    const header = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${context.USER_CONFIG.MISTRAL_API_KEY}`,
    };
    const messages = [...(history || []), { role: 'user', content: message }];
    if (prompt) {
        messages.unshift({ role: context.USER_CONFIG.SYSTEM_INIT_MESSAGE_ROLE, content: prompt });
    }
    const body = {
        model: context.USER_CONFIG.MISTRAL_CHAT_MODEL,
        messages: messages.map(renderMistralMessage),
        stream: onStream != null,
    };
    return requestChatCompletions(url, header, body, context, onStream);
}

function isCohereAIEnable(context) {
    return !!(context.USER_CONFIG.COHERE_API_KEY);
}
const COHERE_ROLE_MAP = {
    assistant: 'CHATBOT',
    user: 'USER',
};
function renderCohereMessage(item) {
    return {
        role: COHERE_ROLE_MAP[item.role],
        content: item.content,
    };
}
async function requestCompletionsFromCohereAI(params, context, onStream) {
    const { message, prompt, history } = params;
    const url = `${context.USER_CONFIG.COHERE_API_BASE}/chat`;
    const header = {
        'Authorization': `Bearer ${context.USER_CONFIG.COHERE_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': onStream !== null ? 'text/event-stream' : 'application/json',
    };
    const body = {
        message,
        model: context.USER_CONFIG.COHERE_CHAT_MODEL,
        stream: onStream != null,
        preamble: prompt,
        chat_history: history.map(renderCohereMessage),
    };
    if (!body.preamble) {
        delete body.preamble;
    }
    const options = {};
    options.streamBuilder = function (r, c) {
        return new Stream(r, c, null, cohereSseJsonParser);
    };
    options.contentExtractor = function (data) {
        return data?.text;
    };
    options.fullContentExtractor = function (data) {
        return data?.text;
    };
    options.errorExtractor = function (data) {
        return data?.message;
    };
    return requestChatCompletions(url, header, body, context, onStream, null, options);
}

function isAnthropicAIEnable(context) {
    return !!(context.USER_CONFIG.ANTHROPIC_API_KEY);
}
async function renderAnthropicMessage(item) {
    const res = {
        role: item.role,
        content: item.content,
    };
    if (item.images && item.images.length > 0) {
        res.content = [];
        if (item.content) {
            res.content.push({ type: 'text', text: item.content });
        }
        for (const image of item.images) {
            res.content.push(await imageToBase64String(image).then(({ format, data }) => {
                return { type: 'image', source: { type: 'base64', media_type: format, data } };
            }));
        }
    }
    return res;
}
async function requestCompletionsFromAnthropicAI(params, context, onStream) {
    const { message, images, prompt, history } = params;
    const url = `${context.USER_CONFIG.ANTHROPIC_API_BASE}/messages`;
    const header = {
        'x-api-key': context.USER_CONFIG.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
    };
    const messages = ([...(history || []), { role: 'user', content: message, images }]);
    if (messages.length > 0 && messages[0].role === 'assistant') {
        messages.shift();
    }
    const body = {
        system: prompt,
        model: context.USER_CONFIG.ANTHROPIC_CHAT_MODEL,
        messages: await Promise.all(messages.map(renderAnthropicMessage)),
        stream: onStream != null,
        max_tokens: ENV.MAX_TOKEN_LENGTH > 0 ? ENV.MAX_TOKEN_LENGTH : 2048,
    };
    if (!body.system) {
        delete body.system;
    }
    const options = {};
    options.streamBuilder = function (r, c) {
        return new Stream(r, c, null, anthropicSseJsonParser);
    };
    options.contentExtractor = function (data) {
        return data?.delta?.text;
    };
    options.fullContentExtractor = function (data) {
        return data?.content?.[0].text;
    };
    options.errorExtractor = function (data) {
        return data?.error?.message;
    };
    return requestChatCompletions(url, header, body, context, onStream, null, options);
}

function azureKeyFromContext(context) {
    return context.USER_CONFIG.AZURE_API_KEY;
}
function isAzureEnable(context) {
    return !!(context.USER_CONFIG.AZURE_API_KEY && context.USER_CONFIG.AZURE_COMPLETIONS_API);
}
function isAzureImageEnable(context) {
    return !!(context.USER_CONFIG.AZURE_API_KEY && context.USER_CONFIG.AZURE_DALLE_API);
}
async function requestCompletionsFromAzureOpenAI(params, context, onStream) {
    const { message, images, prompt, history } = params;
    const url = context.USER_CONFIG.AZURE_COMPLETIONS_API;
    const header = {
        'Content-Type': 'application/json',
        'api-key': azureKeyFromContext(context),
    };
    const messages = [...(history || []), { role: 'user', content: message, images }];
    if (prompt) {
        messages.unshift({ role: context.USER_CONFIG.SYSTEM_INIT_MESSAGE_ROLE, content: prompt });
    }
    const body = {
        ...context.USER_CONFIG.OPENAI_API_EXTRA_PARAMS,
        messages: await Promise.all(messages.map(renderOpenAIMessage)),
        stream: onStream != null,
    };
    return requestChatCompletions(url, header, body, context, onStream);
}
async function requestImageFromAzureOpenAI(prompt, context) {
    const url = context.USER_CONFIG.AZURE_DALLE_API;
    const header = {
        'Content-Type': 'application/json',
        'api-key': azureKeyFromContext(context),
    };
    const body = {
        prompt,
        n: 1,
        size: context.USER_CONFIG.DALL_E_IMAGE_SIZE,
        style: context.USER_CONFIG.DALL_E_IMAGE_STYLE,
        quality: context.USER_CONFIG.DALL_E_IMAGE_QUALITY,
    };
    const validSize = ['1792x1024', '1024x1024', '1024x1792'];
    if (!validSize.includes(body.size)) {
        body.size = '1024x1024';
    }
    const resp = await fetch(url, {
        method: 'POST',
        headers: header,
        body: JSON.stringify(body),
    }).then(res => res.json());
    if (resp.error?.message) {
        throw new Error(resp.error.message);
    }
    return resp?.data?.[0]?.url;
}

const chatLlmAgents = [
    {
        name: 'azure',
        enable: isAzureEnable,
        request: requestCompletionsFromAzureOpenAI,
    },
    {
        name: 'openai',
        enable: isOpenAIEnable,
        request: requestCompletionsFromOpenAI,
    },
    {
        name: 'workers',
        enable: isWorkersAIEnable,
        request: requestCompletionsFromWorkersAI,
    },
    {
        name: 'gemini',
        enable: isGeminiAIEnable,
        request: requestCompletionsFromGeminiAI,
    },
    {
        name: 'mistral',
        enable: isMistralAIEnable,
        request: requestCompletionsFromMistralAI,
    },
    {
        name: 'cohere',
        enable: isCohereAIEnable,
        request: requestCompletionsFromCohereAI,
    },
    {
        name: 'anthropic',
        enable: isAnthropicAIEnable,
        request: requestCompletionsFromAnthropicAI,
    },
];
function currentChatModel(agentName, context) {
    switch (agentName) {
        case 'azure':
            try {
                const url = new URL(context.USER_CONFIG.AZURE_COMPLETIONS_API);
                return url.pathname.split('/')[3];
            } catch {
                return context.USER_CONFIG.AZURE_COMPLETIONS_API;
            }
        case 'openai':
            return context.USER_CONFIG.OPENAI_CHAT_MODEL;
        case 'workers':
            return context.USER_CONFIG.WORKERS_CHAT_MODEL;
        case 'gemini':
            return context.USER_CONFIG.GOOGLE_COMPLETIONS_MODEL;
        case 'mistral':
            return context.USER_CONFIG.MISTRAL_CHAT_MODEL;
        case 'cohere':
            return context.USER_CONFIG.COHERE_CHAT_MODEL;
        case 'anthropic':
            return context.USER_CONFIG.ANTHROPIC_CHAT_MODEL;
        default:
            return null;
    }
}
function chatModelKey(agentName) {
    switch (agentName) {
        case 'azure':
            return 'AZURE_COMPLETIONS_API';
        case 'openai':
            return 'OPENAI_CHAT_MODEL';
        case 'workers':
            return 'WORKERS_CHAT_MODEL';
        case 'gemini':
            return 'GOOGLE_COMPLETIONS_MODEL';
        case 'mistral':
            return 'MISTRAL_CHAT_MODEL';
        case 'cohere':
            return 'COHERE_CHAT_MODEL';
        case 'anthropic':
            return 'ANTHROPIC_CHAT_MODEL';
        default:
            return null;
    }
}
function loadChatLLM(context) {
    for (const llm of chatLlmAgents) {
        if (llm.name === context.USER_CONFIG.AI_PROVIDER) {
            return llm;
        }
    }
    for (const llm of chatLlmAgents) {
        if (llm.enable(context)) {
            return llm;
        }
    }
    return null;
}
const imageGenAgents = [
    {
        name: 'azure',
        enable: isAzureImageEnable,
        request: requestImageFromAzureOpenAI,
    },
    {
        name: 'openai',
        enable: isOpenAIEnable,
        request: requestImageFromOpenAI,
    },
    {
        name: 'workers',
        enable: isWorkersAIEnable,
        request: requestImageFromWorkersAI,
    },
];
function loadImageGen(context) {
    for (const imgGen of imageGenAgents) {
        if (imgGen.name === context.USER_CONFIG.AI_IMAGE_PROVIDER) {
            return imgGen;
        }
    }
    for (const imgGen of imageGenAgents) {
        if (imgGen.enable(context)) {
            return imgGen;
        }
    }
    return null;
}
function currentImageModel(agentName, context) {
    switch (agentName) {
        case 'azure':
            try {
                const url = new URL(context.USER_CONFIG.AZURE_DALLE_API);
                return url.pathname.split('/')[3];
            } catch {
                return context.USER_CONFIG.AZURE_DALLE_API;
            }
        case 'openai':
            return context.USER_CONFIG.DALL_E_MODEL;
        case 'workers':
            return context.USER_CONFIG.WORKERS_IMAGE_MODEL;
        default:
            return null;
    }
}
function imageModelKey(agentName) {
    switch (agentName) {
        case 'azure':
            return 'AZURE_DALLE_API';
        case 'openai':
            return 'DALL_E_MODEL';
        case 'workers':
            return 'WORKERS_IMAGE_MODEL';
        default:
            return null;
    }
}

const TemplateInputTypeJson = 'json';
const TemplateInputTypeSpaceSeparated = 'space-separated';
const TemplateInputTypeCommaSeparated = 'comma-separated';
const TemplateBodyTypeJson = 'json';
const TemplateBodyTypeForm = 'form';
const TemplateResponseTypeJson = 'json';
const TemplateResponseTypeText = 'text';
const TemplateOutputTypeText = 'text';
const TemplateOutputTypeImage = 'image';
const TemplateOutputTypeHTML = 'html';
const TemplateOutputTypeMarkdown = 'markdown';

const INTERPOLATE_LOOP_REGEXP = /\{\{#each\s+(\w+)\s+in\s+([\w.[\]]+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
const INTERPOLATE_CONDITION_REGEXP = /\{\{#if\s+([\w.[\]]+)\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/if\}\}/g;
const INTERPOLATE_VARIABLE_REGEXP = /\{\{([\w.[\]]+)\}\}/g;
function interpolate(template, data, formatter = null) {
    const evaluateExpression = (expr, localData) => {
        if (expr === '.')
            return localData['.'] ?? localData;
        try {
            return expr.split('.').reduce((value, key) => {
                if (key.includes('[') && key.includes(']')) {
                    const [arrayKey, indexStr] = key.split('[');
                    const index = Number.parseInt(indexStr, 10);
                    return value?.[arrayKey]?.[index];
                }
                return value?.[key];
            }, localData);
        } catch (error) {
            console.error(`Error evaluating expression: ${expr}`, error);
            return undefined;
        }
    };
    const processConditional = (condition, trueBlock, falseBlock, localData) => {
        const result = evaluateExpression(condition, localData);
        return result ? trueBlock : (falseBlock || '');
    };
    const processLoop = (itemName, arrayExpr, loopContent, localData) => {
        const array = evaluateExpression(arrayExpr, localData);
        if (!Array.isArray(array)) {
            console.warn(`Expression "${arrayExpr}" did not evaluate to an array`);
            return '';
        }
        return array.map((item) => {
            const itemData = { ...localData, [itemName]: item, '.': item };
            return interpolate(loopContent, itemData);
        }).join('');
    };
    const processTemplate = (tmpl, localData) => {
        tmpl = tmpl.replace(INTERPOLATE_LOOP_REGEXP, (_, itemName, arrayExpr, loopContent) =>
            processLoop(itemName, arrayExpr, loopContent, localData));
        tmpl = tmpl.replace(INTERPOLATE_CONDITION_REGEXP, (_, condition, trueBlock, falseBlock) =>
            processConditional(condition, trueBlock, falseBlock, localData));
        return tmpl.replace(INTERPOLATE_VARIABLE_REGEXP, (_, expr) => {
            const value = evaluateExpression(expr, localData);
            if (value === undefined) {
                return `{{${expr}}}`;
            }
            if (formatter) {
                return formatter(value);
            }
            return String(value);
        });
    };
    return processTemplate(template, data);
}
function interpolateObject(obj, data) {
    if (obj === null || obj === undefined) {
        return null;
    }
    if (typeof obj === 'string') {
        return interpolate(obj, data);
    }
    if (Array.isArray(obj)) {
        return obj.map(item => interpolateObject(item, data));
    }
    if (typeof obj === 'object') {
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            result[key] = interpolateObject(value, data);
        }
        return result;
    }
    return obj;
}
async function executeRequest(template, data) {
    const url = new URL(interpolate(template.url, data, encodeURIComponent));
    if (template.query) {
        for (const [key, value] of Object.entries(template.query)) {
            url.searchParams.append(key, interpolate(value, data));
        }
    }
    const method = template.method;
    const headers = Object.fromEntries(
        Object.entries(template.headers).map(([key, value]) => {
            return [key, interpolate(value, data)];
        }),
    );
    for (const key of Object.keys(headers)) {
        if (headers[key] === null) {
            delete headers[key];
        }
    }
    let body = null;
    if (template.body) {
        if (template.body.type === TemplateBodyTypeJson) {
            body = JSON.stringify(interpolateObject(template.body.content, data));
        } else if (template.body.type === TemplateBodyTypeForm) {
            body = new URLSearchParams();
            for (const [key, value] of Object.entries(template.body.content)) {
                body.append(key, interpolate(value, data));
            }
        } else {
            body = interpolate(template.body.content, data);
        }
    }
    const response = await fetch(url, {
        method,
        headers,
        body,
    });
    const renderOutput = async (type, temple, response) => {
        switch (type) {
            case TemplateResponseTypeText:
                return interpolate(temple, await response.text());
            case TemplateResponseTypeJson:
            default:
                return interpolate(temple, await response.json());
        }
    };
    if (!response.ok) {
        const content = await renderOutput(template.response?.error?.input_type, template.response.error?.output, response);
        return {
            type: template.response.error.output_type,
            content,
        };
    }
    const content = await renderOutput(template.response.content?.input_type, template.response.content?.output, response);
    return {
        type: template.response.content.output_type,
        content,
    };
}
function formatInput(input, type) {
    if (type === TemplateInputTypeJson) {
        return JSON.parse(input);
    } else if (type === TemplateInputTypeSpaceSeparated) {
        return input.split(/\s+/);
    } else if (type === TemplateInputTypeCommaSeparated) {
        return input.split(/\s*,\s*/);
    } else {
        return input;
    }
}

function tokensCounter() {
    return (text) => {
        return text.length;
    };
}
async function loadHistory(key) {
    let history = [];
    try {
        history = JSON.parse(await DATABASE.get(key));
    } catch (e) {
        console.error(e);
    }
    if (!history || !Array.isArray(history)) {
        history = [];
    }
    const counter = tokensCounter();
    const trimHistory = (list, initLength, maxLength, maxToken) => {
        if (maxLength >= 0 && list.length > maxLength) {
            list = list.splice(list.length - maxLength);
        }
        if (maxToken > 0) {
            let tokenLength = initLength;
            for (let i = list.length - 1; i >= 0; i--) {
                const historyItem = list[i];
                let length = 0;
                if (historyItem.content) {
                    length = counter(historyItem.content);
                } else {
                    historyItem.content = '';
                }
                tokenLength += length;
                if (tokenLength > maxToken) {
                    list = list.splice(i + 1);
                    break;
                }
            }
        }
        return list;
    };
    if (ENV.AUTO_TRIM_HISTORY && ENV.MAX_HISTORY_LENGTH > 0) {
        history = trimHistory(history, 0, ENV.MAX_HISTORY_LENGTH, ENV.MAX_TOKEN_LENGTH);
    }
    return history;
}
async function requestCompletionsFromLLM(params, context, llm, modifier, onStream) {
    const historyDisable = ENV.AUTO_TRIM_HISTORY && ENV.MAX_HISTORY_LENGTH <= 0;
    const historyKey = context.SHARE_CONTEXT.chatHistoryKey;
    let history = await loadHistory(historyKey);
    if (modifier) {
        const modifierData = modifier(history, params.message);
        history = modifierData.history;
        params.message = modifierData.message;
    }
    const llmParams = {
        ...params,
        history,
        prompt: context.USER_CONFIG.SYSTEM_INIT_MESSAGE,
    };
    const answer = await llm(llmParams, context, onStream);
    if (!historyDisable) {
        const userMessage = { role: 'user', content: params.message || '', images: params.images };
        if (ENV.HISTORY_IMAGE_PLACEHOLDER && userMessage.images && userMessage.images.length > 0) {
            delete userMessage.images;
            userMessage.content = `${ENV.HISTORY_IMAGE_PLACEHOLDER}\n${userMessage.content}`;
        }
        history.push(userMessage);
        history.push({ role: 'assistant', content: answer });
        await DATABASE.put(historyKey, JSON.stringify(history)).catch(console.error);
    }
    return answer;
}

async function chatWithLLM(params, context, modifier) {
    try {
        try {
            const msg = await sendMessageToTelegramWithContext(context)('...').then(r => r.json());
            context.CURRENT_CHAT_CONTEXT.message_id = msg.result.message_id;
            context.CURRENT_CHAT_CONTEXT.reply_markup = null;
        } catch (e) {
            console.error(e);
        }
        setTimeout(() => sendChatActionToTelegramWithContext(context)('typing').catch(console.error), 0);
        let onStream = null;
        const parseMode = context.CURRENT_CHAT_CONTEXT.parse_mode;
        let nextEnableTime = null;
        if (ENV.STREAM_MODE) {
            context.CURRENT_CHAT_CONTEXT.parse_mode = null;
            onStream = async (text) => {
                try {
                    if (nextEnableTime && nextEnableTime > Date.now()) {
                        return;
                    }
                    const resp = await sendMessageToTelegramWithContext(context)(text);
                    if (resp.status === 429) {
                        const retryAfter = Number.parseInt(resp.headers.get('Retry-After'));
                        if (retryAfter) {
                            nextEnableTime = Date.now() + retryAfter * 1000;
                            return;
                        }
                    }
                    nextEnableTime = null;
                    if (resp.ok) {
                        context.CURRENT_CHAT_CONTEXT.message_id = (await resp.json()).result.message_id;
                    }
                } catch (e) {
                    console.error(e);
                }
            };
        }
        const llm = loadChatLLM(context)?.request;
        if (llm === null) {
            return sendMessageToTelegramWithContext(context)('LLM is not enable');
        }
        const answer = await requestCompletionsFromLLM(params, context, llm, modifier, onStream);
        context.CURRENT_CHAT_CONTEXT.parse_mode = parseMode;
        if (nextEnableTime && nextEnableTime > Date.now()) {
            await new Promise(resolve => setTimeout(resolve, nextEnableTime - Date.now()));
        }
        return sendMessageToTelegramWithContext(context)(answer);
    } catch (e) {
        let errMsg = `Error: ${e.message}`;
        if (errMsg.length > 2048) {
            errMsg = errMsg.substring(0, 2048);
        }
        context.CURRENT_CHAT_CONTEXT.disable_web_page_preview = true;
        return sendMessageToTelegramWithContext(context)(errMsg);
    }
}

function checkMention(content, entities, botName, botId) {
    let isMention = false;
    for (const entity of entities) {
        const entityStr = content.slice(entity.offset, entity.offset + entity.length);
        switch (entity.type) {
            case 'mention':
                if (entityStr === `@${botName}`) {
                    isMention = true;
                    content = content.slice(0, entity.offset) + content.slice(entity.offset + entity.length);
                }
                break;
            case 'text_mention':
                if (`${entity.user.id}` === `${botId}`) {
                    isMention = true;
                    content = content.slice(0, entity.offset) + content.slice(entity.offset + entity.length);
                }
                break;
            case 'bot_command':
                if (entityStr.endsWith(`@${botName}`)) {
                    isMention = true;
                    const newEntityStr = entityStr.replace(`@${botName}`, '');
                    content = content.slice(0, entity.offset) + newEntityStr + content.slice(entity.offset + entity.length);
                }
                break;
        }
    }
    return {
        isMention,
        content,
    };
}
function findPhotoFileID(photos, offset) {
    let sizeIndex = 0;
    if (offset >= 0) {
        sizeIndex = offset;
    } else if (offset < 0) {
        sizeIndex = photos.length + offset;
    }
    sizeIndex = Math.max(0, Math.min(sizeIndex, photos.length - 1));
    return photos[sizeIndex].file_id;
}async function getChatRoleWithContext(context) {
    const {
        chatId,
        speakerId,
        groupAdminKey,
        currentBotToken: token,
        allMemberAreAdmin,
    } = context.SHARE_CONTEXT;
    if (allMemberAreAdmin) {
        return 'administrator';
    }
    let groupAdmin;
    try {
        groupAdmin = JSON.parse(await DATABASE.get(groupAdminKey));
    } catch (e) {
        console.error(e);
    }
    if (!groupAdmin || !Array.isArray(groupAdmin) || groupAdmin.length === 0) {
        const { result } = await getChatAdministrators(chatId, token);
        if (result == null) {
            return null;
        }
        groupAdmin = result;
        await DATABASE.put(
            groupAdminKey,
            JSON.stringify(groupAdmin),
            { expiration: (Date.now() / 1000) + 120 },
        );
    }
    for (let i = 0; i < groupAdmin.length; i++) {
        const user = groupAdmin[i];
        if (`${user.user.id}` === `${speakerId}`) {
            return user.status;
        }
    }
    return 'member';
}

const commandAuthCheck = {
    default(chatType) {
        if (CONST.GROUP_TYPES.includes(chatType)) {
            return ['administrator', 'creator'];
        }
        return null;
    },
    shareModeGroup(chatType) {
        if (CONST.GROUP_TYPES.includes(chatType)) {
            if (!ENV.GROUP_CHAT_BOT_SHARE_MODE) {
                return false;
            }
            return ['administrator', 'creator'];
        }
        return null;
    },
};
const commandSortList = [
    '/new',
    '/redo',
    '/img',
    '/setenv',
    '/delenv',
    '/version',
    '/system',
    '/help',
];
const commandHandlers = {
    '/help': {
        scopes: ['all_private_chats', 'all_chat_administrators'],
        fn: commandGetHelp,
    },
    '/new': {
        scopes: ['all_private_chats', 'all_group_chats', 'all_chat_administrators'],
        fn: commandCreateNewChatContext,
    },
    '/start': {
        scopes: [],
        fn: commandCreateNewChatContext,
    },
    '/img': {
        scopes: ['all_private_chats', 'all_chat_administrators'],
        fn: commandGenerateImg,
    },
    '/version': {
        scopes: ['all_private_chats', 'all_chat_administrators'],
        fn: commandFetchUpdate,
    },
    '/setenv': {
        scopes: [],
        fn: commandUpdateUserConfig,
        needAuth: commandAuthCheck.shareModeGroup,
    },
    '/setenvs': {
        scopes: [],
        fn: commandUpdateUserConfigs,
        needAuth: commandAuthCheck.shareModeGroup,
    },
    '/delenv': {
        scopes: [],
        fn: commandDeleteUserConfig,
        needAuth: commandAuthCheck.shareModeGroup,
    },
    '/clearenv': {
        scopes: [],
        fn: commandClearUserConfig,
        needAuth: commandAuthCheck.shareModeGroup,
    },
    '/system': {
        scopes: ['all_private_chats', 'all_chat_administrators'],
        fn: commandSystem,
        needAuth: commandAuthCheck.default,
    },
    '/redo': {
        scopes: ['all_private_chats', 'all_group_chats', 'all_chat_administrators'],
        fn: commandRegenerate,
    },
};
async function commandGenerateImg(message, command, subcommand, context) {
    if (subcommand === '') {
        return sendMessageToTelegramWithContext(context)(ENV.I18N.command.help.img);
    }
    try {
        const gen = loadImageGen(context)?.request;
        if (!gen) {
            return sendMessageToTelegramWithContext(context)('ERROR: Image generator not found');
        }
        setTimeout(() => sendChatActionToTelegramWithContext(context)('upload_photo').catch(console.error), 0);
        const img = await gen(subcommand, context);
        const resp = await sendPhotoToTelegramWithContext(context)(img);
        if (!resp.ok) {
            return sendMessageToTelegramWithContext(context)(`ERROR: ${resp.statusText} ${await resp.text()}`);
        }
        return resp;
    } catch (e) {
        return sendMessageToTelegramWithContext(context)(`ERROR: ${e.message}`);
    }
}
async function commandGetHelp(message, command, subcommand, context) {
    let helpMsg = `${ENV.I18N.command.help.summary}\n`;
    helpMsg += Object.keys(commandHandlers)
        .map(key => `${key}：${ENV.I18N.command.help[key.substring(1)]}`)
        .join('\n');
    helpMsg += Object.keys(CUSTOM_COMMAND)
        .filter(key => !!CUSTOM_COMMAND_DESCRIPTION[key])
        .map(key => `${key}：${CUSTOM_COMMAND_DESCRIPTION[key]}`)
        .join('\n');
    helpMsg += Object.keys(PLUGINS_COMMAND)
        .filter(key => !!PLUGINS_COMMAND_DESCRIPTION[key])
        .map(key => `${key}：${PLUGINS_COMMAND_DESCRIPTION[key]}`)
        .join('\n');
    return sendMessageToTelegramWithContext(context)(helpMsg);
}
async function commandCreateNewChatContext(message, command, subcommand, context) {
    try {
        await DATABASE.delete(context.SHARE_CONTEXT.chatHistoryKey);
        const isNewCommand = command.startsWith('/new');
        const text = ENV.I18N.command.new.new_chat_start + (isNewCommand ? '' : `(${context.CURRENT_CHAT_CONTEXT.chat_id})`);
        if (ENV.SHOW_REPLY_BUTTON && !CONST.GROUP_TYPES.includes(context.SHARE_CONTEXT.chatType)) {
            context.CURRENT_CHAT_CONTEXT.reply_markup = {
                keyboard: [[{ text: '/new' }, { text: '/redo' }]],
                selective: true,
                resize_keyboard: true,
                one_time_keyboard: false,
            };
        } else {
            context.CURRENT_CHAT_CONTEXT.reply_markup = {
                remove_keyboard: true,
                selective: true,
            };
        }
        return sendMessageToTelegramWithContext(context)(text);
    } catch (e) {
        return sendMessageToTelegramWithContext(context)(`ERROR: ${e.message}`);
    }
}
async function commandUpdateUserConfig(message, command, subcommand, context) {
    const kv = subcommand.indexOf('=');
    if (kv === -1) {
        return sendMessageToTelegramWithContext(context)(ENV.I18N.command.help.setenv);
    }
    let key = subcommand.slice(0, kv);
    const value = subcommand.slice(kv + 1);
    key = ENV_KEY_MAPPER[key] || key;
    if (ENV.LOCK_USER_CONFIG_KEYS.includes(key)) {
        return sendMessageToTelegramWithContext(context)(`Key ${key} is locked`);
    }
    if (!Object.keys(context.USER_CONFIG).includes(key)) {
        return sendMessageToTelegramWithContext(context)(`Key ${key} not found`);
    }
    try {
        context.USER_CONFIG.DEFINE_KEYS.push(key);
        context.USER_CONFIG.DEFINE_KEYS = Array.from(new Set(context.USER_CONFIG.DEFINE_KEYS));
        mergeEnvironment(context.USER_CONFIG, {
            [key]: value,
        });
        console.log('Update user config: ', key, context.USER_CONFIG[key]);
        await DATABASE.put(
            context.SHARE_CONTEXT.configStoreKey,
            JSON.stringify(trimUserConfig(context.USER_CONFIG)),
        );
        return sendMessageToTelegramWithContext(context)('Update user config success');
    } catch (e) {
        return sendMessageToTelegramWithContext(context)(`ERROR: ${e.message}`);
    }
}
async function commandUpdateUserConfigs(message, command, subcommand, context) {
    try {
        const values = JSON.parse(subcommand);
        const configKeys = Object.keys(context.USER_CONFIG);
        for (const ent of Object.entries(values)) {
            let [key, value] = ent;
            key = ENV_KEY_MAPPER[key] || key;
            if (ENV.LOCK_USER_CONFIG_KEYS.includes(key)) {
                return sendMessageToTelegramWithContext(context)(`Key ${key} is locked`);
            }
            if (!configKeys.includes(key)) {
                return sendMessageToTelegramWithContext(context)(`Key ${key} not found`);
            }
            context.USER_CONFIG.DEFINE_KEYS.push(key);
            mergeEnvironment(context.USER_CONFIG, {
                [key]: value,
            });
            console.log('Update user config: ', key, context.USER_CONFIG[key]);
        }
        context.USER_CONFIG.DEFINE_KEYS = Array.from(new Set(context.USER_CONFIG.DEFINE_KEYS));
        await DATABASE.put(
            context.SHARE_CONTEXT.configStoreKey,
            JSON.stringify(trimUserConfig(trimUserConfig(context.USER_CONFIG))),
        );
        return sendMessageToTelegramWithContext(context)('Update user config success');
    } catch (e) {
        return sendMessageToTelegramWithContext(context)(`ERROR: ${e.message}`);
    }
}
async function commandDeleteUserConfig(message, command, subcommand, context) {
    if (ENV.LOCK_USER_CONFIG_KEYS.includes(subcommand)) {
        const msg = `Key ${subcommand} is locked`;
        return sendMessageToTelegramWithContext(context)(msg);
    }
    try {
        context.USER_CONFIG[subcommand] = null;
        context.USER_CONFIG.DEFINE_KEYS = context.USER_CONFIG.DEFINE_KEYS.filter(key => key !== subcommand);
        await DATABASE.put(
            context.SHARE_CONTEXT.configStoreKey,
            JSON.stringify(trimUserConfig(context.USER_CONFIG)),
        );
        return sendMessageToTelegramWithContext(context)('Delete user config success');
    } catch (e) {
        return sendMessageToTelegramWithContext(context)(`ERROR: ${e.message}`);
    }
}
async function commandClearUserConfig(message, command, subcommand, context) {
    try {
        await DATABASE.put(
            context.SHARE_CONTEXT.configStoreKey,
            JSON.stringify({}),
        );
        return sendMessageToTelegramWithContext(context)('Clear user config success');
    } catch (e) {
        return sendMessageToTelegramWithContext(context)(`ERROR: ${e.message}`);
    }
}
async function commandFetchUpdate(message, command, subcommand, context) {
    const current = {
        ts: ENV.BUILD_TIMESTAMP,
        sha: ENV.BUILD_VERSION,
    };
    try {
        const info = `https://raw.githubusercontent.com/TBXark/ChatGPT-Telegram-Workers/${ENV.UPDATE_BRANCH}/dist/buildinfo.json`;
        const online = await fetch(info).then(r => r.json());
        const timeFormat = (ts) => {
            return new Date(ts * 1000).toLocaleString('en-US', {});
        };
        if (current.ts < online.ts) {
            return sendMessageToTelegramWithContext(context)(`New version detected: ${online.sha}(${timeFormat(online.ts)})\nCurrent version: ${current.sha}(${timeFormat(current.ts)})`);
        } else {
            return sendMessageToTelegramWithContext(context)(`Current version: ${current.sha}(${timeFormat(current.ts)}) is up to date`);
        }
    } catch (e) {
        return sendMessageToTelegramWithContext(context)(`ERROR: ${e.message}`);
    }
}
async function commandSystem(message, command, subcommand, context) {
    const chatAgent = loadChatLLM(context)?.name;
    const imageAgent = loadImageGen(context)?.name;
    const agent = {
        AI_PROVIDER: chatAgent,
        AI_IMAGE_PROVIDER: imageAgent,
    };
    if (chatModelKey(chatAgent)) {
        agent[chatModelKey(chatAgent)] = currentChatModel(chatAgent, context);
    }
    if (imageModelKey(imageAgent)) {
        agent[imageModelKey(imageAgent)] = currentImageModel(imageAgent, context);
    }
    let msg = `AGENT: ${JSON.stringify(agent, null, 2)}\n`;
    if (ENV.DEV_MODE) {
        const shareCtx = { ...context.SHARE_CONTEXT };
        shareCtx.currentBotToken = '******';
        context.USER_CONFIG.OPENAI_API_KEY = ['******'];
        context.USER_CONFIG.AZURE_API_KEY = '******';
        context.USER_CONFIG.AZURE_COMPLETIONS_API = '******';
        context.USER_CONFIG.AZURE_DALLE_API = '******';
        context.USER_CONFIG.CLOUDFLARE_ACCOUNT_ID = '******';
        context.USER_CONFIG.CLOUDFLARE_TOKEN = '******';
        context.USER_CONFIG.GOOGLE_API_KEY = '******';
        context.USER_CONFIG.MISTRAL_API_KEY = '******';
        context.USER_CONFIG.COHERE_API_KEY = '******';
        context.USER_CONFIG.ANTHROPIC_API_KEY = '******';
        const config = trimUserConfig(context.USER_CONFIG);
        msg = `<pre>\n${msg}`;
        msg += `USER_CONFIG: ${JSON.stringify(config, null, 2)}\n`;
        msg += `CHAT_CONTEXT: ${JSON.stringify(context.CURRENT_CHAT_CONTEXT, null, 2)}\n`;
        msg += `SHARE_CONTEXT: ${JSON.stringify(shareCtx, null, 2)}\n`;
        msg += '</pre>';
    }
    context.CURRENT_CHAT_CONTEXT.parse_mode = 'HTML';
    return sendMessageToTelegramWithContext(context)(msg);
}
async function commandRegenerate(message, command, subcommand, context) {
    const mf = (history, text) => {
        let nextText = text;
        if (!(history && Array.isArray(history) && history.length > 0)) {
            throw new Error('History not found');
        }
        const historyCopy = structuredClone(history);
        while (true) {
            const data = historyCopy.pop();
            if (data === undefined || data === null) {
                break;
            } else if (data.role === 'user') {
                if (text === '' || text === undefined || text === null) {
                    nextText = data.content;
                }
                break;
            }
        }
        if (subcommand) {
            nextText = subcommand;
        }
        return { history: historyCopy, message: nextText };
    };
    return chatWithLLM({ message: null }, context, mf);
}
async function commandEcho(message, command, subcommand, context) {
    let msg = '<pre>';
    msg += JSON.stringify({ message }, null, 2);
    msg += '</pre>';
    context.CURRENT_CHAT_CONTEXT.parse_mode = 'HTML';
    return sendMessageToTelegramWithContext(context)(msg);
}
async function handleSystemCommand(message, command, raw, handler, context) {
    try {
        if (handler.needAuth) {
            const roleList = handler.needAuth(context.SHARE_CONTEXT.chatType);
            if (roleList) {
                const chatRole = await getChatRoleWithContext(context);
                if (chatRole === null) {
                    return sendMessageToTelegramWithContext(context)('ERROR: Get chat role failed');
                }
                if (!roleList.includes(chatRole)) {
                    return sendMessageToTelegramWithContext(context)(`ERROR: Permission denied, need ${roleList.join(' or ')}`);
                }
            }
        }
    } catch (e) {
        return sendMessageToTelegramWithContext(context)(`ERROR: ${e.message}`);
    }
    const subcommand = raw.substring(command.length).trim();
    try {
        return await handler.fn(message, command, subcommand, context);
    } catch (e) {
        return sendMessageToTelegramWithContext(context)(`ERROR: ${e.message}`);
    }
}
async function handlePluginCommand(message, command, raw, template, context) {
    try {
        const subcommand = raw.substring(command.length).trim();
        const DATA = formatInput(subcommand, template.input.type);
        const { type, content } = await executeRequest(template, {
            DATA,
            ENV: ENV.PLUGINS_ENV,
        });
        if (type === TemplateOutputTypeImage) {
            return sendPhotoToTelegramWithContext(context)(content);
        }
        switch (type) {
            case TemplateOutputTypeHTML:
                context.CURRENT_CHAT_CONTEXT.parse_mode = 'HTML';
                break;
            case TemplateOutputTypeMarkdown:
                context.CURRENT_CHAT_CONTEXT.parse_mode = 'Markdown';
                break;
            case TemplateOutputTypeText:
            default:
                context.CURRENT_CHAT_CONTEXT.parse_mode = null;
                break;
        }
        return sendMessageToTelegramWithContext(context)(content);
    } catch (e) {
        const help = PLUGINS_COMMAND_DESCRIPTION[command];
        return sendMessageToTelegramWithContext(context)(`ERROR: ${e.message}\n${help}`);
    }
}
function injectCommandHandlerIfNeed() {
    if (ENV.DEV_MODE) {
        commandHandlers['/echo'] = {
            help: '[DEBUG ONLY] echo message',
            scopes: ['all_private_chats', 'all_chat_administrators'],
            fn: commandEcho,
            needAuth: commandAuthCheck.default,
        };
    }
}
async function handleCommandMessage(message, context) {
    injectCommandHandlerIfNeed();
    let text = (message.text || message.caption).trim();
    if (CUSTOM_COMMAND[text]) {
        text = CUSTOM_COMMAND[text];
    }
    for (const key in PLUGINS_COMMAND) {
        if (text === key || text.startsWith(`${key} `)) {
            let template = PLUGINS_COMMAND[key].trim();
            if (template.startsWith('http')) {
                template = await fetch(template).then(r => r.text());
            }
            return await handlePluginCommand(message, key, text, JSON.parse(template), context);
        }
    }
    for (const key in commandHandlers) {
        if (text === key || text.startsWith(`${key} `)) {
            const command = commandHandlers[key];
            return await handleSystemCommand(message, key, text, command, context);
        }
    }
    return null;
}
async function bindCommandForTelegram(token) {
    const scopeCommandMap = {
        all_private_chats: [],
        all_group_chats: [],
        all_chat_administrators: [],
    };
    for (const key of commandSortList) {
        if (ENV.HIDE_COMMAND_BUTTONS.includes(key)) {
            continue;
        }
        if (Object.prototype.hasOwnProperty.call(commandHandlers, key) && commandHandlers[key].scopes) {
            for (const scope of commandHandlers[key].scopes) {
                if (!scopeCommandMap[scope]) {
                    scopeCommandMap[scope] = [];
                }
                scopeCommandMap[scope].push(key);
            }
        }
    }
    const result = {};
    for (const scope in scopeCommandMap) {
        const body = {
            commands: scopeCommandMap[scope].map(command => ({
                command,
                description: ENV.I18N.command.help[command.substring(1)] || '',
            })),
            scope: {
                type: scope,
            },
        };
        result[scope] = await setMyCommands(body, token).then(res => res.json());
    }
    return {
        ok: true,
        result,
    };
}
function commandsDocument() {
    return Object.keys(commandHandlers).map((key) => {
        return {
            command: key,
            description: ENV.I18N.command.help[key.substring(1)],
        };
    });
}

async function msgInitChatContext(message, context) {
    await context.initContext(message);
    return null;
}
async function msgSaveLastMessage(message, context) {
    if (ENV.DEBUG_MODE) {
        const lastMessageKey = `last_message:${context.SHARE_CONTEXT.chatHistoryKey}`;
        await DATABASE.put(lastMessageKey, JSON.stringify(message), { expirationTtl: 3600 });
    }
    return null;
}
async function msgIgnoreOldMessage(message, context) {
    if (ENV.SAFE_MODE) {
        let idList = [];
        try {
            idList = JSON.parse(await DATABASE.get(context.SHARE_CONTEXT.chatLastMessageIdKey).catch(() => '[]')) || [];
        } catch (e) {
            console.error(e);
        }
        if (idList.includes(message.message_id)) {
            throw new Error('Ignore old message');
        } else {
            idList.push(message.message_id);
            if (idList.length > 100) {
                idList.shift();
            }
            await DATABASE.put(context.SHARE_CONTEXT.chatLastMessageIdKey, JSON.stringify(idList));
        }
    }
    return null;
}
async function msgCheckEnvIsReady(message, context) {
    if (!DATABASE) {
        return sendMessageToTelegramWithContext(context)('DATABASE Not Set');
    }
    return null;
}
async function msgFilterWhiteList(message, context) {
    if (ENV.I_AM_A_GENEROUS_PERSON) {
        return null;
    }
    if (context.SHARE_CONTEXT.chatType === 'private') {
        if (!ENV.CHAT_WHITE_LIST.includes(`${context.CURRENT_CHAT_CONTEXT.chat_id}`)) {
            return sendMessageToTelegramWithContext(context)(
                `You are not in the white list, please contact the administrator to add you to the white list. Your chat_id: ${context.CURRENT_CHAT_CONTEXT.chat_id}`,
            );
        }
        return null;
    }
    if (CONST.GROUP_TYPES.includes(context.SHARE_CONTEXT.chatType)) {
        if (!ENV.GROUP_CHAT_BOT_ENABLE) {
            throw new Error('Not support');
        }
        if (!ENV.CHAT_GROUP_WHITE_LIST.includes(`${context.CURRENT_CHAT_CONTEXT.chat_id}`)) {
            return sendMessageToTelegramWithContext(context)(
                `Your group are not in the white list, please contact the administrator to add you to the white list. Your chat_id: ${context.CURRENT_CHAT_CONTEXT.chat_id}`,
            );
        }
        return null;
    }
    return sendMessageToTelegramWithContext(context)(
        `Not support chat type: ${context.SHARE_CONTEXT.chatType}`,
    );
}
async function msgFilterUnsupportedMessage(message, context) {
    if (message.text) {
        return null;
    }
    if (message.caption) {
        return null;
    }
    if (message.photo) {
        return null;
    }
    throw new Error('Not supported message type');
}
async function msgHandleGroupMessage(message, context) {
    if (!CONST.GROUP_TYPES.includes(context.SHARE_CONTEXT.chatType)) {
        return null;
    }
    if (message.reply_to_message) {
        if (`${message.reply_to_message.from.id}` === context.SHARE_CONTEXT.currentBotId) {
            return null;
        } else if (ENV.EXTRA_MESSAGE_CONTEXT) {
            context.SHARE_CONTEXT.extraMessageContext = message.reply_to_message;
        }
    }
    let botName = context.SHARE_CONTEXT.currentBotName;
    if (!botName) {
        botName = await getBotName(context.SHARE_CONTEXT.currentBotToken);
        context.SHARE_CONTEXT.currentBotName = botName;
    }
    if (!botName) {
        throw new Error('Not set bot name');
    }
    let isMention = false;
    if (message.text && message.entities) {
        const res = checkMention(message.text, message.entities, botName, context.SHARE_CONTEXT.currentBotId);
        isMention = res.isMention;
        message.text = res.content.trim();
    }
    if (message.caption && message.caption_entities) {
        const res = checkMention(message.caption, message.caption_entities, botName, context.SHARE_CONTEXT.currentBotId);
        isMention = res.isMention || isMention;
        message.caption = res.content.trim();
    }
    if (!isMention) {
        throw new Error('Not mention');
    }
    return null;
}
async function msgHandleCommand(message, context) {
    if (!message.text) {
        return null;
    }
    return await handleCommandMessage(message, context);
}
async function msgChatWithLLM(message, context) {
    const params = {
        message: message.text || message.caption || '',
    };
    if (ENV.EXTRA_MESSAGE_CONTEXT && context.SHARE_CONTEXT.extraMessageContext) {
        const extra = context.SHARE_CONTEXT.extraMessageContext.text || context.SHARE_CONTEXT.extraMessageContext.caption || '';
        if (extra) {
            params.message = `${extra}\n${params.message}`;
        }
    }
    if (message.photo && message.photo.length > 0) {
        const id = findPhotoFileID(message.photo, ENV.TELEGRAM_PHOTO_SIZE_OFFSET);
        let url = await getFileLink(id, context.SHARE_CONTEXT.currentBotToken);
        if (ENV.TELEGRAPH_ENABLE) {
            url = await uploadImageToTelegraph(url);
        }
        params.images = [url];
    }
    return chatWithLLM(params, context, null);
}
function loadMessage(body) {
    if (body?.edited_message) {
        throw new Error('Ignore edited message');
    }
    if (body?.message) {
        return body?.message;
    } else {
        throw new Error('Invalid message');
    }
}
async function handleMessage(token, body) {
    const context = new Context();
    context.initTelegramContext(token);
    const message = loadMessage(body);
    const handlers = [
        msgInitChatContext,
        msgCheckEnvIsReady,
        msgFilterWhiteList,
        msgFilterUnsupportedMessage,
        msgHandleGroupMessage,
        msgIgnoreOldMessage,
        msgSaveLastMessage,
        msgHandleCommand,
        msgChatWithLLM,
    ];
    for (const handler of handlers) {
        try {
            const result = await handler(message, context);
            if (result) {
                return result;
            }
        } catch (e) {
            console.error(e);
            return new Response(errorToString(e), { status: 500 });
        }
    }
    return null;
}

class Router {
    constructor({ base = '', routes = [], ...other } = {}) {
        this.routes = routes;
        this.base = base;
        Object.assign(this, other);
    }
    parseQueryParams(searchParams) {
        const query = Object.create(null);
        for (const [k, v] of searchParams) {
            query[k] = k in query ? [].concat(query[k], v) : v;
        }
        return query;
    }
    normalizePath(path) {
        return path.replace(/\/+(\/|$)/g, '$1');
    }
    createRouteRegex(path) {
        return RegExp(`^${path
            .replace(/(\/?\.?):(\w+)\+/g, '($1(?<$2>*))')
            .replace(/(\/?\.?):(\w+)/g, '($1(?<$2>[^$1/]+?))')
            .replace(/\./g, '\\.')
            .replace(/(\/?)\*/g, '($1.*)?')
        }/*$`);
    }
    async fetch(request, ...args) {
        const url = new URL(request.url);
        const reqMethod = request.method.toUpperCase();
        request.query = this.parseQueryParams(url.searchParams);
        for (const [method, regex, handlers, path] of this.routes) {
            let match = null;
            if ((method === reqMethod || method === 'ALL') && (match = url.pathname.match(regex))) {
                request.params = match?.groups || {};
                request.route = path;
                for (const handler of handlers) {
                    const response = await handler(request.proxy ?? request, ...args);
                    if (response != null)
                        return response;
                }
            }
        }
    }
    route(method, path, ...handlers) {
        const route = this.normalizePath(this.base + path);
        const regex = this.createRouteRegex(route);
        this.routes.push([method.toUpperCase(), regex, handlers, route]);
        return this;
    }
    get(path, ...handlers) {
        return this.route('GET', path, ...handlers);
    }
    post(path, ...handlers) {
        return this.route('POST', path, ...handlers);
    }
    put(path, ...handlers) {
        return this.route('PUT', path, ...handlers);
    }
    delete(path, ...handlers) {
        return this.route('DELETE', path, ...handlers);
    }
    patch(path, ...handlers) {
        return this.route('PATCH', path, ...handlers);
    }
    head(path, ...handlers) {
        return this.route('HEAD', path, ...handlers);
    }
    options(path, ...handlers) {
        return this.route('OPTIONS', path, ...handlers);
    }
    all(path, ...handlers) {
        return this.route('ALL', path, ...handlers);
    }
}

const helpLink = 'https://github.com/TBXark/ChatGPT-Telegram-Workers/blob/master/doc/en/DEPLOY.md';
const issueLink = 'https://github.com/TBXark/ChatGPT-Telegram-Workers/issues';
const initLink = './init';
const footer = `
<br/>
<p>For more information, please visit <a href="${helpLink}">${helpLink}</a></p>
<p>If you have any questions, please visit <a href="${issueLink}">${issueLink}</a></p>
`;
function buildKeyNotFoundHTML(key) {
    return `<p style="color: red">Please set the <strong>${key}</strong> environment variable in Cloudflare Workers.</p> `;
}
async function bindWebHookAction(request) {
    const result = [];
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
async function telegramWebhook(request) {
    try {
        const { token } = request.params;
        const body = await request.json();
        return makeResponse200(await handleMessage(token, body));
    } catch (e) {
        console.error(e);
        return new Response(errorToString(e), { status: 200 });
    }
}
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
        return new Response(errorToString(e), { status: 200 });
    }
}
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
    commandsDocument().map(item => `<p><strong>${item.command}</strong> - ${item.description}</p>`).join('')
}
    <br/>
    <p>You can get bot information by visiting the following URL:</p>
    <p><strong>/telegram/:token/bot</strong> - Get bot information</p>
    ${footer}
  `);
    return new Response(HTML, { status: 200, headers: { 'Content-Type': 'text/html' } });
}
async function handleRequest(request) {
    const router = new Router();
    router.get('/', defaultIndexAction);
    router.get('/init', bindWebHookAction);
    router.post('/telegram/:token/webhook', telegramWebhook);
    router.post('/telegram/:token/safehook', telegramSafeHook);
    router.all('*', () => new Response('Not Found', { status: 404 }));
    return router.fetch(request);
}

const zhHans = {"env":{"system_init_message":"你是一个得力的助手"},"command":{"help":{"summary":"当前支持以下命令:\n","help":"获取命令帮助","new":"发起新的对话","start":"获取你的ID, 并发起新的对话","img":"生成一张图片, 命令完整格式为 `/img 图片描述`, 例如`/img 月光下的沙滩`","version":"获取当前版本号, 判断是否需要更新","setenv":"设置用户配置，命令完整格式为 /setenv KEY=VALUE","setenvs":"批量设置用户配置, 命令完整格式为 /setenvs {\"KEY1\": \"VALUE1\", \"KEY2\": \"VALUE2\"}","delenv":"删除用户配置，命令完整格式为 /delenv KEY","clearenv":"清除所有用户配置","system":"查看当前一些系统信息","redo":"重做上一次的对话, /redo 加修改过的内容 或者 直接 /redo","echo":"回显消息"},"new":{"new_chat_start":"新的对话已经开始"}}};

const zhHant = {"env":{"system_init_message":"你是一個得力的助手"},"command":{"help":{"summary":"當前支持的命令如下：\n","help":"獲取命令幫助","new":"開始一個新對話","start":"獲取您的ID並開始一個新對話","img":"生成圖片，完整命令格式為`/img 圖片描述`，例如`/img 海灘月光`","version":"獲取當前版本號確認是否需要更新","setenv":"設置用戶配置，完整命令格式為/setenv KEY=VALUE","setenvs":"批量設置用户配置, 命令完整格式為 /setenvs {\"KEY1\": \"VALUE1\", \"KEY2\": \"VALUE2\"}","delenv":"刪除用戶配置，完整命令格式為/delenv KEY","clearenv":"清除所有用戶配置","system":"查看一些系統信息","redo":"重做上一次的對話 /redo 加修改過的內容 或者 直接 /redo","echo":"回显消息"},"new":{"new_chat_start":"開始一個新對話"}}};

const pt = {"env":{"system_init_message":"Você é um assistente útil"},"command":{"help":{"summary":"Os seguintes comandos são suportados atualmente:\n","help":"Obter ajuda sobre comandos","new":"Iniciar uma nova conversa","start":"Obter seu ID e iniciar uma nova conversa","img":"Gerar uma imagem, o formato completo do comando é `/img descrição da imagem`, por exemplo `/img praia ao luar`","version":"Obter o número da versão atual para determinar se é necessário atualizar","setenv":"Definir configuração do usuário, o formato completo do comando é /setenv CHAVE=VALOR","setenvs":"Definir configurações do usuário em lote, o formato completo do comando é /setenvs {\"CHAVE1\": \"VALOR1\", \"CHAVE2\": \"VALOR2\"}","delenv":"Excluir configuração do usuário, o formato completo do comando é /delenv CHAVE","clearenv":"Limpar todas as configurações do usuário","system":"Ver algumas informações do sistema","redo":"Refazer a última conversa, /redo com conteúdo modificado ou diretamente /redo","echo":"Repetir a mensagem"},"new":{"new_chat_start":"Uma nova conversa foi iniciada"}}};

const en = {"env":{"system_init_message":"You are a helpful assistant"},"command":{"help":{"summary":"The following commands are currently supported:\n","help":"Get command help","new":"Start a new conversation","start":"Get your ID and start a new conversation","img":"Generate an image, the complete command format is `/img image description`, for example `/img beach at moonlight`","version":"Get the current version number to determine whether to update","setenv":"Set user configuration, the complete command format is /setenv KEY=VALUE","setenvs":"Batch set user configurations, the full format of the command is /setenvs {\"KEY1\": \"VALUE1\", \"KEY2\": \"VALUE2\"}","delenv":"Delete user configuration, the complete command format is /delenv KEY","clearenv":"Clear all user configuration","system":"View some system information","redo":"Redo the last conversation, /redo with modified content or directly /redo","echo":"Echo the message"},"new":{"new_chat_start":"A new conversation has started"}}};

function i18n(lang) {
    switch (lang.toLowerCase()) {
        case 'cn':
        case 'zh-cn':
        case 'zh-hans':
            return zhHans;
        case 'zh-tw':
        case 'zh-hk':
        case 'zh-mo':
        case 'zh-hant':
            return zhHant;
        case 'pt':
        case 'pt-br':
            return pt;
        case 'en':
        case 'en-us':
            return en;
        default:
            return en;
    }
}

const main = {
    async fetch(request, env, ctx) {
        try {
            initEnv(env, i18n);
            return await handleRequest(request);
        } catch (e) {
            console.error(e);
            return new Response(errorToString(e), { status: 500 });
        }
    },
};

export { main as default };
