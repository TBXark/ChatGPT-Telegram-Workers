import type { LLMChatParams } from './types';
import { ENV } from '../config/env';
import { loadChatLLM } from './index';
import '../config/env.test';

{
    const agent = loadChatLLM({
        ...ENV.USER_CONFIG,
        AI_PROVIDER: 'cohere',
    });
    const params: LLMChatParams = {
        prompt: 'You are a useful assistant.',
        messages: [
            {
                role: 'user',
                content: 'What is your name?',
            },
        ],
    };
    console.log(agent?.name, agent?.model(ENV.USER_CONFIG));
    agent?.request(params, ENV.USER_CONFIG, async (text) => {
        console.log(text);
    }).then((res) => {
        console.log(res);
    });
}
