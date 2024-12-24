import type { ChatAgent, ImageAgent } from '#/agent';
import type { AgentUserConfig, WorkerContext } from '#/config';
import type * as Telegram from 'telegram-bot-api-types';
import type { CallbackQueryHandler } from './types';
import { CHAT_AGENTS, IMAGE_AGENTS, loadChatLLM, loadImageGen } from '#/agent';
import { ENV } from '#/config';
import { TELEGRAM_AUTH_CHECKER } from '../auth';
import { MessageSender } from '../sender';

export class AgentListCallbackQueryHandler implements CallbackQueryHandler {
    prefix: string;
    changeAgentPrefix: string;
    agentLoader: () => string[];

    needAuth = TELEGRAM_AUTH_CHECKER.shareModeGroup;

    constructor(prefix: string, changeAgentPrefix: string, agentLoader: () => string[]) {
        this.agentLoader = agentLoader;
        this.prefix = prefix;
        this.changeAgentPrefix = changeAgentPrefix;
    }

    static NewChatAgentListCallbackQueryHandler(): AgentListCallbackQueryHandler {
        return new AgentListCallbackQueryHandler('al:', 'ca:', () => {
            return CHAT_AGENTS.filter(agent => agent.enable(ENV.USER_CONFIG)).map(agent => agent.name);
        });
    }

    static NewImageAgentListCallbackQueryHandler(): AgentListCallbackQueryHandler {
        return new AgentListCallbackQueryHandler('ial:', 'ica:', () => {
            return IMAGE_AGENTS.filter(agent => agent.enable(ENV.USER_CONFIG)).map(agent => agent.name);
        });
    }

    handle = async (query: Telegram.CallbackQuery, data: string, context: WorkerContext): Promise<Response> => {
        if (!query.message) {
            throw new Error('no message');
        }
        const names = this.agentLoader();
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
                    callback_data: `${this.changeAgentPrefix}${JSON.stringify([names[index], 0])}`,
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

type AgentLoader = (conf: AgentUserConfig) => ChatAgent | ImageAgent | null;
type ChangeAgentType = (conf: AgentUserConfig, agent: string) => AgentUserConfig;

function changeChatAgentType(conf: AgentUserConfig, agent: string): AgentUserConfig {
    return {
        ...conf,
        AI_PROVIDER: agent,
    };
}

function changeImageAgentType(conf: AgentUserConfig, agent: string): AgentUserConfig {
    return {
        ...conf,
        AI_IMAGE_PROVIDER: agent,
    };
}

export class ModelListCallbackQueryHandler implements CallbackQueryHandler {
    prefix: string;
    agentListPrefix: string;
    changeModelPrefix: string;

    agentLoader: AgentLoader;
    changeAgentType: ChangeAgentType;

    needAuth = TELEGRAM_AUTH_CHECKER.shareModeGroup;

    constructor(prefix: string, agentListPrefix: string, changeModelPrefix: string, agentLoader: AgentLoader, changeAgentType: ChangeAgentType) {
        this.prefix = prefix;
        this.agentListPrefix = agentListPrefix;
        this.changeModelPrefix = changeModelPrefix;
        this.agentLoader = agentLoader;
        this.changeAgentType = changeAgentType;
    }

    static NewChatModelListCallbackQueryHandler(): ModelListCallbackQueryHandler {
        return new ModelListCallbackQueryHandler('ca:', 'al:', 'cm:', loadChatLLM, changeChatAgentType);
    }

    static NewImageModelListCallbackQueryHandler(): ModelListCallbackQueryHandler {
        return new ModelListCallbackQueryHandler('ica:', 'ial:', 'icm:', loadImageGen, changeImageAgentType);
    }

    async handle(query: Telegram.CallbackQuery, data: string, context: WorkerContext): Promise<Response> {
        if (!query.message) {
            throw new Error('no message');
        }
        const sender = MessageSender.fromCallbackQuery(context.SHARE_CONTEXT.botToken, query);

        const [agent, page] = JSON.parse(data.substring(this.prefix.length));
        const conf: AgentUserConfig = this.changeAgentType(ENV.USER_CONFIG, agent);
        const theAgent = this.agentLoader(conf);
        if (!theAgent) {
            throw new Error(`agent not found: ${agent}`);
        }

        const models = await theAgent.modelList(conf);
        const keyboard: Telegram.InlineKeyboardButton[][] = [];
        const maxRow = 10;
        const maxCol = Math.max(1, Math.min(5, ENV.MODEL_LIST_COLUMNS));
        const maxPage = Math.ceil(models.length / maxRow / maxCol);

        let currentRow: Telegram.InlineKeyboardButton[] = [];
        for (let i = page * maxRow * maxCol; i < models.length; i++) {
            currentRow.push({
                text: models[i],
                callback_data: `${this.changeModelPrefix}${JSON.stringify([agent, models[i]])}`,
            });
            if (i % maxCol === 0) {
                keyboard.push(currentRow);
                currentRow = [];
            }
            if (keyboard.length >= maxRow) {
                break;
            }
        }
        if (currentRow.length > 0) {
            keyboard.push(currentRow);
            currentRow = [];
        }
        keyboard.push([
            {
                text: '<',
                callback_data: `${this.prefix}${JSON.stringify([agent, Math.max(page - 1, 0)])}`,
            },
            {
                text: `${page + 1}/${maxPage}`,
                callback_data: `${this.prefix}${JSON.stringify([agent, page])}`,
            },
            {
                text: '>',
                callback_data: `${this.prefix}${JSON.stringify([agent, Math.min(page + 1, maxPage - 1)])}`,
            },
            {
                text: '⇤',
                callback_data: this.agentListPrefix,
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
    prefix: string;
    agentLoader: AgentLoader;
    changeAgentType: ChangeAgentType;

    needAuth = TELEGRAM_AUTH_CHECKER.shareModeGroup;

    constructor(prefix: string, agentLoader: AgentLoader, changeAgentType: ChangeAgentType) {
        this.prefix = prefix;
        this.agentLoader = agentLoader;
        this.changeAgentType = changeAgentType;
    }

    static NewChatModelChangeCallbackQueryHandler(): ModelChangeCallbackQueryHandler {
        return new ModelChangeCallbackQueryHandler('cm:', loadChatLLM, changeChatAgentType);
    }

    static NewImageModelChangeCallbackQueryHandler(): ModelChangeCallbackQueryHandler {
        return new ModelChangeCallbackQueryHandler('icm:', loadChatLLM, changeImageAgentType);
    }

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
        const theAgent = this.agentLoader(conf);
        if (!agent) {
            throw new Error(`agent not found: ${agent}`);
        }
        if (!theAgent?.modelKey) {
            throw new Error(`modelKey not found: ${agent}`);
        }
        await context.execChangeAndSave({
            AI_PROVIDER: agent,
            [theAgent.modelKey]: model,
        });
        console.log('Change model:', agent, model);
        const message: Telegram.EditMessageTextParams = {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id,
            text: `${ENV.I18N.callback_query.change_model} ${agent} > ${model}`,
        };
        return sender.editRawMessage(message);
    }
}
