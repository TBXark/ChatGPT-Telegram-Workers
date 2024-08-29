class ConfigMerger {
  static parseArray(raw) {
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
  static trim(source, lock) {
    const config = { ...source };
    const keysSet = new Set(source.DEFINE_KEYS || []);
    for (const key of lock) {
      keysSet.delete(key);
    }
    keysSet.add("DEFINE_KEYS");
    for (const key of Object.keys(config)) {
      if (!keysSet.has(key)) {
        delete config[key];
      }
    }
    return config;
  }
  static merge(target, source, exclude) {
    const sourceKeys = new Set(Object.keys(source));
    for (const key of Object.keys(target)) {
      if (!sourceKeys.has(key)) {
        continue;
      }
      if (exclude && exclude.includes(key)) {
        continue;
      }
      const t = target[key] ? typeof target[key] : "string";
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
        case "object":
          if (Array.isArray(target[key])) {
            target[key] = ConfigMerger.parseArray(source[key]);
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
}

const zhHans = { "env": { "system_init_message": "你是一个得力的助手" }, "command": { "help": { "summary": "当前支持以下命令:\n", "help": "获取命令帮助", "new": "发起新的对话", "start": "获取你的ID, 并发起新的对话", "img": "生成一张图片, 命令完整格式为 `/img 图片描述`, 例如`/img 月光下的沙滩`", "version": "获取当前版本号, 判断是否需要更新", "setenv": "设置用户配置，命令完整格式为 /setenv KEY=VALUE", "setenvs": '批量设置用户配置, 命令完整格式为 /setenvs {"KEY1": "VALUE1", "KEY2": "VALUE2"}', "delenv": "删除用户配置，命令完整格式为 /delenv KEY", "clearenv": "清除所有用户配置", "system": "查看当前一些系统信息", "redo": "重做上一次的对话, /redo 加修改过的内容 或者 直接 /redo", "echo": "回显消息" }, "new": { "new_chat_start": "新的对话已经开始" } } };

const zhHant = { "env": { "system_init_message": "你是一個得力的助手" }, "command": { "help": { "summary": "當前支持的命令如下：\n", "help": "獲取命令幫助", "new": "開始一個新對話", "start": "獲取您的ID並開始一個新對話", "img": "生成圖片，完整命令格式為`/img 圖片描述`，例如`/img 海灘月光`", "version": "獲取當前版本號確認是否需要更新", "setenv": "設置用戶配置，完整命令格式為/setenv KEY=VALUE", "setenvs": '批量設置用户配置, 命令完整格式為 /setenvs {"KEY1": "VALUE1", "KEY2": "VALUE2"}', "delenv": "刪除用戶配置，完整命令格式為/delenv KEY", "clearenv": "清除所有用戶配置", "system": "查看一些系統信息", "redo": "重做上一次的對話 /redo 加修改過的內容 或者 直接 /redo", "echo": "回显消息" }, "new": { "new_chat_start": "開始一個新對話" } } };

const pt = { "env": { "system_init_message": "Você é um assistente útil" }, "command": { "help": { "summary": "Os seguintes comandos são suportados atualmente:\n", "help": "Obter ajuda sobre comandos", "new": "Iniciar uma nova conversa", "start": "Obter seu ID e iniciar uma nova conversa", "img": "Gerar uma imagem, o formato completo do comando é `/img descrição da imagem`, por exemplo `/img praia ao luar`", "version": "Obter o número da versão atual para determinar se é necessário atualizar", "setenv": "Definir configuração do usuário, o formato completo do comando é /setenv CHAVE=VALOR", "setenvs": 'Definir configurações do usuário em lote, o formato completo do comando é /setenvs {"CHAVE1": "VALOR1", "CHAVE2": "VALOR2"}', "delenv": "Excluir configuração do usuário, o formato completo do comando é /delenv CHAVE", "clearenv": "Limpar todas as configurações do usuário", "system": "Ver algumas informações do sistema", "redo": "Refazer a última conversa, /redo com conteúdo modificado ou diretamente /redo", "echo": "Repetir a mensagem" }, "new": { "new_chat_start": "Uma nova conversa foi iniciada" } } };

const en = { "env": { "system_init_message": "You are a helpful assistant" }, "command": { "help": { "summary": "The following commands are currently supported:\n", "help": "Get command help", "new": "Start a new conversation", "start": "Get your ID and start a new conversation", "img": "Generate an image, the complete command format is `/img image description`, for example `/img beach at moonlight`", "version": "Get the current version number to determine whether to update", "setenv": "Set user configuration, the complete command format is /setenv KEY=VALUE", "setenvs": 'Batch set user configurations, the full format of the command is /setenvs {"KEY1": "VALUE1", "KEY2": "VALUE2"}', "delenv": "Delete user configuration, the complete command format is /delenv KEY", "clearenv": "Clear all user configuration", "system": "View some system information", "redo": "Redo the last conversation, /redo with modified content or directly /redo", "echo": "Echo the message" }, "new": { "new_chat_start": "A new conversation has started" } } };

function loadI18n(lang) {
  switch (lang?.toLowerCase()) {
    case "cn":
    case "zh-cn":
    case "zh-hans":
      return zhHans;
    case "zh-tw":
    case "zh-hk":
    case "zh-mo":
    case "zh-hant":
      return zhHant;
    case "pt":
    case "pt-br":
      return pt;
    case "en":
    case "en-us":
      return en;
    default:
      return en;
  }
}

class EnvironmentConfig {
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
}
class AgentShareConfig {
  AI_PROVIDER = "auto";
  AI_IMAGE_PROVIDER = "auto";
  SYSTEM_INIT_MESSAGE = null;
  SYSTEM_INIT_MESSAGE_ROLE = "system";
}
class OpenAIConfig {
  OPENAI_API_KEY = [];
  OPENAI_CHAT_MODEL = "gpt-4o-mini";
  OPENAI_API_BASE = "https://api.openai.com/v1";
  OPENAI_API_EXTRA_PARAMS = {};
}
class DalleAIConfig {
  DALL_E_MODEL = "dall-e-2";
  DALL_E_IMAGE_SIZE = "512x512";
  DALL_E_IMAGE_QUALITY = "standard";
  DALL_E_IMAGE_STYLE = "vivid";
}
class AzureConfig {
  AZURE_API_KEY = null;
  AZURE_COMPLETIONS_API = null;
  AZURE_DALLE_API = null;
}
class WorkersConfig {
  CLOUDFLARE_ACCOUNT_ID = null;
  CLOUDFLARE_TOKEN = null;
  WORKERS_CHAT_MODEL = "@cf/mistral/mistral-7b-instruct-v0.1 ";
  WORKERS_IMAGE_MODEL = "@cf/stabilityai/stable-diffusion-xl-base-1.0";
}
class GeminiConfig {
  GOOGLE_API_KEY = null;
  GOOGLE_COMPLETIONS_API = "https://generativelanguage.googleapis.com/v1beta/models/";
  GOOGLE_COMPLETIONS_MODEL = "gemini-pro";
}
class MistralConfig {
  MISTRAL_API_KEY = null;
  MISTRAL_API_BASE = "https://api.mistral.ai/v1";
  MISTRAL_CHAT_MODEL = "mistral-tiny";
}
class CohereConfig {
  COHERE_API_KEY = null;
  COHERE_API_BASE = "https://api.cohere.com/v1";
  COHERE_CHAT_MODEL = "command-r-plus";
}
class AnthropicConfig {
  ANTHROPIC_API_KEY = null;
  ANTHROPIC_API_BASE = "https://api.anthropic.com/v1";
  ANTHROPIC_CHAT_MODEL = "claude-3-haiku-20240307";
}
class DefineKeys {
  DEFINE_KEYS = [];
}

function createAgentUserConfig() {
  return Object.assign(
    {},
    new DefineKeys(),
    new AgentShareConfig(),
    new OpenAIConfig(),
    new DalleAIConfig(),
    new AzureConfig(),
    new WorkersConfig(),
    new GeminiConfig(),
    new MistralConfig(),
    new CohereConfig(),
    new AnthropicConfig()
  );
}
const ENV_KEY_MAPPER = {
  CHAT_MODEL: "OPENAI_CHAT_MODEL",
  API_KEY: "OPENAI_API_KEY",
  WORKERS_AI_MODEL: "WORKERS_CHAT_MODEL"
};
class Environment extends EnvironmentConfig {
  BUILD_TIMESTAMP = 1724914025 ;
  BUILD_VERSION = "29df5de" ;
  I18N = loadI18n();
  PLUGINS_ENV = {};
  USER_CONFIG = createAgentUserConfig();
  CUSTOM_COMMAND = {};
  PLUGINS_COMMAND = {};
  DATABASE = null;
  API_GUARD = null;
  merge(source) {
    this.DATABASE = source.DATABASE;
    this.API_GUARD = source.API_GUARD;
    this.mergeCommands(
      "CUSTOM_COMMAND_",
      "COMMAND_DESCRIPTION_",
      "COMMAND_SCOPE_",
      source,
      this.CUSTOM_COMMAND
    );
    this.mergeCommands(
      "PLUGIN_COMMAND_",
      "PLUGIN_DESCRIPTION_",
      "PLUGIN_SCOPE_",
      source,
      this.PLUGINS_COMMAND
    );
    const pluginEnvPrefix = "PLUGIN_ENV_";
    for (const key of Object.keys(source)) {
      if (key.startsWith(pluginEnvPrefix)) {
        const plugin = key.substring(pluginEnvPrefix.length);
        this.PLUGINS_ENV[plugin] = source[key];
      }
    }
    ConfigMerger.merge(this, source, [
      "BUILD_TIMESTAMP",
      "BUILD_VERSION",
      "I18N",
      "PLUGINS_ENV",
      "USER_CONFIG",
      "CUSTOM_COMMAND",
      "PLUGINS_COMMAND",
      "DATABASE",
      "API_GUARD"
    ]);
    ConfigMerger.merge(this.USER_CONFIG, source);
    this.migrateOldEnv(source);
    this.USER_CONFIG.DEFINE_KEYS = [];
    this.I18N = loadI18n(this.LANGUAGE.toLowerCase());
  }
  mergeCommands(prefix, descriptionPrefix, scopePrefix, source, target) {
    for (const key of Object.keys(source)) {
      if (key.startsWith(prefix)) {
        const cmd = key.substring(prefix.length);
        target[`/${cmd}`] = {
          value: source[key],
          description: source[`${descriptionPrefix}${cmd}`],
          scope: source[`${scopePrefix}${cmd}`]?.split(",").map((s) => s.trim())
        };
      }
    }
  }
  migrateOldEnv(source) {
    if (source.TELEGRAM_TOKEN && !this.TELEGRAM_AVAILABLE_TOKENS.includes(source.TELEGRAM_TOKEN)) {
      if (source.BOT_NAME && this.TELEGRAM_AVAILABLE_TOKENS.length === this.TELEGRAM_BOT_NAME.length) {
        this.TELEGRAM_BOT_NAME.push(source.BOT_NAME);
      }
      this.TELEGRAM_AVAILABLE_TOKENS.push(source.TELEGRAM_TOKEN);
    }
    if (source.OPENAI_API_DOMAIN && !this.USER_CONFIG.OPENAI_API_BASE) {
      this.USER_CONFIG.OPENAI_API_BASE = `${source.OPENAI_API_DOMAIN}/v1`;
    }
    if (source.WORKERS_AI_MODEL && !this.USER_CONFIG.WORKERS_CHAT_MODEL) {
      this.USER_CONFIG.WORKERS_CHAT_MODEL = source.WORKERS_AI_MODEL;
    }
    if (source.API_KEY && this.USER_CONFIG.OPENAI_API_KEY.length === 0) {
      this.USER_CONFIG.OPENAI_API_KEY = source.API_KEY.split(",");
    }
    if (source.CHAT_MODEL && !this.USER_CONFIG.OPENAI_CHAT_MODEL) {
      this.USER_CONFIG.OPENAI_CHAT_MODEL = source.CHAT_MODEL;
    }
    if (!this.USER_CONFIG.SYSTEM_INIT_MESSAGE) {
      this.USER_CONFIG.SYSTEM_INIT_MESSAGE = this.I18N?.env?.system_init_message || "You are a helpful assistant";
    }
  }
}
const ENV = new Environment();

class ShareContext {
  botId;
  botToken;
  botName = null;
  chatHistoryKey;
  lastMessageKey;
  configStoreKey;
  groupAdminsKey;
  constructor(token, message) {
    const botId = Number.parseInt(token.split(":")[0]);
    const telegramIndex = ENV.TELEGRAM_AVAILABLE_TOKENS.indexOf(token);
    if (telegramIndex === -1) {
      throw new Error("Token not allowed");
    }
    if (ENV.TELEGRAM_BOT_NAME.length > telegramIndex) {
      this.botName = ENV.TELEGRAM_BOT_NAME[telegramIndex];
    }
    this.botToken = token;
    this.botId = botId;
    const id = message?.chat?.id;
    if (id === void 0 || id === null) {
      throw new Error("Chat id not found");
    }
    let historyKey = `history:${id}`;
    let configStoreKey = `user_config:${id}`;
    if (botId) {
      historyKey += `:${botId}`;
      configStoreKey += `:${botId}`;
    }
    switch (message.chat.type) {
      case "group":
      case "supergroup":
        if (!ENV.GROUP_CHAT_BOT_SHARE_MODE && message.from?.id) {
          historyKey += `:${message.from.id}`;
          configStoreKey += `:${message.from.id}`;
        }
        this.groupAdminsKey = `group_admin:${id}`;
        break;
    }
    if (message?.chat.is_forum && message?.is_topic_message) {
      if (message?.message_thread_id) {
        historyKey += `:${message.message_thread_id}`;
        configStoreKey += `:${message.message_thread_id}`;
      }
    }
    this.chatHistoryKey = historyKey;
    this.lastMessageKey = `last_message_id:${historyKey}`;
    this.configStoreKey = configStoreKey;
  }
}
class WorkerContext {
  USER_CONFIG;
  SHARE_CONTEXT;
  constructor(USER_CONFIG, SHARE_CONTEXT) {
    this.USER_CONFIG = USER_CONFIG;
    this.SHARE_CONTEXT = SHARE_CONTEXT;
  }
  static async from(token, message) {
    const SHARE_CONTEXT = new ShareContext(token, message);
    const USER_CONFIG = Object.assign({}, ENV.USER_CONFIG);
    try {
      const userConfig = JSON.parse(await ENV.DATABASE.get(SHARE_CONTEXT.configStoreKey));
      ConfigMerger.merge(USER_CONFIG, ConfigMerger.trim(userConfig, ENV.LOCK_USER_CONFIG_KEYS) || {});
    } catch (e) {
      console.warn(e);
    }
    return new WorkerContext(USER_CONFIG, SHARE_CONTEXT);
  }
}

class Cache {
  maxItems;
  maxAge;
  cache;
  constructor() {
    this.maxItems = 10;
    this.maxAge = 1e3 * 60 * 60;
    this.cache = {};
  }
  set(key, value) {
    this.trim();
    this.cache[key] = {
      value,
      time: Date.now()
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
  const cache = IMAGE_CACHE.get(url);
  if (cache) {
    return cache;
  }
  return fetch(url).then((resp) => resp.blob()).then((blob) => {
    IMAGE_CACHE.set(url, blob);
    return blob;
  });
}
async function uploadImageToTelegraph(url) {
  if (url.startsWith("https://telegra.ph")) {
    return url;
  }
  const raw = await fetchImage(url);
  const formData = new FormData();
  formData.append("file", raw, "blob");
  const resp = await fetch("https://telegra.ph/upload", {
    method: "POST",
    body: formData
  });
  let [{ src }] = await resp.json();
  src = `https://telegra.ph${src}`;
  IMAGE_CACHE.set(src, raw);
  return src;
}
async function urlToBase64String(url) {
  try {
    const { Buffer } = await import('node:buffer');
    return fetchImage(url).then((blob) => blob.arrayBuffer()).then((buffer) => Buffer.from(buffer).toString("base64"));
  } catch {
    return fetchImage(url).then((blob) => blob.arrayBuffer()).then((buffer) => btoa(String.fromCharCode.apply(null, new Uint8Array(buffer))));
  }
}
function getImageFormatFromBase64(base64String) {
  const firstChar = base64String.charAt(0);
  switch (firstChar) {
    case "/":
      return "jpeg";
    case "i":
      return "png";
    case "R":
      return "gif";
    case "U":
      return "webp";
    default:
      throw new Error("Unsupported image format");
  }
}
async function imageToBase64String(url) {
  const base64String = await urlToBase64String(url);
  const format = getImageFormatFromBase64(base64String);
  return {
    data: base64String,
    format: `image/${format}`
  };
}
function renderBase64DataURI(params) {
  return `data:${params.format};base64,${params.data}`;
}

class Stream {
  response;
  controller;
  decoder;
  parser;
  constructor(response, controller, parser = null) {
    this.response = response;
    this.controller = controller;
    this.decoder = new SSEDecoder();
    this.parser = parser || defaultSSEJsonParser;
  }
  async *iterMessages() {
    if (!this.response.body) {
      this.controller.abort();
      throw new Error("Attempted to iterate over a response with no body");
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
  async *[Symbol.asyncIterator]() {
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
      if (e instanceof Error && e.name === "AbortError") {
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
  event;
  data;
  constructor() {
    this.event = null;
    this.data = [];
  }
  decode(line) {
    if (line.endsWith("\r")) {
      line = line.substring(0, line.length - 1);
    }
    if (!line) {
      if (!this.event && !this.data.length) {
        return null;
      }
      const sse = {
        event: this.event,
        data: this.data.join("\n")
      };
      this.event = null;
      this.data = [];
      return sse;
    }
    if (line.startsWith(":")) {
      return null;
    }
    let [fieldName, _, value] = this.partition(line, ":");
    if (value.startsWith(" ")) {
      value = value.substring(1);
    }
    if (fieldName === "event") {
      this.event = value;
    } else if (fieldName === "data") {
      this.data.push(value);
    }
    return null;
  }
  partition(str, delimiter) {
    const index = str.indexOf(delimiter);
    if (index !== -1) {
      return [str.substring(0, index), delimiter, str.substring(index + delimiter.length)];
    }
    return [str, "", ""];
  }
}
function defaultSSEJsonParser(sse) {
  if (sse.data?.startsWith("[DONE]")) {
    return { finish: true };
  }
  if (sse.event === null && sse.data) {
    try {
      return { data: JSON.parse(sse.data) };
    } catch (e) {
      console.error(e, sse);
    }
  }
  return {};
}
class LineDecoder {
  buffer;
  trailingCR;
  textDecoder;
  static NEWLINE_CHARS =  new Set(["\n", "\r"]);
  static NEWLINE_REGEXP = /\r\n|[\n\r]/g;
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
    if (text.endsWith("\r")) {
      this.trailingCR = true;
      text = text.slice(0, -1);
    }
    if (!text) {
      return [];
    }
    const trailingNewline = LineDecoder.NEWLINE_CHARS.has(text[text.length - 1] || "");
    let lines = text.split(LineDecoder.NEWLINE_REGEXP);
    if (lines.length === 1 && !trailingNewline) {
      this.buffer.push(lines[0]);
      return [];
    }
    if (this.buffer.length > 0) {
      lines = [this.buffer.join("") + lines[0], ...lines.slice(1)];
      this.buffer = [];
    }
    if (!trailingNewline) {
      this.buffer = [lines.pop() || ""];
    }
    return lines;
  }
  decodeText(bytes) {
    if (bytes == null) {
      return "";
    }
    if (typeof bytes === "string") {
      return bytes;
    }
    if (typeof Buffer !== "undefined") {
      if (bytes instanceof Buffer) {
        return bytes.toString();
      }
      if (bytes instanceof Uint8Array) {
        return Buffer.from(bytes).toString();
      }
      throw new Error(`Unexpected: received non-Uint8Array (${bytes.constructor.name}) stream chunk in an environment with a global "Buffer" defined, which this library assumes to be Node. Please report this error.`);
    }
    if (typeof TextDecoder !== "undefined") {
      if (bytes instanceof Uint8Array || bytes instanceof ArrayBuffer) {
        if (!this.textDecoder) {
          this.textDecoder = new TextDecoder("utf8");
        }
        return this.textDecoder.decode(bytes, { stream: true });
      }
      throw new Error(`Unexpected: received non-Uint8Array/ArrayBuffer in a web platform. Please report this error.`);
    }
    throw new Error("Unexpected: neither Buffer nor TextDecoder are available as globals. Please report this error.");
  }
  flush() {
    if (!this.buffer.length && !this.trailingCR) {
      return [];
    }
    const lines = [this.buffer.join("")];
    this.buffer = [];
    this.trailingCR = false;
    return lines;
  }
}

function fixOpenAICompatibleOptions(options) {
  options = options || {};
  options.streamBuilder = options.streamBuilder || function(r, c) {
    return new Stream(r, c);
  };
  options.contentExtractor = options.contentExtractor || function(d) {
    return d?.choices?.[0]?.delta?.content;
  };
  options.fullContentExtractor = options.fullContentExtractor || function(d) {
    return d.choices?.[0]?.message.content;
  };
  options.errorExtractor = options.errorExtractor || function(d) {
    return d.error?.message;
  };
  return options;
}
function isJsonResponse(resp) {
  return resp.headers.get("content-type")?.includes("json") || false;
}
function isEventStreamResponse(resp) {
  const types = ["application/stream+json", "text/event-stream"];
  const content = resp.headers.get("content-type") || "";
  for (const type of types) {
    if (content.includes(type)) {
      return true;
    }
  }
  return false;
}
async function requestChatCompletions(url, header, body, onStream, onResult = null, options = null) {
  const controller = new AbortController();
  const { signal } = controller;
  let timeoutID = null;
  let lastUpdateTime = Date.now();
  if (ENV.CHAT_COMPLETE_API_TIMEOUT > 0) {
    timeoutID = setTimeout(() => controller.abort(), ENV.CHAT_COMPLETE_API_TIMEOUT);
  }
  const resp = await fetch(url, {
    method: "POST",
    headers: header,
    body: JSON.stringify(body),
    signal
  });
  if (timeoutID) {
    clearTimeout(timeoutID);
  }
  options = fixOpenAICompatibleOptions(options);
  if (onStream && resp.ok && isEventStreamResponse(resp)) {
    const stream = options.streamBuilder?.(resp, controller);
    if (!stream) {
      throw new Error("Stream builder error");
    }
    let contentFull = "";
    let lengthDelta = 0;
    let updateStep = 50;
    try {
      for await (const data of stream) {
        const c = options.contentExtractor?.(data) || "";
        if (c === "") {
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
          await onStream(`${contentFull}
...`);
        }
      }
    } catch (e) {
      contentFull += `
ERROR: ${e.message}`;
    }
    return contentFull;
  }
  if (!isJsonResponse(resp)) {
    throw new Error(resp.statusText);
  }
  const result = await resp.json();
  if (!result) {
    throw new Error("Empty response");
  }
  if (options.errorExtractor?.(result)) {
    throw new Error(options.errorExtractor?.(result) || "Unknown error");
  }
  try {
    await onResult?.(result);
    return options.fullContentExtractor?.(result) || "";
  } catch (e) {
    console.error(e);
    throw new Error(JSON.stringify(result));
  }
}

class Anthropic {
  name = "anthropic";
  modelKey = "ANTHROPIC_CHAT_MODEL";
  enable = (context) => {
    return !!context.ANTHROPIC_API_KEY;
  };
  render = async (item) => {
    const res = {
      role: item.role,
      content: item.content
    };
    if (item.images && item.images.length > 0) {
      res.content = [];
      if (item.content) {
        res.content.push({ type: "text", text: item.content });
      }
      for (const image of item.images) {
        res.content.push(await imageToBase64String(image).then(({ format, data }) => {
          return { type: "image", source: { type: "base64", media_type: format, data } };
        }));
      }
    }
    return res;
  };
  model = (ctx) => {
    return ctx.ANTHROPIC_CHAT_MODEL;
  };
  static parser(sse) {
    switch (sse.event) {
      case "content_block_delta":
        try {
          return { data: JSON.parse(sse.data || "") };
        } catch (e) {
          console.error(e, sse.data);
          return {};
        }
      case "message_start":
      case "content_block_start":
      case "content_block_stop":
        return {};
      case "message_stop":
        return { finish: true };
      default:
        return {};
    }
  }
  request = async (params, context, onStream) => {
    const { message, images, prompt, history } = params;
    const url = `${context.ANTHROPIC_API_BASE}/messages`;
    const header = {
      "x-api-key": context.ANTHROPIC_API_KEY || "",
      "anthropic-version": "2023-06-01",
      "content-type": "application/json"
    };
    const messages = (history || []).concat({ role: "user", content: message, images });
    if (messages.length > 0 && messages[0].role === "assistant") {
      messages.shift();
    }
    const body = {
      system: prompt,
      model: context.ANTHROPIC_CHAT_MODEL,
      messages: await Promise.all(messages.map((item) => this.render(item))),
      stream: onStream != null,
      max_tokens: ENV.MAX_TOKEN_LENGTH > 0 ? ENV.MAX_TOKEN_LENGTH : 2048
    };
    if (!body.system) {
      delete body.system;
    }
    const options = {};
    options.streamBuilder = function(r, c) {
      return new Stream(r, c, Anthropic.parser);
    };
    options.contentExtractor = function(data) {
      return data?.delta?.text;
    };
    options.fullContentExtractor = function(data) {
      return data?.content?.[0].text;
    };
    options.errorExtractor = function(data) {
      return data?.error?.message;
    };
    return requestChatCompletions(url, header, body, onStream, null, options);
  };
}

async function renderOpenAIMessage(item) {
  const res = {
    role: item.role,
    content: item.content
  };
  if (item.images && item.images.length > 0) {
    res.content = [];
    if (item.content) {
      res.content.push({ type: "text", text: item.content });
    }
    for (const image of item.images) {
      switch (ENV.TELEGRAM_IMAGE_TRANSFER_MODE) {
        case "base64":
          res.content.push({ type: "image_url", image_url: {
            url: renderBase64DataURI(await imageToBase64String(image))
          } });
          break;
        case "url":
        default:
          res.content.push({ type: "image_url", image_url: { url: image } });
          break;
      }
    }
  }
  return res;
}
class OpenAIBase {
  name = "openai";
  apikey = (context) => {
    const length = context.OPENAI_API_KEY.length;
    return context.OPENAI_API_KEY[Math.floor(Math.random() * length)];
  };
}
class OpenAI extends OpenAIBase {
  modelKey = "OPENAI_CHAT_MODEL";
  enable = (context) => {
    return context.OPENAI_API_KEY.length > 0;
  };
  model = (ctx) => {
    return ctx.OPENAI_CHAT_MODEL;
  };
  render = async (item) => {
    return renderOpenAIMessage(item);
  };
  request = async (params, context, onStream) => {
    const { message, images, prompt, history } = params;
    const url = `${context.OPENAI_API_BASE}/chat/completions`;
    const header = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.apikey(context)}`
    };
    const messages = [...history || [], { role: "user", content: message, images }];
    if (prompt) {
      messages.unshift({ role: context.SYSTEM_INIT_MESSAGE_ROLE, content: prompt });
    }
    const body = {
      model: context.OPENAI_CHAT_MODEL,
      ...context.OPENAI_API_EXTRA_PARAMS,
      messages: await Promise.all(messages.map(this.render)),
      stream: onStream != null
    };
    return requestChatCompletions(url, header, body, onStream);
  };
}
class Dalle extends OpenAIBase {
  modelKey = "OPENAI_DALLE_API";
  enable = (context) => {
    return context.OPENAI_API_KEY.length > 0;
  };
  model = (ctx) => {
    return ctx.DALL_E_MODEL;
  };
  request = async (prompt, context) => {
    const url = `${context.OPENAI_API_BASE}/images/generations`;
    const header = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.apikey(context)}`
    };
    const body = {
      prompt,
      n: 1,
      size: context.DALL_E_IMAGE_SIZE,
      model: context.DALL_E_MODEL
    };
    if (body.model === "dall-e-3") {
      body.quality = context.DALL_E_IMAGE_QUALITY;
      body.style = context.DALL_E_IMAGE_STYLE;
    }
    const resp = await fetch(url, {
      method: "POST",
      headers: header,
      body: JSON.stringify(body)
    }).then((res) => res.json());
    if (resp.error?.message) {
      throw new Error(resp.error.message);
    }
    return resp?.data?.[0]?.url;
  };
}

class AzureBase {
  name = "azure";
  modelFromURI = (uri) => {
    if (!uri) {
      return "";
    }
    try {
      const url = new URL(uri);
      return url.pathname.split("/")[3];
    } catch {
      return uri;
    }
  };
}
class AzureChatAI extends AzureBase {
  modelKey = "AZURE_COMPLETIONS_API";
  enable = (context) => {
    return !!(context.AZURE_API_KEY && context.AZURE_COMPLETIONS_API);
  };
  model = (ctx) => {
    return this.modelFromURI(ctx.AZURE_COMPLETIONS_API);
  };
  request = async (params, context, onStream) => {
    const { message, images, prompt, history } = params;
    const url = context.AZURE_COMPLETIONS_API;
    if (!url || !context.AZURE_API_KEY) {
      throw new Error("Azure Completions API is not set");
    }
    const header = {
      "Content-Type": "application/json",
      "api-key": context.AZURE_API_KEY
    };
    const messages = [...history || [], { role: "user", content: message, images }];
    if (prompt) {
      messages.unshift({ role: context.SYSTEM_INIT_MESSAGE_ROLE, content: prompt });
    }
    const body = {
      ...context.OPENAI_API_EXTRA_PARAMS,
      messages: await Promise.all(messages.map(renderOpenAIMessage)),
      stream: onStream != null
    };
    return requestChatCompletions(url, header, body, onStream);
  };
}
class AzureImageAI extends AzureBase {
  modelKey = "AZURE_DALLE_API";
  enable = (context) => {
    return !!(context.AZURE_API_KEY && context.AZURE_DALLE_API);
  };
  model = (ctx) => {
    return this.modelFromURI(ctx.AZURE_DALLE_API);
  };
  request = async (prompt, context) => {
    const url = context.AZURE_DALLE_API;
    if (!url || !context.AZURE_API_KEY) {
      throw new Error("Azure DALL-E API is not set");
    }
    const header = {
      "Content-Type": "application/json",
      "api-key": context.AZURE_API_KEY
    };
    const body = {
      prompt,
      n: 1,
      size: context.DALL_E_IMAGE_SIZE,
      style: context.DALL_E_IMAGE_STYLE,
      quality: context.DALL_E_IMAGE_QUALITY
    };
    const validSize = ["1792x1024", "1024x1024", "1024x1792"];
    if (!validSize.includes(body.size)) {
      body.size = "1024x1024";
    }
    const resp = await fetch(url, {
      method: "POST",
      headers: header,
      body: JSON.stringify(body)
    }).then((res) => res.json());
    if (resp.error?.message) {
      throw new Error(resp.error.message);
    }
    return resp?.data?.[0]?.url;
  };
}

class Cohere {
  name = "cohere";
  modelKey = "COHERE_CHAT_MODEL";
  static COHERE_ROLE_MAP = {
    assistant: "CHATBOT",
    user: "USER"
  };
  enable = (context) => {
    return !!context.COHERE_API_KEY;
  };
  model = (ctx) => {
    return ctx.COHERE_CHAT_MODEL;
  };
  render = (item) => {
    return {
      role: Cohere.COHERE_ROLE_MAP[item.role] || "USER",
      content: item.content
    };
  };
  static parser(sse) {
    switch (sse.event) {
      case "text-generation":
        try {
          return { data: JSON.parse(sse.data || "") };
        } catch (e) {
          console.error(e, sse.data);
          return {};
        }
      case "stream-start":
        return {};
      case "stream-end":
        return { finish: true };
      default:
        return {};
    }
  }
  request = async (params, context, onStream) => {
    const { message, prompt, history } = params;
    const url = `${context.COHERE_API_BASE}/chat`;
    const header = {
      "Authorization": `Bearer ${context.COHERE_API_KEY}`,
      "Content-Type": "application/json",
      "Accept": onStream !== null ? "text/event-stream" : "application/json"
    };
    const body = {
      message,
      model: context.COHERE_CHAT_MODEL,
      stream: onStream != null,
      preamble: prompt,
      chat_history: history?.map(this.render)
    };
    if (!body.preamble) {
      delete body.preamble;
    }
    const options = {};
    options.streamBuilder = function(r, c) {
      return new Stream(r, c, Cohere.parser);
    };
    options.contentExtractor = function(data) {
      return data?.text;
    };
    options.fullContentExtractor = function(data) {
      return data?.text;
    };
    options.errorExtractor = function(data) {
      return data?.message;
    };
    return requestChatCompletions(url, header, body, onStream, null, options);
  };
}

class Gemini {
  name = "gemini";
  modelKey = "GOOGLE_COMPLETIONS_MODEL";
  static GEMINI_ROLE_MAP = {
    assistant: "model",
    system: "user",
    user: "user"
  };
  enable = (context) => {
    return !!context.GOOGLE_API_KEY;
  };
  model = (ctx) => {
    return ctx.GOOGLE_COMPLETIONS_MODEL;
  };
  render = (item) => {
    return {
      role: Gemini.GEMINI_ROLE_MAP[item.role],
      parts: [
        {
          text: item.content || ""
        }
      ]
    };
  };
  request = async (params, context, onStream) => {
    const { message, prompt, history } = params;
    if (onStream !== null) {
      console.warn("Stream mode is not supported");
    }
    const url = `${context.GOOGLE_COMPLETIONS_API}${context.GOOGLE_COMPLETIONS_MODEL}:${
    "generateContent"}?key=${context.GOOGLE_API_KEY}`;
    const contentsTemp = [...history || [], { role: "user", content: message }];
    if (prompt) {
      contentsTemp.unshift({ role: "assistant", content: prompt });
    }
    const contents = [];
    for (const msg of contentsTemp) {
      msg.role = Gemini.GEMINI_ROLE_MAP[msg.role];
      if (contents.length === 0 || contents[contents.length - 1].role !== msg.role) {
        contents.push(this.render(msg));
      } else {
        contents[contents.length - 1].parts[0].text += msg.content;
      }
    }
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ contents })
    });
    const data = await resp.json();
    try {
      return data.candidates[0].content.parts[0].text;
    } catch (e) {
      console.error(e);
      if (!data) {
        throw new Error("Empty response");
      }
      throw new Error(data?.error?.message || JSON.stringify(data));
    }
  };
}

class Mistral {
  name = "mistral";
  modelKey = "MISTRAL_CHAT_MODEL";
  enable = (context) => {
    return !!context.MISTRAL_API_KEY;
  };
  model = (ctx) => {
    return ctx.MISTRAL_CHAT_MODEL;
  };
  render = (item) => {
    return {
      role: item.role,
      content: item.content
    };
  };
  request = async (params, context, onStream) => {
    const { message, prompt, history } = params;
    const url = `${context.MISTRAL_API_BASE}/chat/completions`;
    const header = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${context.MISTRAL_API_KEY}`
    };
    const messages = [...history || [], { role: "user", content: message }];
    if (prompt) {
      messages.unshift({ role: context.SYSTEM_INIT_MESSAGE_ROLE, content: prompt });
    }
    const body = {
      model: context.MISTRAL_CHAT_MODEL,
      messages: messages.map(this.render),
      stream: onStream != null
    };
    return requestChatCompletions(url, header, body, onStream);
  };
}

class WorkerBase {
  name = "workers";
  run = async (model, body, id, token) => {
    return await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${id}/ai/run/${model}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        method: "POST",
        body: JSON.stringify(body)
      }
    );
  };
  enable = (context) => {
    return !!(context.CLOUDFLARE_ACCOUNT_ID && context.CLOUDFLARE_TOKEN);
  };
}
class WorkersChat extends WorkerBase {
  modelKey = "WORKERS_CHAT_MODEL";
  model = (ctx) => {
    return ctx.WORKERS_CHAT_MODEL;
  };
  render = (item) => {
    return {
      role: item.role,
      content: item.content
    };
  };
  request = async (params, context, onStream) => {
    const { message, prompt, history } = params;
    const id = context.CLOUDFLARE_ACCOUNT_ID;
    const token = context.CLOUDFLARE_TOKEN;
    const model = context.WORKERS_CHAT_MODEL;
    const url = `https://api.cloudflare.com/client/v4/accounts/${id}/ai/run/${model}`;
    const header = {
      Authorization: `Bearer ${token}`
    };
    const messages = [...history || [], { role: "user", content: message }];
    if (prompt) {
      messages.unshift({ role: context.SYSTEM_INIT_MESSAGE_ROLE, content: prompt });
    }
    const body = {
      messages: messages.map(this.render),
      stream: onStream !== null
    };
    const options = {};
    options.contentExtractor = function(data) {
      return data?.response;
    };
    options.fullContentExtractor = function(data) {
      return data?.result?.response;
    };
    options.errorExtractor = function(data) {
      return data?.errors?.[0]?.message;
    };
    return requestChatCompletions(url, header, body, onStream, null, options);
  };
}
class WorkersImage extends WorkerBase {
  modelKey = "WORKERS_IMAGE_MODEL";
  model = (ctx) => {
    return ctx.WORKERS_IMAGE_MODEL;
  };
  request = async (prompt, context) => {
    const id = context.CLOUDFLARE_ACCOUNT_ID;
    const token = context.CLOUDFLARE_TOKEN;
    if (!id || !token) {
      throw new Error("Cloudflare account ID or token is not set");
    }
    const raw = await this.run(context.WORKERS_IMAGE_MODEL, { prompt }, id, token);
    return await raw.blob();
  };
}

const CHAT_AGENTS = [
  new Anthropic(),
  new AzureChatAI(),
  new Cohere(),
  new Gemini(),
  new Mistral(),
  new OpenAI(),
  new WorkersChat()
];
function loadChatLLM(context) {
  for (const llm of CHAT_AGENTS) {
    if (llm.name === context.AI_PROVIDER) {
      return llm;
    }
  }
  for (const llm of CHAT_AGENTS) {
    if (llm.enable(context)) {
      return llm;
    }
  }
  return null;
}
const IMAGE_AGENTS = [
  new AzureImageAI(),
  new Dalle(),
  new WorkersImage()
];
function loadImageGen(context) {
  for (const imgGen of IMAGE_AGENTS) {
    if (imgGen.name === context.AI_IMAGE_PROVIDER) {
      return imgGen;
    }
  }
  for (const imgGen of IMAGE_AGENTS) {
    if (imgGen.enable(context)) {
      return imgGen;
    }
  }
  return null;
}

function tokensCounter() {
  return (text) => {
    return text.length;
  };
}
async function loadHistory(key) {
  let history = [];
  try {
    history = JSON.parse(await ENV.DATABASE.get(key));
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
          historyItem.content = "";
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
async function requestCompletionsFromLLM(params, context, agent, modifier, onStream) {
  const historyDisable = ENV.AUTO_TRIM_HISTORY && ENV.MAX_HISTORY_LENGTH <= 0;
  const historyKey = context.SHARE_CONTEXT.chatHistoryKey;
  if (!historyKey) {
    throw new Error("History key not found");
  }
  let history = await loadHistory(historyKey);
  if (modifier) {
    const modifierData = modifier(history, params.message || null);
    history = modifierData.history;
    params.message = modifierData.message;
  }
  const llmParams = {
    ...params,
    history,
    prompt: context.USER_CONFIG.SYSTEM_INIT_MESSAGE
  };
  const answer = await agent.request(llmParams, context.USER_CONFIG, onStream);
  if (!historyDisable) {
    const userMessage = { role: "user", content: params.message || "", images: params.images };
    if (ENV.HISTORY_IMAGE_PLACEHOLDER && userMessage.images && userMessage.images.length > 0) {
      delete userMessage.images;
      userMessage.content = `${ENV.HISTORY_IMAGE_PLACEHOLDER}
${userMessage.content}`;
    }
    history.push(userMessage);
    history.push({ role: "assistant", content: answer });
    await ENV.DATABASE.put(historyKey, JSON.stringify(history)).catch(console.error);
  }
  return answer;
}

class APIClientBase {
  token;
  baseURL = ENV.TELEGRAM_API_DOMAIN;
  constructor(token, baseURL) {
    this.token = token;
    if (baseURL) {
      this.baseURL = baseURL;
    }
    while (this.baseURL.endsWith("/")) {
      this.baseURL = this.baseURL.slice(0, -1);
    }
  }
  uri(method) {
    return `${this.baseURL}/bot${this.token}/${method}`;
  }
  jsonRequest(method, params) {
    return fetch(this.uri(method), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(params)
    });
  }
  formDataRequest(method, params) {
    const formData = new FormData();
    for (const key in params) {
      const value = params[key];
      if (value instanceof File) {
        formData.append(key, value, value.name);
      } else if (value instanceof Blob) {
        formData.append(key, value, "blob");
      } else if (typeof value === "string") {
        formData.append(key, value);
      } else {
        formData.append(key, JSON.stringify(value));
      }
    }
    return fetch(this.uri(method), {
      method: "POST",
      body: formData
    });
  }
  request(method, params) {
    for (const key in params) {
      if (params[key] instanceof File || params[key] instanceof Blob) {
        return this.formDataRequest(method, params);
      }
    }
    return this.jsonRequest(method, params);
  }
  async requestJSON(method, params) {
    return this.request(method, params).then((res) => res.json());
  }
}
function createTelegramBotAPI(token) {
  const client = new APIClientBase(token);
  return new Proxy(client, {
    get(target, prop, receiver) {
      if (prop in target) {
        return Reflect.get(target, prop, receiver);
      }
      return (...args) => {
        if (typeof prop === "string" && prop.endsWith("WithReturns")) {
          const method = prop.slice(0, -11);
          return Reflect.apply(target.requestJSON, target, [method, ...args]);
        }
        return Reflect.apply(target.request, target, [prop, ...args]);
      };
    }
  });
}

class MessageContext {
  chat_id;
  message_id = null;
  reply_to_message_id;
  parse_mode = null;
  allow_sending_without_reply = null;
  disable_web_page_preview = null;
  constructor(message) {
    this.chat_id = message.chat.id;
    if (message.chat.type === "group" || message.chat.type === "supergroup") {
      this.reply_to_message_id = message.message_id;
      this.allow_sending_without_reply = true;
    } else {
      this.reply_to_message_id = null;
    }
  }
}
class MessageSender {
  api;
  context;
  constructor(token, context) {
    this.api = createTelegramBotAPI(token);
    this.context = context;
  }
  static from(token, message) {
    return new MessageSender(token, new MessageContext(message));
  }
  with(message) {
    this.context = new MessageContext(message);
    return this;
  }
  update(context) {
    if (!this.context) {
      this.context = context;
      return this;
    }
    for (const key in context) {
      this.context[key] = context[key];
    }
    return this;
  }
  async sendMessage(message, context) {
    if (context?.message_id) {
      const params = {
        chat_id: context.chat_id,
        message_id: context.message_id,
        parse_mode: context.parse_mode || void 0,
        text: message
      };
      if (context.disable_web_page_preview) {
        params.link_preview_options = {
          is_disabled: true
        };
      }
      return this.api.editMessageText(params);
    } else {
      const params = {
        chat_id: context.chat_id,
        parse_mode: context.parse_mode || void 0,
        text: message
      };
      if (context.reply_to_message_id) {
        params.reply_parameters = {
          message_id: context.reply_to_message_id,
          chat_id: context.chat_id,
          allow_sending_without_reply: context.allow_sending_without_reply || void 0
        };
      }
      if (context.disable_web_page_preview) {
        params.link_preview_options = {
          is_disabled: true
        };
      }
      return this.api.sendMessage(params);
    }
  }
  async sendLongMessage(message, context) {
    const chatContext = { ...context };
    const originMessage = message;
    const limit = 4096;
    if (message.length <= limit) {
      const resp = await this.sendMessage(message, chatContext);
      if (resp.status === 200) {
        return resp;
      } else {
        message = originMessage;
        chatContext.parse_mode = null;
        return await this.sendMessage(message, chatContext);
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
      lastMessageResponse = await this.sendMessage(msg, chatContext);
      if (lastMessageResponse.status !== 200) {
        break;
      }
    }
    if (lastMessageResponse === null) {
      throw new Error("Send message failed");
    }
    return lastMessageResponse;
  }
  sendRichText(message, parseMode = ENV.DEFAULT_PARSE_MODE) {
    if (!this.context) {
      throw new Error("Message context not set");
    }
    return this.sendLongMessage(message, {
      ...this.context,
      parse_mode: parseMode
    });
  }
  sendPlainText(message) {
    if (!this.context) {
      throw new Error("Message context not set");
    }
    return this.sendLongMessage(message, {
      ...this.context,
      parse_mode: null
    });
  }
  sendPhoto(photo) {
    if (!this.context) {
      throw new Error("Message context not set");
    }
    const params = {
      chat_id: this.context.chat_id,
      photo
    };
    if (this.context.reply_to_message_id) {
      params.reply_parameters = {
        message_id: this.context.reply_to_message_id,
        chat_id: this.context.chat_id,
        allow_sending_without_reply: this.context.allow_sending_without_reply || void 0
      };
    }
    return this.api.sendPhoto(params);
  }
}

async function chatWithLLM(message, params, context, modifier) {
  const sender = MessageSender.from(context.SHARE_CONTEXT.botToken, message);
  try {
    try {
      const msg = await sender.sendPlainText("...").then((r) => r.json());
      sender.update({
        message_id: msg.result.message_id
      });
    } catch (e) {
      console.error(e);
    }
    const api = createTelegramBotAPI(context.SHARE_CONTEXT.botToken);
    setTimeout(() => api.sendChatAction({
      chat_id: message.chat.id,
      action: "typing"
    }).catch(console.error), 0);
    let onStream = null;
    let nextEnableTime = null;
    if (ENV.STREAM_MODE) {
      onStream = async (text) => {
        try {
          if (nextEnableTime && nextEnableTime > Date.now()) {
            return;
          }
          const resp = await sender.sendPlainText(text);
          if (resp.status === 429) {
            const retryAfter = Number.parseInt(resp.headers.get("Retry-After") || "");
            if (retryAfter) {
              nextEnableTime = Date.now() + retryAfter * 1e3;
              return;
            }
          }
          nextEnableTime = null;
          if (resp.ok) {
            const respJson = await resp.json();
            sender.update({
              message_id: respJson.result.message_id
            });
          }
        } catch (e) {
          console.error(e);
        }
      };
    }
    const agent = loadChatLLM(context.USER_CONFIG);
    if (agent === null) {
      return sender.sendPlainText("LLM is not enable");
    }
    const answer = await requestCompletionsFromLLM(params, context, agent, modifier, onStream);
    if (nextEnableTime !== null && nextEnableTime > Date.now()) {
      await new Promise((resolve) => setTimeout(resolve, (nextEnableTime ?? 0) - Date.now()));
    }
    return sender.sendRichText(answer);
  } catch (e) {
    let errMsg = `Error: ${e.message}`;
    if (errMsg.length > 2048) {
      errMsg = errMsg.substring(0, 2048);
    }
    return sender.sendPlainText(errMsg);
  }
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
}
class ChatHandler {
  handle = async (message, context) => {
    const params = {
      message: message.text || message.caption || ""
    };
    if (message.photo && message.photo.length > 0) {
      const id = findPhotoFileID(message.photo, ENV.TELEGRAM_PHOTO_SIZE_OFFSET);
      const api = createTelegramBotAPI(context.SHARE_CONTEXT.botToken);
      const file = await api.getFileWithReturns({ file_id: id });
      let url = file.result.file_path;
      if (url) {
        if (ENV.TELEGRAPH_ENABLE) {
          url = await uploadImageToTelegraph(url);
        }
        params.images = [url];
      }
    }
    return chatWithLLM(message, params, context, null);
  };
}

function isTelegramChatTypeGroup(type) {
  return type === "group" || type === "supergroup";
}

function checkMention(content, entities, botName, botId) {
  let isMention = false;
  for (const entity of entities) {
    const entityStr = content.slice(entity.offset, entity.offset + entity.length);
    switch (entity.type) {
      case "mention":
        if (entityStr === `@${botName}`) {
          isMention = true;
          content = content.slice(0, entity.offset) + content.slice(entity.offset + entity.length);
        }
        break;
      case "text_mention":
        if (`${entity.user?.id}` === `${botId}`) {
          isMention = true;
          content = content.slice(0, entity.offset) + content.slice(entity.offset + entity.length);
        }
        break;
      case "bot_command":
        if (entityStr.endsWith(`@${botName}`)) {
          isMention = true;
          const newEntityStr = entityStr.replace(`@${botName}`, "");
          content = content.slice(0, entity.offset) + newEntityStr + content.slice(entity.offset + entity.length);
        }
        break;
    }
  }
  return {
    isMention,
    content
  };
}
class GroupMention {
  handle = async (message, context) => {
    if (!isTelegramChatTypeGroup(message.chat.type)) {
      return null;
    }
    const replyMe = `${message.reply_to_message?.from?.id}` === `${context.SHARE_CONTEXT.botId}`;
    if (replyMe) {
      return null;
    }
    let botName = context.SHARE_CONTEXT.botName;
    if (!botName) {
      const res = await createTelegramBotAPI(context.SHARE_CONTEXT.botToken).getMeWithReturns();
      botName = res.result.username || null;
      context.SHARE_CONTEXT.botName = botName;
    }
    if (!botName) {
      throw new Error("Not set bot name");
    }
    let isMention = false;
    if (message.text && message.entities) {
      const res = checkMention(message.text, message.entities, botName, context.SHARE_CONTEXT.botId);
      isMention = res.isMention;
      message.text = res.content.trim();
    }
    if (message.caption && message.caption_entities) {
      const res = checkMention(message.caption, message.caption_entities, botName, context.SHARE_CONTEXT.botId);
      isMention = res.isMention || isMention;
      message.caption = res.content.trim();
    }
    if (!isMention) {
      throw new Error("Not mention");
    }
    if (ENV.EXTRA_MESSAGE_CONTEXT && !replyMe && message.reply_to_message && message.reply_to_message.text) {
      if (message.text) {
        message.text = `${message.reply_to_message.text}
${message.text}`;
      }
    }
    return null;
  };
}

const INTERPOLATE_LOOP_REGEXP = /\{\{#each(?::(\w+))?\s+(\w+)\s+in\s+([\w.[\]]+)\}\}([\s\S]*?)\{\{\/each(?::\1)?\}\}/g;
const INTERPOLATE_CONDITION_REGEXP = /\{\{#if(?::(\w+))?\s+([\w.[\]]+)\}\}([\s\S]*?)(?:\{\{#else(?::\1)?\}\}([\s\S]*?))?\{\{\/if(?::\1)?\}\}/g;
const INTERPOLATE_VARIABLE_REGEXP = /\{\{([\w.[\]]+)\}\}/g;
function evaluateExpression(expr, localData) {
  if (expr === ".") {
    return localData["."] ?? localData;
  }
  try {
    return expr.split(".").reduce((value, key) => {
      if (key.includes("[") && key.includes("]")) {
        const [arrayKey, indexStr] = key.split("[");
        const indexExpr = indexStr.slice(0, -1);
        let index = Number.parseInt(indexExpr, 10);
        if (Number.isNaN(index)) {
          index = evaluateExpression(indexExpr, localData);
        }
        return value?.[arrayKey]?.[index];
      }
      return value?.[key];
    }, localData);
  } catch (error) {
    console.error(`Error evaluating expression: ${expr}`, error);
    return void 0;
  }
}
function interpolate(template, data, formatter = null) {
  const processConditional = (condition, trueBlock, falseBlock, localData) => {
    const result = evaluateExpression(condition, localData);
    return result ? trueBlock : falseBlock || "";
  };
  const processLoop = (itemName, arrayExpr, loopContent, localData) => {
    const array = evaluateExpression(arrayExpr, localData);
    if (!Array.isArray(array)) {
      console.warn(`Expression "${arrayExpr}" did not evaluate to an array`);
      return "";
    }
    return array.map((item) => {
      const itemData = { ...localData, [itemName]: item, ".": item };
      return interpolate(loopContent, itemData);
    }).join("");
  };
  const processTemplate = (tmpl, localData) => {
    tmpl = tmpl.replace(INTERPOLATE_LOOP_REGEXP, (_, alias, itemName, arrayExpr, loopContent) => processLoop(itemName, arrayExpr, loopContent, localData));
    tmpl = tmpl.replace(INTERPOLATE_CONDITION_REGEXP, (_, alias, condition, trueBlock, falseBlock) => processConditional(condition, trueBlock, falseBlock, localData));
    return tmpl.replace(INTERPOLATE_VARIABLE_REGEXP, (_, expr) => {
      const value = evaluateExpression(expr, localData);
      if (value === void 0) {
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
  if (obj === null || obj === void 0) {
    return null;
  }
  if (typeof obj === "string") {
    return interpolate(obj, data);
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => interpolateObject(item, data));
  }
  if (typeof obj === "object") {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = interpolateObject(value, data);
    }
    return result;
  }
  return obj;
}
async function executeRequest(template, data) {
  const urlRaw = interpolate(template.url, data, encodeURIComponent);
  const url = new URL(urlRaw);
  if (template.query) {
    for (const [key, value] of Object.entries(template.query)) {
      url.searchParams.append(key, interpolate(value, data));
    }
  }
  const method = template.method;
  const headers = Object.fromEntries(
    Object.entries(template.headers || {}).map(([key, value]) => {
      return [key, interpolate(value, data)];
    })
  );
  for (const key of Object.keys(headers)) {
    if (headers[key] === null) {
      delete headers[key];
    }
  }
  let body = null;
  if (template.body) {
    if (template.body.type === "json") {
      body = JSON.stringify(interpolateObject(template.body.content, data));
    } else if (template.body.type === "form") {
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
    body
  });
  const renderOutput = async (type, temple, response2) => {
    switch (type) {
      case "text":
        return interpolate(temple, await response2.text());
      case "json":
      default:
        return interpolate(temple, await response2.json());
    }
  };
  if (!response.ok) {
    const content2 = await renderOutput(template.response?.error?.input_type, template.response.error?.output, response);
    return {
      type: template.response.error.output_type,
      content: content2
    };
  }
  const content = await renderOutput(template.response.content?.input_type, template.response.content?.output, response);
  return {
    type: template.response.content.output_type,
    content
  };
}
function formatInput(input, type) {
  if (type === "json") {
    return JSON.parse(input);
  } else if (type === "space-separated") {
    return input.split(/\s+/);
  } else if (type === "comma-separated") {
    return input.split(/\s*,\s*/);
  } else {
    return input;
  }
}

const COMMAND_AUTH_CHECKER = {
  default(chatType) {
    if (isTelegramChatTypeGroup(chatType)) {
      return ["administrator", "creator"];
    }
    return null;
  },
  shareModeGroup(chatType) {
    if (isTelegramChatTypeGroup(chatType)) {
      if (!ENV.GROUP_CHAT_BOT_SHARE_MODE) {
        return null;
      }
      return ["administrator", "creator"];
    }
    return null;
  }
};
class ImgCommandHandler {
  command = "/img";
  scopes = ["all_private_chats", "all_chat_administrators"];
  handle = async (message, subcommand, context) => {
    const sender = MessageSender.from(context.SHARE_CONTEXT.botToken, message);
    if (subcommand === "") {
      return sender.sendPlainText(ENV.I18N.command.help.img);
    }
    try {
      const api = createTelegramBotAPI(context.SHARE_CONTEXT.botToken);
      const agent = loadImageGen(context.USER_CONFIG);
      if (!agent) {
        return sender.sendPlainText("ERROR: Image generator not found");
      }
      setTimeout(() => api.sendChatAction({
        chat_id: message.chat.id,
        action: "upload_photo"
      }).catch(console.error), 0);
      const img = await agent.request(subcommand, context.USER_CONFIG);
      const resp = await sender.sendPhoto(img);
      if (!resp.ok) {
        return sender.sendPlainText(`ERROR: ${resp.statusText} ${await resp.text()}`);
      }
      return resp;
    } catch (e) {
      return sender.sendPlainText(`ERROR: ${e.message}`);
    }
  };
}
class HelpCommandHandler {
  command = "/help";
  scopes = ["all_private_chats", "all_chat_administrators"];
  handle = async (message, subcommand, context) => {
    const sender = MessageSender.from(context.SHARE_CONTEXT.botToken, message);
    let helpMsg = `${ENV.I18N.command.help.summary}
`;
    for (const [k, v] of Object.entries(ENV.I18N.command.help)) {
      if (k === "summary") {
        continue;
      }
      helpMsg += `/${k}：${v}
`;
    }
    for (const [k, v] of Object.entries(ENV.CUSTOM_COMMAND)) {
      if (v.description) {
        helpMsg += `${k}：${v.description}
`;
      }
    }
    for (const [k, v] of Object.entries(ENV.PLUGINS_COMMAND)) {
      if (v.description) {
        helpMsg += `${k}：${v.description}
`;
      }
    }
    return sender.sendPlainText(helpMsg);
  };
}
class BaseNewCommandHandler {
  static async handle(showID, message, subcommand, context) {
    await ENV.DATABASE.delete(context.SHARE_CONTEXT.chatHistoryKey);
    const text = ENV.I18N.command.new.new_chat_start + (showID ? `(${message.chat.id})` : "");
    const params = {
      chat_id: message.chat.id,
      text
    };
    if (ENV.SHOW_REPLY_BUTTON && !isTelegramChatTypeGroup(message.chat.type)) {
      params.reply_markup = {
        keyboard: [[{ text: "/new" }, { text: "/redo" }]],
        selective: true,
        resize_keyboard: true,
        one_time_keyboard: false
      };
    } else {
      params.reply_markup = {
        remove_keyboard: true,
        selective: true
      };
    }
    return createTelegramBotAPI(context.SHARE_CONTEXT.botToken).sendMessage(params);
  }
}
class NewCommandHandler extends BaseNewCommandHandler {
  command = "/new";
  scopes = ["all_private_chats", "all_group_chats", "all_chat_administrators"];
  handle = async (message, subcommand, context) => {
    return BaseNewCommandHandler.handle(false, message, subcommand, context);
  };
}
class StartCommandHandler extends BaseNewCommandHandler {
  command = "/start";
  handle = async (message, subcommand, context) => {
    return BaseNewCommandHandler.handle(true, message, subcommand, context);
  };
}
class SetEnvCommandHandler {
  command = "/setenv";
  needAuth = COMMAND_AUTH_CHECKER.shareModeGroup;
  handle = async (message, subcommand, context) => {
    const sender = MessageSender.from(context.SHARE_CONTEXT.botToken, message);
    const kv = subcommand.indexOf("=");
    if (kv === -1) {
      return sender.sendPlainText(ENV.I18N.command.help.setenv);
    }
    let key = subcommand.slice(0, kv);
    const value = subcommand.slice(kv + 1);
    key = ENV_KEY_MAPPER[key] || key;
    if (ENV.LOCK_USER_CONFIG_KEYS.includes(key)) {
      return sender.sendPlainText(`Key ${key} is locked`);
    }
    if (!Object.keys(context.USER_CONFIG).includes(key)) {
      return sender.sendPlainText(`Key ${key} not found`);
    }
    try {
      context.USER_CONFIG.DEFINE_KEYS.push(key);
      context.USER_CONFIG.DEFINE_KEYS = Array.from(new Set(context.USER_CONFIG.DEFINE_KEYS));
      ConfigMerger.merge(context.USER_CONFIG, {
        [key]: value
      });
      console.log("Update user config: ", key, context.USER_CONFIG[key]);
      await ENV.DATABASE.put(
        context.SHARE_CONTEXT.configStoreKey,
        JSON.stringify(ConfigMerger.trim(context.USER_CONFIG, ENV.LOCK_USER_CONFIG_KEYS))
      );
      return sender.sendPlainText("Update user config success");
    } catch (e) {
      return sender.sendPlainText(`ERROR: ${e.message}`);
    }
  };
}
class SetEnvsCommandHandler {
  command = "/setenvs";
  needAuth = COMMAND_AUTH_CHECKER.shareModeGroup;
  handle = async (message, subcommand, context) => {
    const sender = MessageSender.from(context.SHARE_CONTEXT.botToken, message);
    try {
      const values = JSON.parse(subcommand);
      const configKeys = Object.keys(context.USER_CONFIG);
      for (const ent of Object.entries(values)) {
        let [key, value] = ent;
        key = ENV_KEY_MAPPER[key] || key;
        if (ENV.LOCK_USER_CONFIG_KEYS.includes(key)) {
          return sender.sendPlainText(`Key ${key} is locked`);
        }
        if (!configKeys.includes(key)) {
          return sender.sendPlainText(`Key ${key} not found`);
        }
        context.USER_CONFIG.DEFINE_KEYS.push(key);
        ConfigMerger.merge(context.USER_CONFIG, {
          [key]: value
        });
        console.log("Update user config: ", key, context.USER_CONFIG[key]);
      }
      context.USER_CONFIG.DEFINE_KEYS = Array.from(new Set(context.USER_CONFIG.DEFINE_KEYS));
      await ENV.DATABASE.put(
        context.SHARE_CONTEXT.configStoreKey,
        JSON.stringify(ConfigMerger.trim(context.USER_CONFIG, ENV.LOCK_USER_CONFIG_KEYS))
      );
      return sender.sendPlainText("Update user config success");
    } catch (e) {
      return sender.sendPlainText(`ERROR: ${e.message}`);
    }
  };
}
class DelEnvCommandHandler {
  command = "/delenv";
  needAuth = COMMAND_AUTH_CHECKER.shareModeGroup;
  handle = async (message, subcommand, context) => {
    const sender = MessageSender.from(context.SHARE_CONTEXT.botToken, message);
    if (ENV.LOCK_USER_CONFIG_KEYS.includes(subcommand)) {
      const msg = `Key ${subcommand} is locked`;
      return sender.sendPlainText(msg);
    }
    try {
      context.USER_CONFIG[subcommand] = null;
      context.USER_CONFIG.DEFINE_KEYS = context.USER_CONFIG.DEFINE_KEYS.filter((key) => key !== subcommand);
      await ENV.DATABASE.put(
        context.SHARE_CONTEXT.configStoreKey,
        JSON.stringify(ConfigMerger.trim(context.USER_CONFIG, ENV.LOCK_USER_CONFIG_KEYS))
      );
      return sender.sendPlainText("Delete user config success");
    } catch (e) {
      return sender.sendPlainText(`ERROR: ${e.message}`);
    }
  };
}
class ClearEnvCommandHandler {
  command = "/clearenv";
  needAuth = COMMAND_AUTH_CHECKER.shareModeGroup;
  handle = async (message, subcommand, context) => {
    const sender = MessageSender.from(context.SHARE_CONTEXT.botToken, message);
    try {
      await ENV.DATABASE.put(
        context.SHARE_CONTEXT.configStoreKey,
        JSON.stringify({})
      );
      return sender.sendPlainText("Clear user config success");
    } catch (e) {
      return sender.sendPlainText(`ERROR: ${e.message}`);
    }
  };
}
class VersionCommandHandler {
  command = "/version";
  scopes = ["all_private_chats", "all_chat_administrators"];
  handle = async (message, subcommand, context) => {
    const sender = MessageSender.from(context.SHARE_CONTEXT.botToken, message);
    const current = {
      ts: ENV.BUILD_TIMESTAMP,
      sha: ENV.BUILD_VERSION
    };
    try {
      const info = `https://raw.githubusercontent.com/TBXark/ChatGPT-Telegram-Workers/${ENV.UPDATE_BRANCH}/dist/buildinfo.json`;
      const online = await fetch(info).then((r) => r.json());
      const timeFormat = (ts) => {
        return new Date(ts * 1e3).toLocaleString("en-US", {});
      };
      if (current.ts < online.ts) {
        const text = `New version detected: ${online.sha}(${timeFormat(online.ts)})
Current version: ${current.sha}(${timeFormat(current.ts)})`;
        return sender.sendPlainText(text);
      } else {
        const text = `Current version: ${current.sha}(${timeFormat(current.ts)}) is up to date`;
        return sender.sendPlainText(text);
      }
    } catch (e) {
      return sender.sendPlainText(`ERROR: ${e.message}`);
    }
  };
}
class SystemCommandHandler {
  command = "/system";
  scopes = ["all_private_chats", "all_chat_administrators"];
  handle = async (message, subcommand, context) => {
    const sender = MessageSender.from(context.SHARE_CONTEXT.botToken, message);
    const chatAgent = loadChatLLM(context.USER_CONFIG);
    const imageAgent = loadImageGen(context.USER_CONFIG);
    const agent = {
      AI_PROVIDER: chatAgent?.name,
      [chatAgent?.modelKey || "AI_PROVIDER_NOT_FOUND"]: chatAgent?.model(context.USER_CONFIG),
      AI_IMAGE_PROVIDER: imageAgent?.name,
      [imageAgent?.modelKey || "AI_IMAGE_PROVIDER_NOT_FOUND"]: imageAgent?.model(context.USER_CONFIG)
    };
    let msg = `AGENT: ${JSON.stringify(agent, null, 2)}
`;
    if (ENV.DEV_MODE) {
      const shareCtx = { ...context.SHARE_CONTEXT };
      shareCtx.botToken = "******";
      context.USER_CONFIG.OPENAI_API_KEY = ["******"];
      context.USER_CONFIG.AZURE_API_KEY = "******";
      context.USER_CONFIG.AZURE_COMPLETIONS_API = "******";
      context.USER_CONFIG.AZURE_DALLE_API = "******";
      context.USER_CONFIG.CLOUDFLARE_ACCOUNT_ID = "******";
      context.USER_CONFIG.CLOUDFLARE_TOKEN = "******";
      context.USER_CONFIG.GOOGLE_API_KEY = "******";
      context.USER_CONFIG.MISTRAL_API_KEY = "******";
      context.USER_CONFIG.COHERE_API_KEY = "******";
      context.USER_CONFIG.ANTHROPIC_API_KEY = "******";
      const config = ConfigMerger.trim(context.USER_CONFIG, ENV.LOCK_USER_CONFIG_KEYS);
      msg = `<pre>
${msg}`;
      msg += `USER_CONFIG: ${JSON.stringify(config, null, 2)}
`;
      msg += `CHAT_CONTEXT: ${JSON.stringify(sender.context || {}, null, 2)}
`;
      msg += `SHARE_CONTEXT: ${JSON.stringify(shareCtx, null, 2)}
`;
      msg += "</pre>";
    }
    return sender.sendRichText(msg, "HTML");
  };
}
class RedoCommandHandler {
  command = "/redo";
  scopes = ["all_private_chats", "all_group_chats", "all_chat_administrators"];
  handle = async (message, subcommand, context) => {
    const mf = (history, text) => {
      let nextText = text;
      if (!(history && Array.isArray(history) && history.length > 0)) {
        throw new Error("History not found");
      }
      const historyCopy = structuredClone(history);
      while (true) {
        const data = historyCopy.pop();
        if (data === void 0 || data === null) {
          break;
        } else if (data.role === "user") {
          if (text === "" || text === void 0 || text === null) {
            nextText = data.content || null;
          }
          break;
        }
      }
      if (subcommand) {
        nextText = subcommand;
      }
      return { history: historyCopy, message: nextText };
    };
    return chatWithLLM(message, { message: null }, context, mf);
  };
}
class EchoCommandHandler {
  command = "/echo";
  handle = (message, subcommand, context) => {
    let msg = "<pre>";
    msg += JSON.stringify({ message }, null, 2);
    msg += "</pre>";
    return MessageSender.from(context.SHARE_CONTEXT.botToken, message).sendRichText(msg, "HTML");
  };
}

async function loadChatRoleWithContext(message, context) {
  const { groupAdminsKey } = context.SHARE_CONTEXT;
  const chatId = message.chat.id;
  const speakerId = message.from?.id || chatId;
  if (!groupAdminsKey) {
    return null;
  }
  let groupAdmin = null;
  try {
    groupAdmin = JSON.parse(await ENV.DATABASE.get(groupAdminsKey));
  } catch (e) {
    console.error(e);
  }
  if (groupAdmin === null || !Array.isArray(groupAdmin) || groupAdmin.length === 0) {
    const api = createTelegramBotAPI(context.SHARE_CONTEXT.botToken);
    const result = await api.getChatAdministratorsWithReturns({ chat_id: chatId });
    if (result == null) {
      return null;
    }
    groupAdmin = result.result;
    await ENV.DATABASE.put(
      groupAdminsKey,
      JSON.stringify(groupAdmin),
      { expiration: Date.now() / 1e3 + 120 }
    );
  }
  for (let i = 0; i < groupAdmin.length; i++) {
    const user = groupAdmin[i];
    if (`${user.user?.id}` === `${speakerId}`) {
      return user.status;
    }
  }
  return "member";
}

const SYSTEM_COMMANDS = [
  new StartCommandHandler(),
  new NewCommandHandler(),
  new RedoCommandHandler(),
  new ImgCommandHandler(),
  new SetEnvCommandHandler(),
  new SetEnvsCommandHandler(),
  new DelEnvCommandHandler(),
  new ClearEnvCommandHandler(),
  new VersionCommandHandler(),
  new SystemCommandHandler(),
  new HelpCommandHandler()
];
async function handleSystemCommand(message, raw, command, context) {
  const sender = MessageSender.from(context.SHARE_CONTEXT.botToken, message);
  try {
    if (command.needAuth) {
      const roleList = command.needAuth(message.chat.type);
      if (roleList) {
        const chatRole = await loadChatRoleWithContext(message, context);
        if (chatRole === null) {
          return sender.sendPlainText("ERROR: Get chat role failed");
        }
        if (!roleList.includes(chatRole)) {
          return sender.sendPlainText(`ERROR: Permission denied, need ${roleList.join(" or ")}`);
        }
      }
    }
  } catch (e) {
    return sender.sendPlainText(`ERROR: ${e.message}`);
  }
  const subcommand = raw.substring(command.command.length).trim();
  try {
    return await command.handle(message, subcommand, context);
  } catch (e) {
    return sender.sendPlainText(`ERROR: ${e.message}`);
  }
}
async function handlePluginCommand(message, command, raw, template, context) {
  const sender = MessageSender.from(context.SHARE_CONTEXT.botToken, message);
  try {
    const subcommand = raw.substring(command.length).trim();
    if (template.input?.required && !subcommand) {
      throw new Error("Missing required input");
    }
    const DATA = formatInput(subcommand, template.input?.type);
    const { type, content } = await executeRequest(template, {
      DATA,
      ENV: ENV.PLUGINS_ENV
    });
    if (type === "image") {
      return sender.sendPhoto(content);
    }
    switch (type) {
      case "html":
        return sender.sendRichText(content, "HTML");
      case "markdown":
        return sender.sendRichText(content, "Markdown");
      case "text":
      default:
        return sender.sendPlainText(content);
    }
  } catch (e) {
    const help = ENV.PLUGINS_COMMAND[command].description;
    return sender.sendPlainText(`ERROR: ${e.message}${help ? `
${help}` : ""}`);
  }
}
async function handleCommandMessage(message, context) {
  let text = (message.text || message.caption || "").trim();
  if (ENV.CUSTOM_COMMAND[text]) {
    text = ENV.CUSTOM_COMMAND[text].value;
  }
  if (ENV.DEV_MODE) {
    SYSTEM_COMMANDS.push(new EchoCommandHandler());
  }
  for (const key in ENV.PLUGINS_COMMAND) {
    if (text === key || text.startsWith(`${key} `)) {
      let template = ENV.PLUGINS_COMMAND[key].value.trim();
      if (template.startsWith("http")) {
        template = await fetch(template).then((r) => r.text());
      }
      return await handlePluginCommand(message, key, text, JSON.parse(template), context);
    }
  }
  for (const cmd of SYSTEM_COMMANDS) {
    if (text === cmd.command || text.startsWith(`${cmd.command} `)) {
      return await handleSystemCommand(message, text, cmd, context);
    }
  }
  return null;
}
function commandsBindScope() {
  const scopeCommandMap = {
    all_private_chats: [],
    all_group_chats: [],
    all_chat_administrators: []
  };
  for (const cmd of SYSTEM_COMMANDS) {
    if (ENV.HIDE_COMMAND_BUTTONS.includes(cmd.command)) {
      continue;
    }
    if (cmd.scopes) {
      for (const scope of cmd.scopes) {
        if (!scopeCommandMap[scope]) {
          scopeCommandMap[scope] = [];
        }
        scopeCommandMap[scope].push({
          command: cmd.command,
          description: ENV.I18N.command.help[cmd.command.substring(1)] || ""
        });
      }
    }
  }
  for (const list of [ENV.CUSTOM_COMMAND, ENV.PLUGINS_COMMAND]) {
    for (const [cmd, config] of Object.entries(list)) {
      if (config.scope) {
        for (const scope of config.scope) {
          if (!scopeCommandMap[scope]) {
            scopeCommandMap[scope] = [];
          }
          scopeCommandMap[scope].push({
            command: cmd,
            description: config.description || ""
          });
        }
      }
    }
  }
  const result = {};
  for (const scope in scopeCommandMap) {
    result[scope] = {
      commands: scopeCommandMap[scope],
      scope: {
        type: scope
      }
    };
  }
  return result;
}
function commandsDocument() {
  return SYSTEM_COMMANDS.map((command) => {
    return {
      command: command.command,
      description: ENV.I18N.command.help[command.command.substring(1)] || ""
    };
  }).filter((item) => item.description !== "");
}

class SaveLastMessage {
  handle = async (message, context) => {
    if (!ENV.DEBUG_MODE) {
      return null;
    }
    const lastMessageKey = `last_message:${context.SHARE_CONTEXT.chatHistoryKey}`;
    await ENV.DATABASE.put(lastMessageKey, JSON.stringify(message), { expirationTtl: 3600 });
    return null;
  };
}
class OldMessageFilter {
  handle = async (message, context) => {
    if (!ENV.SAFE_MODE) {
      return null;
    }
    let idList = [];
    try {
      idList = JSON.parse(await ENV.DATABASE.get(context.SHARE_CONTEXT.lastMessageKey).catch(() => "[]")) || [];
    } catch (e) {
      console.error(e);
    }
    if (idList.includes(message.message_id)) {
      throw new Error("Ignore old message");
    } else {
      idList.push(message.message_id);
      if (idList.length > 100) {
        idList.shift();
      }
      await ENV.DATABASE.put(context.SHARE_CONTEXT.lastMessageKey, JSON.stringify(idList));
    }
    return null;
  };
}
class EnvChecker {
  handle = async (message, context) => {
    if (!ENV.DATABASE) {
      return MessageSender.from(context.SHARE_CONTEXT.botToken, message).sendPlainText("DATABASE Not Set");
    }
    return null;
  };
}
class WhiteListFilter {
  handle = async (message, context) => {
    if (ENV.I_AM_A_GENEROUS_PERSON) {
      return null;
    }
    const sender = MessageSender.from(context.SHARE_CONTEXT.botToken, message);
    const text = `You are not in the white list, please contact the administrator to add you to the white list. Your chat_id: ${message.chat.id}`;
    if (message.chat.type === "private") {
      if (!ENV.CHAT_WHITE_LIST.includes(`${message.chat.id}`)) {
        return sender.sendPlainText(text);
      }
      return null;
    }
    if (isTelegramChatTypeGroup(message.chat.type)) {
      if (!ENV.GROUP_CHAT_BOT_ENABLE) {
        throw new Error("Not support");
      }
      if (!ENV.CHAT_GROUP_WHITE_LIST.includes(`${message.chat.id}`)) {
        return sender.sendPlainText(text);
      }
      return null;
    }
    return sender.sendPlainText(
      `Not support chat type: ${message.chat.type}`
    );
  };
}
class MessageFilter {
  handle = async (message, context) => {
    if (message.text) {
      return null;
    }
    if (message.caption) {
      return null;
    }
    if (message.photo) {
      return null;
    }
    throw new Error("Not supported message type");
  };
}
class CommandHandler {
  handle = async (message, context) => {
    if (message.text || message.caption) {
      return await handleCommandMessage(message, context);
    }
    return null;
  };
}

function loadMessage(body) {
  if (body.edited_message) {
    throw new Error("Ignore edited message");
  }
  if (body.message) {
    return body?.message;
  } else {
    throw new Error("Invalid message");
  }
}
const SHARE_HANDLER = [
  new EnvChecker(),
  new WhiteListFilter(),
  new MessageFilter(),
  new GroupMention(),
  new OldMessageFilter(),
  new SaveLastMessage(),
  new CommandHandler(),
  new ChatHandler()
];
async function handleUpdate(token, update) {
  const message = loadMessage(update);
  const context = await WorkerContext.from(token, message);
  for (const handler of SHARE_HANDLER) {
    try {
      const result = await handler.handle(message, context);
      if (result) {
        return result;
      }
    } catch (e) {
      return new Response(JSON.stringify({
        message: e.message,
        stack: e.stack
      }), { status: 500 });
    }
  }
  return null;
}

function renderHTML(body) {
  return `
<html lang="en">  
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
    stack: e.stack
  });
}
function makeResponse200(resp) {
  if (resp === null) {
    return new Response("NOT HANDLED", { status: 200 });
  }
  if (resp.status === 200) {
    return resp;
  } else {
    return new Response(resp.body, {
      status: 200,
      headers: {
        "Original-Status": `${resp.status}`,
        ...resp.headers
      }
    });
  }
}

class Router {
  routes;
  base;
  errorHandler = async (req, error) => new Response(errorToString(error), { status: 500 });
  constructor({ base = "", routes = [], ...other } = {}) {
    this.routes = routes;
    this.base = base;
    Object.assign(this, other);
  }
  parseQueryParams(searchParams) {
    const query = {};
    searchParams.forEach((v, k) => {
      query[k] = k in query ? [...Array.isArray(query[k]) ? query[k] : [query[k]], v] : v;
    });
    return query;
  }
  normalizePath(path) {
    return path.replace(/\/+(\/|$)/g, "$1");
  }
  createRouteRegex(path) {
    return RegExp(`^${path.replace(/(\/?\.?):(\w+)\+/g, "($1(?<$2>*))").replace(/(\/?\.?):(\w+)/g, "($1(?<$2>[^$1/]+?))").replace(/\./g, "\\.").replace(/(\/?)\*/g, "($1.*)?")}/*$`);
  }
  async fetch(request, ...args) {
    try {
      const url = new URL(request.url);
      const reqMethod = request.method.toUpperCase();
      request.query = this.parseQueryParams(url.searchParams);
      for (const [method, regex, handlers, path] of this.routes) {
        let match = null;
        if ((method === reqMethod || method === "ALL") && (match = url.pathname.match(regex))) {
          request.params = match?.groups || {};
          request.route = path;
          for (const handler of handlers) {
            const response = await handler(request, ...args);
            if (response != null) {
              return response;
            }
          }
        }
      }
      return new Response("Not Found", { status: 404 });
    } catch (e) {
      return this.errorHandler(request, e);
    }
  }
  route(method, path, ...handlers) {
    const route = this.normalizePath(this.base + path);
    const regex = this.createRouteRegex(route);
    this.routes.push([method.toUpperCase(), regex, handlers, route]);
    return this;
  }
  get(path, ...handlers) {
    return this.route("GET", path, ...handlers);
  }
  post(path, ...handlers) {
    return this.route("POST", path, ...handlers);
  }
  put(path, ...handlers) {
    return this.route("PUT", path, ...handlers);
  }
  delete(path, ...handlers) {
    return this.route("DELETE", path, ...handlers);
  }
  patch(path, ...handlers) {
    return this.route("PATCH", path, ...handlers);
  }
  head(path, ...handlers) {
    return this.route("HEAD", path, ...handlers);
  }
  options(path, ...handlers) {
    return this.route("OPTIONS", path, ...handlers);
  }
  all(path, ...handlers) {
    return this.route("ALL", path, ...handlers);
  }
}

const helpLink = "https://github.com/TBXark/ChatGPT-Telegram-Workers/blob/master/doc/en/DEPLOY.md";
const issueLink = "https://github.com/TBXark/ChatGPT-Telegram-Workers/issues";
const initLink = "./init";
const footer = `
<br/>
<p>For more information, please visit <a href="${helpLink}">${helpLink}</a></p>
<p>If you have any questions, please visit <a href="${issueLink}">${issueLink}</a></p>
`;
async function bindWebHookAction(request) {
  const result = {};
  const domain = new URL(request.url).host;
  const hookMode = ENV.API_GUARD ? "safehook" : "webhook";
  const scope = commandsBindScope();
  for (const token of ENV.TELEGRAM_AVAILABLE_TOKENS) {
    const api = createTelegramBotAPI(token);
    const url = `https://${domain}/telegram/${token.trim()}/${hookMode}`;
    const id = token.split(":")[0];
    result[id] = {};
    result[id].webhook = await api.setWebhook({ url }).then((res) => res.json()).catch((e) => errorToString(e));
    for (const [s, data] of Object.entries(scope)) {
      result[id][s] = await api.setMyCommands(data).then((res) => res.json()).catch((e) => errorToString(e));
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
        html += `<p style="color: ${data.ok ? "green" : "red"}">${s}: ${JSON.stringify(data)}</p>`;
      }
    }
  }
  html += footer;
  const HTML = renderHTML(html);
  return new Response(HTML, { status: 200, headers: { "Content-Type": "text/html" } });
}
async function telegramWebhook(request) {
  try {
    const { token } = request.params;
    const body = await request.json();
    return makeResponse200(await handleUpdate(token, body));
  } catch (e) {
    console.error(e);
    return new Response(errorToString(e), { status: 200 });
  }
}
async function telegramSafeHook(request) {
  try {
    if (ENV.API_GUARD === void 0 || ENV.API_GUARD === null) {
      return telegramWebhook(request);
    }
    console.log("API_GUARD is enabled");
    const url = new URL(request.url);
    url.pathname = url.pathname.replace("/safehook", "/webhook");
    const newRequest = new Request(url, request);
    return makeResponse200(await ENV.API_GUARD.fetch(newRequest));
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
    ${commandsDocument().map((item) => `<p><strong>${item.command}</strong> - ${item.description}</p>`).join("")}
    <br/>
    <p>You can get bot information by visiting the following URL:</p>
    <p><strong>/telegram/:token/bot</strong> - Get bot information</p>
    ${footer}
  `);
  return new Response(HTML, { status: 200, headers: { "Content-Type": "text/html" } });
}
function createRouter() {
  const router = new Router();
  router.get("/", defaultIndexAction);
  router.get("/init", bindWebHookAction);
  router.post("/telegram/:token/webhook", telegramWebhook);
  router.post("/telegram/:token/safehook", telegramSafeHook);
  router.all("*", () => new Response("Not Found", { status: 404 }));
  return router;
}

const index = {
  async fetch(request, env) {
    try {
      ENV.merge(env);
      return createRouter().fetch(request);
    } catch (e) {
      console.error(e);
      return new Response(JSON.stringify({
        message: e.message,
        stack: e.stack
      }), { status: 500 });
    }
  }
};

export { index as default };
