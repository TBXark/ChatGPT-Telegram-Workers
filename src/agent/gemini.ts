import type { AgentUserConfig } from '../config/config';
import type { ChatAgent, ChatStreamTextHandler, HistoryItem, LLMChatParams } from './types';

export class Gemini implements ChatAgent {
    readonly name = 'gemini';
    readonly modelKey = 'GOOGLE_COMPLETIONS_MODEL';

    static GEMINI_ROLE_MAP: Record<string, string> = {
        assistant: 'model',
        system: 'user',
        user: 'user',
    };

    readonly enable = (context: AgentUserConfig): boolean => {
        return !!(context.GOOGLE_API_KEY);
    };

    readonly model = (ctx: AgentUserConfig): string => {
        return ctx.GOOGLE_COMPLETIONS_MODEL;
    };

    private render = (item: HistoryItem): object => {
        return {
            role: Gemini.GEMINI_ROLE_MAP[item.role],
            parts: [
                {
                    text: item.content || '',
                },
            ],
        };
    };

    readonly request = async (params: LLMChatParams, context: AgentUserConfig, onStream: ChatStreamTextHandler | null): Promise<string> => {
        const { message, prompt, history } = params;
        if (onStream !== null) {
            console.warn('Stream mode is not supported');
        }
        const url = `${context.GOOGLE_COMPLETIONS_API}${context.GOOGLE_COMPLETIONS_MODEL}:${
            // 暂时不支持stream模式
            // onStream ? 'streamGenerateContent' : 'generateContent'
            'generateContent'
        }?key=${context.GOOGLE_API_KEY}`;

        const contentsTemp = [...history || [], { role: 'user', content: message }];
        if (prompt) {
            contentsTemp.unshift({ role: 'assistant', content: prompt });
        }
        const contents: any[] = [];
        // role必须是 model,user 而且不能连续两个一样
        for (const msg of contentsTemp) {
            msg.role = Gemini.GEMINI_ROLE_MAP[msg.role];
            // 如果存在最后一个元素或role不一样则插入
            if (contents.length === 0 || contents[contents.length - 1].role !== msg.role) {
                contents.push(this.render(msg));
            } else {
                // 否则合并
                contents[contents.length - 1].parts[0].text += msg.content;
            }
        }

        const resp = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ contents }),
        });
        const data = await resp.json() as any;
        try {
            return data.candidates[0].content.parts[0].text;
        } catch (e) {
            console.error(e);
            if (!data) {
                throw new Error('Empty response');
            }
            throw new Error(data?.error?.message || JSON.stringify(data));
        }
    };
}
