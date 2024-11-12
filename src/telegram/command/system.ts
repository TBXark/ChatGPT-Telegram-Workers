import type * as Telegram from 'telegram-bot-api-types';
import type { HistoryItem, HistoryModifierResult, UserMessageItem } from '../../agent/types';
import type { WorkerContext } from '../../config/context';
import type { CommandHandler } from './types';
import { loadChatLLM, loadImageGen } from '../../agent';
import { ENV } from '../../config/env';
import { ConfigMerger } from '../../config/merger';
import { createTelegramBotAPI } from '../api';
import { TELEGRAM_AUTH_CHECKER } from '../auth/auth';
import { chatWithLLM } from '../handler/chat';
import { MessageSender } from '../utils/send';
import { isTelegramChatTypeGroup, setUserConfig } from '../utils/utils';

export class ImgCommandHandler implements CommandHandler {
    command = '/img';
    scopes = ['all_private_chats', 'all_chat_administrators'];
    handle = async (message: Telegram.Message, subcommand: string, context: WorkerContext): Promise<Response> => {
        const sender = MessageSender.fromMessage(context.SHARE_CONTEXT.botToken, message);
        if (subcommand === '') {
            return sender.sendPlainText(ENV.I18N.command.help.img);
        }
        try {
            const api = createTelegramBotAPI(context.SHARE_CONTEXT.botToken);
            const agent = loadImageGen(context.USER_CONFIG);
            if (!agent) {
                return sender.sendPlainText('ERROR: Image generator not found');
            }
            setTimeout(() => api.sendChatAction({
                chat_id: message.chat.id,
                action: 'upload_photo',
            }).catch(console.error), 0);
            const img = await agent.request(subcommand, context.USER_CONFIG);
            const resp = await sender.sendPhoto(img);
            if (!resp.ok) {
                return sender.sendPlainText(`ERROR: ${resp.statusText} ${await resp.text()}`);
            }
            return resp;
        } catch (e) {
            return sender.sendPlainText(`ERROR: ${(e as Error).message}`);
        }
    };
}

export class HelpCommandHandler implements CommandHandler {
    command = '/help';
    scopes = ['all_private_chats', 'all_chat_administrators'];
    handle = async (message: Telegram.Message, subcommand: string, context: WorkerContext): Promise<Response> => {
        const sender = MessageSender.fromMessage(context.SHARE_CONTEXT.botToken, message);
        let helpMsg = `${ENV.I18N.command.help.summary}\n`;
        for (const [k, v] of Object.entries(ENV.I18N.command.help)) {
            if (k === 'summary') {
                continue;
            }
            helpMsg += `/${k}：${v}\n`;
        }
        for (const [k, v] of Object.entries(ENV.CUSTOM_COMMAND)) {
            if (v.description) {
                helpMsg += `${k}：${v.description}\n`;
            }
        }
        for (const [k, v] of Object.entries(ENV.PLUGINS_COMMAND)) {
            if (v.description) {
                helpMsg += `${k}：${v.description}\n`;
            }
        }
        return sender.sendPlainText(helpMsg);
    };
}

class BaseNewCommandHandler {
    static async handle(showID: boolean, message: Telegram.Message, subcommand: string, context: WorkerContext): Promise<Response> {
        await ENV.DATABASE.delete(context.SHARE_CONTEXT.chatHistoryKey);
        const text = ENV.I18N.command.new.new_chat_start + (showID ? `(${message.chat.id})` : '');
        const params: Telegram.SendMessageParams = {
            chat_id: message.chat.id,
            text,
        };
        if (ENV.SHOW_REPLY_BUTTON && !isTelegramChatTypeGroup(message.chat.type)) {
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
        return createTelegramBotAPI(context.SHARE_CONTEXT.botToken).sendMessage(params);
    }
}

export class NewCommandHandler extends BaseNewCommandHandler implements CommandHandler {
    command = '/new';
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
    needAuth = TELEGRAM_AUTH_CHECKER.shareModeGroup;
    handle = async (message: Telegram.Message, subcommand: string, context: WorkerContext): Promise<Response> => {
        const sender = MessageSender.fromMessage(context.SHARE_CONTEXT.botToken, message);
        const kv = subcommand.indexOf('=');
        if (kv === -1) {
            return sender.sendPlainText(ENV.I18N.command.help.setenv);
        }
        const key = subcommand.slice(0, kv);
        const value = subcommand.slice(kv + 1);
        try {
            await setUserConfig({ [key]: value }, context);
            return sender.sendPlainText('Update user config success');
        } catch (e) {
            return sender.sendPlainText(`ERROR: ${(e as Error).message}`);
        }
    };
}

export class SetEnvsCommandHandler implements CommandHandler {
    command = '/setenvs';
    needAuth = TELEGRAM_AUTH_CHECKER.shareModeGroup;
    handle = async (message: Telegram.Message, subcommand: string, context: WorkerContext): Promise<Response> => {
        const sender = MessageSender.fromMessage(context.SHARE_CONTEXT.botToken, message);
        try {
            const values = JSON.parse(subcommand);
            await setUserConfig(values, context);
            return sender.sendPlainText('Update user config success');
        } catch (e) {
            return sender.sendPlainText(`ERROR: ${(e as Error).message}`);
        }
    };
}

export class DelEnvCommandHandler implements CommandHandler {
    command = '/delenv';
    needAuth = TELEGRAM_AUTH_CHECKER.shareModeGroup;
    handle = async (message: Telegram.Message, subcommand: string, context: WorkerContext): Promise<Response> => {
        const sender = MessageSender.fromMessage(context.SHARE_CONTEXT.botToken, message);
        if (ENV.LOCK_USER_CONFIG_KEYS.includes(subcommand)) {
            const msg = `Key ${subcommand} is locked`;
            return sender.sendPlainText(msg);
        }
        try {
            context.USER_CONFIG[subcommand] = null;
            context.USER_CONFIG.DEFINE_KEYS = context.USER_CONFIG.DEFINE_KEYS.filter(key => key !== subcommand);
            await ENV.DATABASE.put(
                context.SHARE_CONTEXT.configStoreKey,
                JSON.stringify(ConfigMerger.trim(context.USER_CONFIG, ENV.LOCK_USER_CONFIG_KEYS)),
            );
            return sender.sendPlainText('Delete user config success');
        } catch (e) {
            return sender.sendPlainText(`ERROR: ${(e as Error).message}`);
        }
    };
}

export class ClearEnvCommandHandler implements CommandHandler {
    command = '/clearenv';
    needAuth = TELEGRAM_AUTH_CHECKER.shareModeGroup;
    handle = async (message: Telegram.Message, subcommand: string, context: WorkerContext): Promise<Response> => {
        const sender = MessageSender.fromMessage(context.SHARE_CONTEXT.botToken, message);
        try {
            await ENV.DATABASE.put(
                context.SHARE_CONTEXT.configStoreKey,
                JSON.stringify({}),
            );
            return sender.sendPlainText('Clear user config success');
        } catch (e) {
            return sender.sendPlainText(`ERROR: ${(e as Error).message}`);
        }
        ;
    };
}

export class VersionCommandHandler implements CommandHandler {
    command = '/version';
    scopes = ['all_private_chats', 'all_chat_administrators'];
    handle = async (message: Telegram.Message, subcommand: string, context: WorkerContext): Promise<Response> => {
        const sender = MessageSender.fromMessage(context.SHARE_CONTEXT.botToken, message);
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
                const text = `New version detected: ${online.sha}(${timeFormat(online.ts)})\nCurrent version: ${current.sha}(${timeFormat(current.ts)})`;
                return sender.sendPlainText(text);
            } else {
                const text = `Current version: ${current.sha}(${timeFormat(current.ts)}) is up to date`;
                return sender.sendPlainText(text);
            }
        } catch (e) {
            return sender.sendPlainText(`ERROR: ${(e as Error).message}`);
        }
    };
}

export class SystemCommandHandler implements CommandHandler {
    command = '/system';
    scopes = ['all_private_chats', 'all_chat_administrators'];
    handle = async (message: Telegram.Message, subcommand: string, context: WorkerContext): Promise<Response> => {
        const sender = MessageSender.fromMessage(context.SHARE_CONTEXT.botToken, message);
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
            shareCtx.botToken = '******';
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
            const config = ConfigMerger.trim(context.USER_CONFIG, ENV.LOCK_USER_CONFIG_KEYS);
            msg = `<pre>\n${msg}`;
            msg += `USER_CONFIG: ${JSON.stringify(config, null, 2)}\n`;
            msg += `CHAT_CONTEXT: ${JSON.stringify(sender.context || {}, null, 2)}\n`;
            msg += `SHARE_CONTEXT: ${JSON.stringify(shareCtx, null, 2)}\n`;
            msg += '</pre>';
        }
        return sender.sendRichText(msg, 'HTML');
    };
}

export class RedoCommandHandler implements CommandHandler {
    command = '/redo';
    scopes = ['all_private_chats', 'all_group_chats', 'all_chat_administrators'];
    handle = async (message: Telegram.Message, subcommand: string, context: WorkerContext): Promise<Response> => {
        const mf = (history: HistoryItem[], message: UserMessageItem | null): HistoryModifierResult => {
            let nextMessage = message;
            if (!(history && Array.isArray(history) && history.length > 0)) {
                throw new Error('History not found');
            }
            const historyCopy = structuredClone(history);
            while (true) {
                const data = historyCopy.pop();
                if (data === undefined || data === null) {
                    break;
                } else if (data.role === 'user') {
                    nextMessage = data;
                    break;
                }
            }
            if (subcommand) {
                nextMessage = {
                    role: 'user',
                    content: subcommand,
                };
            }
            if (nextMessage === null) {
                throw new Error('Redo message not found');
            }
            return { history: historyCopy, message: nextMessage };
        };
        return chatWithLLM(message, null, context, mf);
    };
}

export class ModelsCommandHandler implements CommandHandler {
    command = '/models';
    scopes = ['all_private_chats', 'all_group_chats', 'all_chat_administrators'];
    handle = async (message: Telegram.Message, subcommand: string, context: WorkerContext): Promise<Response> => {
        const sender = MessageSender.fromMessage(context.SHARE_CONTEXT.botToken, message);
        const chatAgent = loadChatLLM(context.USER_CONFIG);
        const params: Telegram.SendMessageParams = {
            chat_id: message.chat.id,
            text: `${chatAgent?.name || 'Nan'} | ${chatAgent?.model(context.USER_CONFIG) || 'Nan'}`,
            reply_markup: {
                inline_keyboard: [[
                    {
                        text: ENV.I18N.callback_query.open_model_list,
                        callback_data: 'al:',
                    },
                ]],
            },
        };
        return sender.sendRawMessage(params);
    };
}

export class EchoCommandHandler implements CommandHandler {
    command = '/echo';
    handle = (message: Telegram.Message, subcommand: string, context: WorkerContext): Promise<Response> => {
        let msg = '<pre>';
        msg += JSON.stringify({ message }, null, 2);
        msg += '</pre>';
        return MessageSender.fromMessage(context.SHARE_CONTEXT.botToken, message).sendRichText(msg, 'HTML');
    };
}
