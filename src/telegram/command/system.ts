import type { Telegram } from '../../types/telegram';
import type { WorkerContext } from '../../config/context';
import {
    CUSTOM_COMMAND,
    DATABASE,
    ENV,
    ENV_KEY_MAPPER,
    PLUGINS_COMMAND,
    mergeEnvironment,
} from '../../config/env';
import {
    sendMessageToTelegramWithContext,
    sendPhotoToTelegramWithContext,
} from '../utils/send';
import { isTelegramChatTypeGroup } from '../utils/utils';
import type { HistoryItem, HistoryModifierResult } from '../../agent/types';
import { chatWithLLM } from '../handler/chat';
import { loadChatLLM, loadImageGen } from '../../agent/agents';
import { createTelegramBotAPI } from '../api/api';
import type { CommandHandler } from './type';

export const COMMAND_AUTH_CHECKER = {
    default(chatType: string): string[] | null {
        if (isTelegramChatTypeGroup(chatType)) {
            return ['administrator', 'creator'];
        }
        return null;
    },
    shareModeGroup(chatType: string): string[] | null {
        if (isTelegramChatTypeGroup(chatType)) {
            // 每个人在群里有上下文的时候，不限制
            if (!ENV.GROUP_CHAT_BOT_SHARE_MODE) {
                return null;
            }
            return ['administrator', 'creator'];
        }
        return null;
    },
};

export class ImgCommandHandler implements CommandHandler {
    command = '/img';
    help = () => ENV.I18N.command.help.img;
    scopes = ['all_private_chats', 'all_chat_administrators'];
    handle = async (message: Telegram.Message, subcommand: string, context: WorkerContext): Promise<Response> => {
        if (subcommand === '') {
            return sendMessageToTelegramWithContext(context)(ENV.I18N.command.help.img);
        }
        try {
            const api = createTelegramBotAPI(context.SHARE_CONTEXT.currentBotToken);
            const agent = loadImageGen(context.USER_CONFIG);
            if (!agent) {
                return sendMessageToTelegramWithContext(context)('ERROR: Image generator not found');
            }
            setTimeout(() => api.sendChatAction({
                chat_id: context.CURRENT_CHAT_CONTEXT.chat_id,
                action: 'upload_photo',
            }).catch(console.error), 0);
            const img = await agent.request(subcommand, context.USER_CONFIG);
            const resp = await sendPhotoToTelegramWithContext(context)(img);
            if (!resp.ok) {
                return sendMessageToTelegramWithContext(context)(`ERROR: ${resp.statusText} ${await resp.text()}`);
            }
            return resp;
        } catch (e) {
            return sendMessageToTelegramWithContext(context)(`ERROR: ${(e as Error).message}`);
        }
    };
}

export class HelpCommandHandler implements CommandHandler {
    command = '/help';
    help = () => ENV.I18N.command.help.help;
    scopes = ['all_private_chats', 'all_chat_administrators'];
    handle = async (message: Telegram.Message, subcommand: string, context: WorkerContext): Promise<Response> => {
        let helpMsg = `${ENV.I18N.command.help.summary}\n`;
        for (const [k, v] of Object.entries(ENV.I18N.command.help)) {
            if (k === 'summary') {
                continue;
            }
            helpMsg += `/${k}：${v}\n`;
        }
        for (const [k, v] of Object.entries(CUSTOM_COMMAND)) {
            if (v.description) {
                helpMsg += `${k}：${v.description}\n`;
            }
        }
        for (const [k, v] of Object.entries(PLUGINS_COMMAND)) {
            if (v.description) {
                helpMsg += `${k}：${v.description}\n`;
            }
        }
        return sendMessageToTelegramWithContext(context)(helpMsg);
    };
}

class BaseNewCommandHandler {
    static async handle(showID: boolean, message: Telegram.Message, subcommand: string, context: WorkerContext): Promise<Response> {
        await DATABASE.delete(context.SHARE_CONTEXT.chatHistoryKey);
        const text = ENV.I18N.command.new.new_chat_start + (showID ? `(${context.CURRENT_CHAT_CONTEXT.chat_id})` : '');
        const params: Telegram.SendMessageParams = {
            chat_id: context.CURRENT_CHAT_CONTEXT.chat_id,
            text,
        };
        if (ENV.SHOW_REPLY_BUTTON && !isTelegramChatTypeGroup(context.SHARE_CONTEXT.chatType)) {
            params.reply_markup = {
                keyboard: [[{ text: '/new' }, { text: '/redo' }]],
                selective: true,
                resize_keyboard: true,
                one_time_keyboard: false,
            };
        } else {
            params.reply_markup = {
                remove_keyboard: true,
                selective: true,
            };
        }
        return createTelegramBotAPI(context.SHARE_CONTEXT.currentBotToken).sendMessage(params);
    }
}

export class NewCommandHandler extends BaseNewCommandHandler implements CommandHandler {
    command = '/new';
    help = () => ENV.I18N.command.help.new;
    scopes = ['all_private_chats', 'all_group_chats', 'all_chat_administrators'];
    handle = async (message: Telegram.Message, subcommand: string, context: WorkerContext): Promise<Response> => {
        return BaseNewCommandHandler.handle(false, message, subcommand, context);
    };
}

export class StartCommandHandler extends BaseNewCommandHandler implements CommandHandler {
    command = '/start';
    handle = async (message: Telegram.Message, subcommand: string, context: WorkerContext): Promise<Response> => {
        return BaseNewCommandHandler.handle(true, message, subcommand, context);
    };
}

export class SetEnvCommandHandler implements CommandHandler {
    command = '/setenv';
    help = () => ENV.I18N.command.help.setenv;
    needAuth = COMMAND_AUTH_CHECKER.shareModeGroup;
    handle = async (message: Telegram.Message, subcommand: string, context: WorkerContext): Promise<Response> => {
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
                JSON.stringify(context.USER_CONFIG.trim(ENV.LOCK_USER_CONFIG_KEYS)),
            );
            return sendMessageToTelegramWithContext(context)('Update user config success');
        } catch (e) {
            return sendMessageToTelegramWithContext(context)(`ERROR: ${(e as Error).message}`);
        }
    };
}

export class SetEnvsCommandHandler implements CommandHandler {
    command = '/setenvs';
    help = () => ENV.I18N.command.help.setenvs;
    needAuth = COMMAND_AUTH_CHECKER.shareModeGroup;
    handle = async (message: Telegram.Message, subcommand: string, context: WorkerContext): Promise<Response> => {
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
                JSON.stringify(context.USER_CONFIG.trim(ENV.LOCK_USER_CONFIG_KEYS)),
            );
            return sendMessageToTelegramWithContext(context)('Update user config success');
        } catch (e) {
            return sendMessageToTelegramWithContext(context)(`ERROR: ${(e as Error).message}`);
        }
    };
}

export class DelEnvCommandHandler implements CommandHandler {
    command = '/delenv';
    help = () => ENV.I18N.command.help.delenv;
    needAuth = COMMAND_AUTH_CHECKER.shareModeGroup;
    handle = async (message: Telegram.Message, subcommand: string, context: WorkerContext): Promise<Response> => {
        if (ENV.LOCK_USER_CONFIG_KEYS.includes(subcommand)) {
            const msg = `Key ${subcommand} is locked`;
            return sendMessageToTelegramWithContext(context)(msg);
        }
        try {
            context.USER_CONFIG[subcommand] = null;
            context.USER_CONFIG.DEFINE_KEYS = context.USER_CONFIG.DEFINE_KEYS.filter(key => key !== subcommand);
            await DATABASE.put(
                context.SHARE_CONTEXT.configStoreKey,
                JSON.stringify(context.USER_CONFIG.trim(ENV.LOCK_USER_CONFIG_KEYS)),
            );
            return sendMessageToTelegramWithContext(context)('Delete user config success');
        } catch (e) {
            return sendMessageToTelegramWithContext(context)(`ERROR: ${(e as Error).message}`);
        }
    };
}

export class ClearEnvCommandHandler implements CommandHandler {
    command = '/clearenv';
    needAuth = COMMAND_AUTH_CHECKER.shareModeGroup;
    handle = async (message: Telegram.Message, subcommand: string, context: WorkerContext): Promise<Response> => {
        try {
            await DATABASE.put(
                context.SHARE_CONTEXT.configStoreKey,
                JSON.stringify({}),
            );
            return sendMessageToTelegramWithContext(context)('Clear user config success');
        } catch (e) {
            return sendMessageToTelegramWithContext(context)(`ERROR: ${(e as Error).message}`);
        }
        ;
    };
}

export class VersionCommandHandler implements CommandHandler {
    command = '/version';
    help = () => ENV.I18N.command.help.version;
    scopes = ['all_private_chats', 'all_chat_administrators'];
    handle = async (message: Telegram.Message, subcommand: string, context: WorkerContext): Promise<Response> => {
        const current = {
            ts: ENV.BUILD_TIMESTAMP,
            sha: ENV.BUILD_VERSION,
        };

        try {
            const info = `https://raw.githubusercontent.com/TBXark/ChatGPT-Telegram-Workers/${ENV.UPDATE_BRANCH}/dist/buildinfo.json`;
            const online = await fetch(info).then(r => r.json()) as { ts: number; sha: string };
            const timeFormat = (ts: number): string => {
                return new Date(ts * 1000).toLocaleString('en-US', {});
            };
            if (current.ts < online.ts) {
                return sendMessageToTelegramWithContext(context)(`New version detected: ${online.sha}(${timeFormat(online.ts)})\nCurrent version: ${current.sha}(${timeFormat(current.ts)})`);
            } else {
                return sendMessageToTelegramWithContext(context)(`Current version: ${current.sha}(${timeFormat(current.ts)}) is up to date`);
            }
        } catch (e) {
            return sendMessageToTelegramWithContext(context)(`ERROR: ${(e as Error).message}`);
        }
    };
}

export class SystemCommandHandler implements CommandHandler {
    command = '/system';
    help = () => ENV.I18N.command.help.system;
    scopes = ['all_private_chats', 'all_chat_administrators'];
    handle = async (message: Telegram.Message, subcommand: string, context: WorkerContext): Promise<Response> => {
        const chatAgent = loadChatLLM(context.USER_CONFIG);
        const imageAgent = loadImageGen(context.USER_CONFIG);
        const agent = {
            AI_PROVIDER: chatAgent?.name,
            [chatAgent?.modelKey || 'AI_PROVIDER_NOT_FOUND']: chatAgent?.model(context.USER_CONFIG),
            AI_IMAGE_PROVIDER: imageAgent?.name,
            [imageAgent?.modelKey || 'AI_IMAGE_PROVIDER_NOT_FOUND']: imageAgent?.model(context.USER_CONFIG),
        };
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
            const config = context.USER_CONFIG.trim(ENV.LOCK_USER_CONFIG_KEYS);
            msg = `<pre>\n${msg}`;
            msg += `USER_CONFIG: ${JSON.stringify(config, null, 2)}\n`;
            msg += `CHAT_CONTEXT: ${JSON.stringify(context.CURRENT_CHAT_CONTEXT, null, 2)}\n`;
            msg += `SHARE_CONTEXT: ${JSON.stringify(shareCtx, null, 2)}\n`;
            msg += '</pre>';
        }
        context.CURRENT_CHAT_CONTEXT.parse_mode = 'HTML';
        return sendMessageToTelegramWithContext(context)(msg);
    };
}

export class RedoCommandHandler implements CommandHandler {
    command = '/redo';
    help = () => ENV.I18N.command.help.redo;
    scopes = ['all_private_chats', 'all_group_chats', 'all_chat_administrators'];
    handle = async (message: Telegram.Message, subcommand: string, context: WorkerContext): Promise<Response> => {
        const mf = (history: HistoryItem[], text: string | null): HistoryModifierResult => {
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
        return chatWithLLM({ message: null }, context, mf);
    };
}

export class EchoCommandHandler implements CommandHandler {
    command = '/echo';
    handle = (message: Telegram.Message, subcommand: string, context: WorkerContext): Promise<Response> => {
        let msg = '<pre>';
        msg += JSON.stringify({ message }, null, 2);
        msg += '</pre>';
        context.CURRENT_CHAT_CONTEXT.parse_mode = 'HTML';
        return sendMessageToTelegramWithContext(context)(msg);
    };
}
