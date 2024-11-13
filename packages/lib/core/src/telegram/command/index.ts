import type * as Telegram from 'telegram-bot-api-types';
import type { WorkerContext } from '../../config/context';
import type { RequestTemplate } from '../../plugins/template';
import type { CommandHandler } from './types';
import { ENV } from '../../config/env';
import { executeRequest, formatInput } from '../../plugins/template';
import { MessageSender } from '../utils/send';
import { loadChatRoleWithContext } from './auth';
import {
    ClearEnvCommandHandler,
    DelEnvCommandHandler,
    EchoCommandHandler,
    HelpCommandHandler,
    ImgCommandHandler,
    ModelsCommandHandler,
    NewCommandHandler,
    RedoCommandHandler,
    SetEnvCommandHandler,
    SetEnvsCommandHandler,
    StartCommandHandler,
    SystemCommandHandler,
    VersionCommandHandler,
} from './system';

const SYSTEM_COMMANDS: CommandHandler[] = [
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
    new ModelsCommandHandler(),
    new HelpCommandHandler(),
];

async function handleSystemCommand(message: Telegram.Message, raw: string, command: CommandHandler, context: WorkerContext): Promise<Response> {
    const sender = MessageSender.fromMessage(context.SHARE_CONTEXT.botToken, message);
    try {
        const chatId = message.chat.id;
        const speakerId = message.from?.id || chatId;
        const chatType = message.chat.type;
        // 如果存在权限条件
        if (command.needAuth) {
            const roleList = command.needAuth(chatType);
            if (roleList) {
                // 获取身份并判断
                const chatRole = await loadChatRoleWithContext(chatId, speakerId, context);
                if (chatRole === null) {
                    return sender.sendPlainText('ERROR: Get chat role failed');
                }
                if (!roleList.includes(chatRole)) {
                    return sender.sendPlainText(`ERROR: Permission denied, need ${roleList.join(' or ')}`);
                }
            }
        }
    } catch (e) {
        return sender.sendPlainText(`ERROR: ${(e as Error).message}`);
    }
    const subcommand = raw.substring(command.command.length).trim();
    try {
        return await command.handle(message, subcommand, context);
    } catch (e) {
        return sender.sendPlainText(`ERROR: ${(e as Error).message}`);
    }
}

async function handlePluginCommand(message: Telegram.Message, command: string, raw: string, template: RequestTemplate, context: WorkerContext): Promise<Response> {
    const sender = MessageSender.fromMessage(context.SHARE_CONTEXT.botToken, message);
    try {
        const subcommand = raw.substring(command.length).trim();
        if (template.input?.required && !subcommand) {
            throw new Error('Missing required input');
        }
        const DATA = formatInput(subcommand, template.input?.type);
        const { type, content } = await executeRequest(template, {
            DATA,
            ENV: ENV.PLUGINS_ENV,
        });
        if (type === 'image') {
            return sender.sendPhoto(content);
        }
        switch (type) {
            case 'html':
                return sender.sendRichText(content, 'HTML');
            case 'markdown':
                return sender.sendRichText(content, 'Markdown');
            case 'text':
            default:
                return sender.sendPlainText(content);
        }
    } catch (e) {
        const help = ENV.PLUGINS_COMMAND[command].description;
        return sender.sendPlainText(`ERROR: ${(e as Error).message}${help ? `\n${help}` : ''}`);
    }
}

export async function handleCommandMessage(message: Telegram.Message, context: WorkerContext): Promise<Response | null> {
    let text = (message.text || message.caption || '').trim();

    if (ENV.CUSTOM_COMMAND[text]) {
        // 替换自定义命令为系统命令
        text = ENV.CUSTOM_COMMAND[text].value;
    }

    if (ENV.DEV_MODE) {
        // 插入调试命令
        SYSTEM_COMMANDS.push(new EchoCommandHandler());
    }

    // 查找插件命令
    for (const key in ENV.PLUGINS_COMMAND) {
        if (text === key || text.startsWith(`${key} `)) {
            let template = ENV.PLUGINS_COMMAND[key].value.trim();
            if (template.startsWith('http')) {
                template = await fetch(template).then(r => r.text());
            }
            return await handlePluginCommand(message, key, text, JSON.parse(template), context);
        }
    }

    // 查找系统命令
    for (const cmd of SYSTEM_COMMANDS) {
        if (text === cmd.command || text.startsWith(`${cmd.command} `)) {
            return await handleSystemCommand(message, text, cmd, context);
        }
    }
    return null;
}

export function commandsBindScope(): Record<string, Telegram.SetMyCommandsParams> {
    const scopeCommandMap: Record<string, Telegram.BotCommand[]> = {
        all_private_chats: [],
        all_group_chats: [],
        all_chat_administrators: [],
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
                const desc = ENV.I18N.command.help[cmd.command.substring(1)] || '';
                if (desc) {
                    scopeCommandMap[scope].push({
                        command: cmd.command,
                        description: desc,
                    });
                }
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
                        description: config.description || '',
                    });
                }
            }
        }
    }
    const result: Record<string, Telegram.SetMyCommandsParams> = {};
    for (const scope in scopeCommandMap) {
        result[scope] = {
            commands: scopeCommandMap[scope],
            scope: {
                type: scope,
            },
        };
    }
    return result;
}

export function commandsDocument(): { description: string; command: string }[] {
    return SYSTEM_COMMANDS.map((command) => {
        return {
            command: command.command,
            description: ENV.I18N.command.help[command.command.substring(1)] || '',
        };
    }).filter(item => item.description !== '');
}
