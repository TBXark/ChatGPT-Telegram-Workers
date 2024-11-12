import type { WorkerContext } from '../config/context';
import type { ChatAgent, HistoryItem, HistoryModifier, LLMChatParams, UserMessageItem } from './types';
import { ENV } from '../config/env';
import { extractTextContent } from './utils';

/**
 * @returns {(function(string): number)}
 */
function tokensCounter(): (text: string) => number {
    return (text) => {
        return text.length;
    };
}

async function loadHistory(key: string): Promise<HistoryItem[]> {
    // 加载历史记录
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

    const trimHistory = (list: HistoryItem[], initLength: number, maxLength: number, maxToken: number) => {
    // 历史记录超出长度需要裁剪, 小于0不裁剪
        if (maxLength >= 0 && list.length > maxLength) {
            list = list.splice(list.length - maxLength);
        }
        // 处理token长度问题, 小于0不裁剪
        if (maxToken > 0) {
            let tokenLength = initLength;
            for (let i = list.length - 1; i >= 0; i--) {
                const historyItem = list[i];
                let length = 0;
                if (historyItem.content) {
                    length = counter(extractTextContent(historyItem));
                } else {
                    historyItem.content = '';
                }
                // 如果最大长度超过maxToken,裁剪history
                tokenLength += length;
                if (tokenLength > maxToken) {
                    list = list.splice(i + 1);
                    break;
                }
            }
        }
        return list;
    };

    // 裁剪
    if (ENV.AUTO_TRIM_HISTORY && ENV.MAX_HISTORY_LENGTH > 0) {
        history = trimHistory(history, 0, ENV.MAX_HISTORY_LENGTH, ENV.MAX_TOKEN_LENGTH);
    }

    return history;
}

export type StreamResultHandler = (text: string) => Promise<any>;

export async function requestCompletionsFromLLM(params: UserMessageItem | null, context: WorkerContext, agent: ChatAgent, modifier: HistoryModifier | null, onStream: StreamResultHandler | null): Promise<string> {
    const historyDisable = ENV.AUTO_TRIM_HISTORY && ENV.MAX_HISTORY_LENGTH <= 0;
    const historyKey = context.SHARE_CONTEXT.chatHistoryKey;
    if (!historyKey) {
        throw new Error('History key not found');
    }
    let history = await loadHistory(historyKey);
    if (modifier) {
        const modifierData = modifier(history, params || null);
        history = modifierData.history;
        params = modifierData.message;
    }
    if (!params) {
        throw new Error('Message is empty');
    }
    history.push(params);
    const llmParams: LLMChatParams = {
        prompt: context.USER_CONFIG.SYSTEM_INIT_MESSAGE || undefined,
        messages: history,
    };
    const { text, responses } = await agent.request(llmParams, context.USER_CONFIG, onStream);
    if (!historyDisable) {
        if (ENV.HISTORY_IMAGE_PLACEHOLDER) {
            // TODO: Add image placeholder
        }
        history.push(params);
        history.push(...responses);
        await ENV.DATABASE.put(historyKey, JSON.stringify(history)).catch(console.error);
    }
    return text;
}
