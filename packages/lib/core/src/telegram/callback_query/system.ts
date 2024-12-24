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
        this.createKeyboard = this.createKeyboard.bind(this);
    }

    static Chat(): AgentListCallbackQueryHandler {
        return new AgentListCallbackQueryHandler('al:', 'ca:', () => {
            return CHAT_AGENTS.filter(agent => agent.enable(ENV.USER_CONFIG)).map(agent => agent.name);
        });
    }

    static Image(): AgentListCallbackQueryHandler {
        return new AgentListCallbackQueryHandler('ial:', 'ica:', () => {
            return IMAGE_AGENTS.filter(agent => agent.enable(ENV.USER_CONFIG)).map(agent => agent.name);
        });
    }

    handle = async (query: Telegram.CallbackQuery, data: string, context: WorkerContext): Promise<Response> => {
        const names = this.agentLoader();
        const sender = MessageSender.fromCallbackQuery(context.SHARE_CONTEXT.botToken, query);
        const params: Telegram.EditMessageTextParams = {
            chat_id: query.message?.chat.id || 0,
            message_id: query.message?.message_id || 0,
            text: ENV.I18N.callback_query.select_provider,
            reply_markup: {
                inline_keyboard: this.createKeyboard(names),
            },
        };
        return sender.editRawMessage(params);
    };

    private createKeyboard(names: string[]) {
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
        return keyboards;
    }
}

type AgentLoader = (conf: AgentUserConfig) => ChatAgent | ImageAgent | null;
type ChangeAgentType = (conf: AgentUserConfig, agent: string) => AgentUserConfig;
type CreateAgentChange = (agent: string, modelKey: string, model: string) => Record<string, string>;

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

function loadAgentContext<T = any>(
    query: Telegram.CallbackQuery,
    data: string,
    context: WorkerContext,
    prefix: string,
    agentLoader: AgentLoader,
    changeAgentType: ChangeAgentType,
): { sender: MessageSender; params: T[]; agent: ChatAgent | ImageAgent; conf: AgentUserConfig } {
    if (!query.message) {
        throw new Error('no message');
    }
    const sender = MessageSender.fromCallbackQuery(context.SHARE_CONTEXT.botToken, query);
    const params = JSON.parse(data.substring(prefix.length));
    const agent = Array.isArray(params) ? params.at(0) : null;
    if (!agent) {
        throw new Error(`agent not found: ${agent}`);
    }
    const conf: AgentUserConfig = changeAgentType(ENV.USER_CONFIG, agent);
    const theAgent = agentLoader(conf);
    if (!theAgent?.modelKey) {
        throw new Error(`modelKey not found: ${agent}`);
    }
    return { sender, params, agent: theAgent, conf };
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
        this.createKeyboard = this.createKeyboard.bind(this);
    }

    static Chat(): ModelListCallbackQueryHandler {
        return new ModelListCallbackQueryHandler('ca:', 'al:', 'cm:', loadChatLLM, changeChatAgentType);
    }

    static Image(): ModelListCallbackQueryHandler {
        return new ModelListCallbackQueryHandler('ica:', 'ial:', 'icm:', loadImageGen, changeImageAgentType);
    }

    async handle(query: Telegram.CallbackQuery, data: string, context: WorkerContext): Promise<Response> {
        const { sender, params, agent: theAgent, conf } = loadAgentContext(query, data, context, this.prefix, this.agentLoader, this.changeAgentType);
        const [agent, page] = params;
        const models = await theAgent.modelList(conf);
        const message: Telegram.EditMessageTextParams = {
            chat_id: query.message?.chat.id || 0,
            message_id: query.message?.message_id || 0,
            text: `${agent}  ${ENV.I18N.callback_query.select_model}`,
            reply_markup: {
                inline_keyboard: await this.createKeyboard(models, agent, page),
            },
        };
        return sender.editRawMessage(message);
    }

    private async createKeyboard(models: string[], agent: string, page: number) {
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
        return keyboard;
    }
}

function changeChatAgentModel(agent: string, modelKey: string, model: string): Record<string, string> {
    return {
        AI_PROVIDER: agent,
        [modelKey]: model,
    };
}

function changeImageAgentModel(agent: string, modelKey: string, model: string): Record<string, string> {
    return {
        AI_IMAGE_PROVIDER: agent,
        [modelKey]: model,
    };
}

export class ModelChangeCallbackQueryHandler implements CallbackQueryHandler {
    prefix: string;
    agentLoader: AgentLoader;
    changeAgentType: ChangeAgentType;
    createAgentChange: CreateAgentChange;

    needAuth = TELEGRAM_AUTH_CHECKER.shareModeGroup;

    constructor(prefix: string, agentLoader: AgentLoader, changeAgentType: ChangeAgentType, createAgentChange: CreateAgentChange) {
        this.prefix = prefix;
        this.agentLoader = agentLoader;
        this.changeAgentType = changeAgentType;
        this.createAgentChange = createAgentChange;
    }

    static Chat(): ModelChangeCallbackQueryHandler {
        return new ModelChangeCallbackQueryHandler('cm:', loadChatLLM, changeChatAgentType, changeChatAgentModel);
    }

    static Image(): ModelChangeCallbackQueryHandler {
        return new ModelChangeCallbackQueryHandler('icm:', loadImageGen, changeImageAgentType, changeImageAgentModel);
    }

    async handle(query: Telegram.CallbackQuery, data: string, context: WorkerContext): Promise<Response> {
        const { sender, params, agent: theAgent } = loadAgentContext(query, data, context, this.prefix, this.agentLoader, this.changeAgentType);
        const [agent, model] = params;
        await context.execChangeAndSave(this.createAgentChange(agent, theAgent.modelKey, model));
        console.log('Change model:', agent, model);
        const message: Telegram.EditMessageTextParams = {
            chat_id: query.message?.chat.id || 0,
            message_id: query.message?.message_id || 0,
            text: `${ENV.I18N.callback_query.change_model} ${agent} > ${model}`,
        };
        return sender.editRawMessage(message);
    }
}
