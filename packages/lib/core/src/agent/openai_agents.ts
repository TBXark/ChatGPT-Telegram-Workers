import { OpenAICompatibilityAgent } from '#/agent/openai_compatibility';

export class DeepSeek extends OpenAICompatibilityAgent {
    constructor() {
        super('deepseek', {
            base: 'DEEPSEEK_API_BASE',
            key: 'DEEPSEEK_API_KEY',
            model: 'DEEPSEEK_CHAT_MODEL',
            modelsList: 'DEEPSEEK_CHAT_MODELS_LIST',
            extraParams: 'DEEPSEEK_CHAT_EXTRA_PARAMS',
        });
    }
}

export class Groq extends OpenAICompatibilityAgent {
    constructor() {
        super('groq', {
            base: 'GROQ_API_BASE',
            key: 'GROQ_API_KEY',
            model: 'GROQ_CHAT_MODEL',
            modelsList: 'GROQ_CHAT_MODELS_LIST',
            extraParams: 'GROQ_CHAT_EXTRA_PARAMS',
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
            extraParams: 'MISTRAL_CHAT_EXTRA_PARAMS',
        });
    }
}
