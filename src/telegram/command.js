import '../types/context.js';
import {
    CONST,
    CUSTOM_COMMAND,
    CUSTOM_COMMAND_DESCRIPTION,
    DATABASE,
    ENV,
    ENV_KEY_MAPPER,
    PLUGINS_COMMAND,
    mergeEnvironment, PLUGINS_COMMAND_DESCRIPTION,
} from '../config/env.js';
import {
    chatModelKey,
    currentChatModel,
    currentImageModel,
    imageModelKey,
    loadChatLLM,
    loadImageGen,
} from '../agent/agents.js';
import { trimUserConfig } from '../config/context.js';
import {
    TemplateOutputTypeHTML,
    TemplateOutputTypeImage,
    TemplateOutputTypeMarkdown,
    TemplateOutputTypeText,
} from '../types/template.js';
import { executeRequest, formatInput } from '../plugins/template.js';
import {
    sendChatActionToTelegramWithContext,
    sendMessageToTelegramWithContext,
    sendPhotoToTelegramWithContext, setMyCommands,
} from './telegram.js';
import { chatWithLLM } from './agent.js';
import { getChatRoleWithContext } from './utils.js';

const commandAuthCheck = {
    default(chatType) {
        if (CONST.GROUP_TYPES.includes(chatType)) {
            return ['administrator', 'creator'];
        }
        return null;
    },
    shareModeGroup(chatType) {
        if (CONST.GROUP_TYPES.includes(chatType)) {
            // 每个人在群里有上下文的时候，不限制
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

/**
 *
 * @callback CommandFunction
 * @param {TelegramMessage} message
 * @param {string} command
 * @param {string} subcommand
 * @param {ContextType} context
 * @returns {Promise<Response>}
 */

/**
 * @callback AuthCheckFunction
 * @param {string} chatType
 * @returns {string[] | null}
 */

/**
 * @typedef {object} CommandHandler
 * @property {string} scopes - 权限范围
 * @property {CommandFunction} fn - 处理函数
 * @property {AuthCheckFunction} [needAuth] - 权限检查函数
 */

/**
 * @type {{[key: string]: CommandHandler}}
 */
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

/**
 * /img 命令
 * @param {TelegramMessage} message
 * @param {string} command
 * @param {string} subcommand
 * @param {ContextType} context
 * @returns {Promise<Response>}
 */
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

/**
 * /help 获取帮助信息
 * @param {TelegramMessage} message
 * @param {string} command
 * @param {string} subcommand
 * @param {ContextType} context
 * @returns {Promise<Response>}
 */
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

/**
 * /new /start 新的会话
 * @param {TelegramMessage} message
 * @param {string} command
 * @param {string} subcommand
 * @param {ContextType} context
 * @returns {Promise<Response>}
 */
async function commandCreateNewChatContext(message, command, subcommand, context) {
    try {
        await DATABASE.delete(context.SHARE_CONTEXT.chatHistoryKey);

        const isNewCommand = command.startsWith('/new');
        const text = ENV.I18N.command.new.new_chat_start + (isNewCommand ? '' : `(${context.CURRENT_CHAT_CONTEXT.chat_id})`);

        // 非群组消息，显示回复按钮
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

/**
 * /setenv 用户配置修改
 * @param {TelegramMessage} message
 * @param {string} command
 * @param {string} subcommand
 * @param {ContextType} context
 * @returns {Promise<Response>}
 */
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

/**
 * /setenvs 批量用户配置修改
 * @param {TelegramMessage} message
 * @param {string} command
 * @param {string} subcommand
 * @param {ContextType} context
 * @returns {Promise<Response>}
 */
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

/**
 * /delenv 用户配置修改
 * @param {TelegramMessage} message
 * @param {string} command
 * @param {string} subcommand
 * @param {ContextType} context
 * @returns {Promise<Response>}
 */
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

/**
 * /clearenv 清空用户配置
 * @param {TelegramMessage} message
 * @param {string} command
 * @param {string} subcommand
 * @param {ContextType} context
 * @returns {Promise<Response>}
 */
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

/**
 * /version 获得更新信息
 * @param {TelegramMessage} message
 * @param {string} command
 * @param {string} subcommand
 * @param {ContextType} context
 * @returns {Promise<Response>}
 */
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

/**
 * /system 获得系统信息
 * @param {TelegramMessage} message
 * @param {string} command
 * @param {string} subcommand
 * @param {ContextType} context
 * @returns {Promise<Response>}
 */
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

/**
 * /redo 重新生成上一条消息
 * @param {TelegramMessage} message
 * @param {string} command
 * @param {string} subcommand
 * @param {ContextType} context
 * @returns {Promise<Response>}
 */
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

/**
 * /echo 回显消息
 * @param {TelegramMessage} message
 * @param {string} command
 * @param {string} subcommand
 * @param {ContextType} context
 * @returns {Promise<Response>}
 */
async function commandEcho(message, command, subcommand, context) {
    let msg = '<pre>';
    msg += JSON.stringify({ message }, null, 2);
    msg += '</pre>';
    context.CURRENT_CHAT_CONTEXT.parse_mode = 'HTML';
    return sendMessageToTelegramWithContext(context)(msg);
}

/**
 * @param {TelegramMessage} message
 * @param {string} command
 * @param {string} raw
 * @param {CommandHandler} handler
 * @param {ContextType} context
 * @returns {Promise<Response|*>}
 */
async function handleSystemCommand(message, command, raw, handler, context) {
    try {
        // 如果存在权限条件
        if (handler.needAuth) {
            const roleList = handler.needAuth(context.SHARE_CONTEXT.chatType);
            if (roleList) {
                // 获取身份并判断
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

/**
 * @param {TelegramMessage} message
 * @param {string} command
 * @param {string} raw
 * @param {RequestTemplate} template
 * @param {ContextType} context
 * @returns {Promise<Response|*>}
 */
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

/**
 * 注入命令处理器
 */
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
/**
 * 处理命令消息
 * @param {TelegramMessage} message
 * @param {ContextType} context
 * @returns {Promise<Response>}
 */
export async function handleCommandMessage(message, context) {
    injectCommandHandlerIfNeed();
    // 触发自定义命令 替换为对应的命令
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

/**
 * 绑定命令到Telegram
 * @param {string} token
 * @returns {Promise<object>}
 */
export async function bindCommandForTelegram(token) {
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

/**
 * 获取所有命令的描述
 * @returns {{description: *, command: *}[]}
 */
export function commandsDocument() {
    return Object.keys(commandHandlers).map((key) => {
        return {
            command: key,
            description: ENV.I18N.command.help[key.substring(1)],
        };
    });
}
