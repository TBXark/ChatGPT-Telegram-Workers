import '../config/env.test';
import { ENV } from '../config/env';
import type { LLMChatParams } from './types';
import { loadChatLLM } from './index';

{
    const agent = loadChatLLM({
        ...ENV.USER_CONFIG,
        AI_PROVIDER: 'anthropic',
    });
    const params: LLMChatParams = {
        prompt: 'You are a useful assistant.',
        message: 'What is your name?',
        history: [],
    };
    console.log(agent?.name, agent?.model(ENV.USER_CONFIG));
    agent?.request(params, ENV.USER_CONFIG, async (text) => {
        console.log(text);
    }).then((res) => {
        console.log(res);
    });
}
