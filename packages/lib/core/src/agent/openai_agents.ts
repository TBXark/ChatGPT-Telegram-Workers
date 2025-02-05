import { OpenAICompatibilityAgent } from '#/agent/openai_compatibility';

export class DeepSeek extends OpenAICompatibilityAgent {
    constructor() {
        super('deepseek', {
            base: 'DEEPSEEK_API_BASE',
            key: 'DEEPSEEK_API_KEY',
            model: 'DEEPSEEK_CHAT_MODEL',
            modelsList: 'DEEPSEEK_CHAT_MODELS_LIST',
        });
    }
}

export class Gorq extends OpenAICompatibilityAgent {
    constructor() {
        super('gorq', {
            base: 'GORQ_API_BASE',
            key: 'GORQ_API_KEY',
            model: 'GORQ_CHAT_MODEL',
            modelsList: 'GORQ_CHAT_MODELS_LIST',
        });
    }
}

export class Mistral extends OpenAICompatibilityAgent {
    constructor() {
        super('mistral', {
            base: 'MISTRAL_API_BASE',
            key: 'MISTRAL_API_KEY',
            model: 'MISTRAL_CHAT_MODEL',
            modelsList: 'MISTRAL_CHAT_MODELS_LIST',
        });
    }
}
