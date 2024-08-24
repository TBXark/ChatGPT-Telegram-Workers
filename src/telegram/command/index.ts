import { CUSTOM_COMMAND, ENV, PLUGINS_COMMAND } from '../../config/env';
import type { WorkerContext } from '../../config/context';
import type { RequestTemplate } from '../../plugins/template';
import { executeRequest, formatInput } from '../../plugins/template';
import type { Telegram } from '../../types/telegram';
import { sendMessageToTelegramWithContext, sendPhotoToTelegramWithContext } from '../utils/send';
import type { CommandHandler } from './type';
import {
    ClearEnvCommandHandler,
    DelEnvCommandHandler,
    EchoCommandHandler,
    HelpCommandHandler,
    ImgCommandHandler,
    NewCommandHandler,
    RedoCommandHandler,
    SetEnvCommandHandler,
    SetEnvsCommandHandler,
    StartCommandHandler,
    SystemCommandHandler,
    VersionCommandHandler,
} from './system';
import { loadChatRoleWithContext } from './auth';

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
    new HelpCommandHandler(),
];

async function handleSystemCommand(message: Telegram.Message, raw: string, command: CommandHandler, context: WorkerContext): Promise<Response> {
    try {
        // 如果存在权限条件
        if (command.needAuth) {
            const roleList = command.needAuth(context.SHARE_CONTEXT.chatType);
            if (roleList) {
                // 获取身份并判断
                const chatRole = await loadChatRoleWithContext(context);
                if (chatRole === null) {
                    return sendMessageToTelegramWithContext(context)('ERROR: Get chat role failed');
                }
                if (!roleList.includes(chatRole)) {
                    return sendMessageToTelegramWithContext(context)(`ERROR: Permission denied, need ${roleList.join(' or ')}`);
                }
            }
        }
    } catch (e) {
        return sendMessageToTelegramWithContext(context)(`ERROR: ${(e as Error).message}`);
    }
    const subcommand = raw.substring(command.command.length).trim();
    try {
        return await command.handle(message, subcommand, context);
    } catch (e) {
        return sendMessageToTelegramWithContext(context)(`ERROR: ${(e as Error).message}`);
    }
}

async function handlePluginCommand(message: Telegram.Message, command: string, raw: string, template: RequestTemplate, context: WorkerContext): Promise<Response> {
    try {
        const subcommand = raw.substring(command.length).trim();
        const DATA = formatInput(subcommand, template.input?.type);
        const { type, content } = await executeRequest(template, {
            DATA,
            ENV: ENV.PLUGINS_ENV,
        });
        if (type === 'image') {
            return sendPhotoToTelegramWithContext(context)(content);
        }
        switch (type) {
            case 'html':
                context.CURRENT_CHAT_CONTEXT.parse_mode = 'HTML';
                break;
            case 'markdown':
                context.CURRENT_CHAT_CONTEXT.parse_mode = 'Markdown';
                break;
            case 'text':
            default:
                context.CURRENT_CHAT_CONTEXT.parse_mode = null;
                break;
        }
        return sendMessageToTelegramWithContext(context)(content);
    } catch (e) {
        const help = PLUGINS_COMMAND[command].description;
        return sendMessageToTelegramWithContext(context)(`ERROR: ${(e as Error).message}${help ? `\n${help}` : ''}`);
    }
}

export async function handleCommandMessage(message: Telegram.Message, context: WorkerContext): Promise<Response | null> {
    let text = (message.text || message.caption || '').trim();

    if (CUSTOM_COMMAND[text]) {
        // 替换自定义命令为系统命令
        text = CUSTOM_COMMAND[text].value;
    }

    if (ENV.DEV_MODE) {
        // 插入调试命令
        SYSTEM_COMMANDS.push(new EchoCommandHandler());
    }

    // 查找插件命令
    for (const key in PLUGINS_COMMAND) {
        if (text === key || text.startsWith(`${key} `)) {
            let template = PLUGINS_COMMAND[key].value.trim();
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
    const scopeCommandMap: Record<string, CommandHandler[]> = {
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
                scopeCommandMap[scope].push(cmd);
            }
        }
    }
    const result: Record<string, any> = {};
    for (const scope in scopeCommandMap) {
        result[scope] = {
            commands: scopeCommandMap[scope].map(command => ({
                command: command.command,
                description: command.help?.() || '',
            })),
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
            description: command.help?.() || '',
        };
    }).filter(item => item.description !== '');
}
