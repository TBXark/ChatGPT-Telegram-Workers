import type * as Telegram from 'telegram-bot-api-types';
import type { WorkerContext } from '../../config/context';
import type { AgentUserConfig } from '../../config/env';
import type { CallbackQueryHandler } from './types';
import { CHAT_AGENTS, loadChatLLM } from '../../agent';
import { ENV } from '../../config/env';
import { TELEGRAM_AUTH_CHECKER } from '../auth/auth';
import { MessageSender } from '../utils/send';
import { setUserConfig } from '../utils/utils';

export class AgentListCallbackQueryHandler implements CallbackQueryHandler {
    prefix = 'al:';

    needAuth = TELEGRAM_AUTH_CHECKER.shareModeGroup;

    handle = async (query: Telegram.CallbackQuery, data: string, context: WorkerContext): Promise<Response> => {
        if (!query.message) {
            throw new Error('no message');
        }
        const names = CHAT_AGENTS.filter(agent => agent.enable(ENV.USER_CONFIG)).map(agent => agent.name);
        const sender = MessageSender.fromCallbackQuery(context.SHARE_CONTEXT.botToken, query);
        const keyboards: Telegram.InlineKeyboardButton[][] = [];
        for (let i = 0; i < names.length; i += 2) {
            const row: Telegram.InlineKeyboardButton[] = [];
            for (let j = 0; j < 2; j++) {
                const index = i + j;
                if (index >= names.length) {
                    break;
                }
                row.push({
                    text: names[index],
                    callback_data: `ca:${JSON.stringify([names[index], 0])}`,
                });
            }
            keyboards.push(row);
        }
        const params: Telegram.EditMessageTextParams = {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id,
            text: ENV.I18N.callback_query.select_provider,
            reply_markup: {
                inline_keyboard: keyboards,
            },
        };
        return sender.editRawMessage(params);
    };
}

export class ModelListCallbackQueryHandler implements CallbackQueryHandler {
    prefix = 'ca:'; // ca:model:page

    needAuth = TELEGRAM_AUTH_CHECKER.shareModeGroup;

    async handle(query: Telegram.CallbackQuery, data: string, context: WorkerContext): Promise<Response> {
        if (!query.message) {
            throw new Error('no message');
        }
        const sender = MessageSender.fromCallbackQuery(context.SHARE_CONTEXT.botToken, query);
        const [agent, page] = JSON.parse(data.substring(this.prefix.length));
        const conf: AgentUserConfig = {
            ...ENV.USER_CONFIG,
            AI_PROVIDER: agent,
        };
        const chatAgent = loadChatLLM(conf);
        if (!chatAgent) {
            throw new Error(`agent not found: ${agent}`);
        }
        const models = await chatAgent.modelList(conf);
        const keyboard: Telegram.InlineKeyboardButton[][] = [];
        const maxRow = 10;
        const maxCol = Math.max(1, Math.min(5, ENV.MODEL_LIST_COLUMNS));
        const maxPage = Math.ceil(models.length / maxRow / maxCol);

        let currentRow: Telegram.InlineKeyboardButton[] = [];
        for (let i = page * maxRow * maxCol; i < models.length; i++) {
            if (i % maxCol === 0) {
                keyboard.push(currentRow);
                currentRow = [];
            }
            if (keyboard.length >= maxRow) {
                break;
            }
            currentRow.push({
                text: models[i],
                callback_data: `cm:${JSON.stringify([agent, models[i]])}`,
            });
        }
        if (currentRow.length > 0) {
            keyboard.push(currentRow);
            currentRow = [];
        }
        keyboard.push([
            {
                text: '<',
                callback_data: `ca:${JSON.stringify([agent, Math.max(page - 1, 0)])}`,
            },
            {
                text: `${page + 1}/${maxPage}`,
                callback_data: `ca:${JSON.stringify([agent, page])}`,
            },
            {
                text: '>',
                callback_data: `ca:${JSON.stringify([agent, Math.min(page + 1, maxPage - 1)])}`,
            },
            {
                text: '⇤',
                callback_data: `al:`,
            },
        ]);
        if (models.length > (page + 1) * maxRow * maxCol) {
            currentRow.push();
        }
        keyboard.push(currentRow);
        const message: Telegram.EditMessageTextParams = {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id,
            text: `${agent}  ${ENV.I18N.callback_query.select_model}`,
            reply_markup: {
                inline_keyboard: keyboard,
            },
        };
        return sender.editRawMessage(message);
    }
}

export class ModelChangeCallbackQueryHandler implements CallbackQueryHandler {
    prefix = 'cm:';

    needAuth = TELEGRAM_AUTH_CHECKER.shareModeGroup;

    async handle(query: Telegram.CallbackQuery, data: string, context: WorkerContext): Promise<Response> {
        if (!query.message) {
            throw new Error('no message');
        }
        const sender = MessageSender.fromCallbackQuery(context.SHARE_CONTEXT.botToken, query);
        const [agent, model] = JSON.parse(data.substring(this.prefix.length));
        const conf: AgentUserConfig = {
            ...ENV.USER_CONFIG,
            AI_PROVIDER: agent,
        };
        const chatAgent = loadChatLLM(conf);
        if (!agent) {
            throw new Error(`agent not found: ${agent}`);
        }
        if (!chatAgent?.modelKey) {
            throw new Error(`modelKey not found: ${agent}`);
        }
        await setUserConfig({
            AI_PROVIDER: agent,
            [chatAgent.modelKey]: model,
        }, context);
        const message: Telegram.EditMessageTextParams = {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id,
            text: `${ENV.I18N.callback_query.change_model} ${agent} > ${model}`,
        };
        return sender.editRawMessage(message);
    }
}
