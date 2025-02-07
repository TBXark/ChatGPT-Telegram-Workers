import type { AgentUserConfig } from '#/config';
import type {
    ChatAgent,
} from './types';
import {
    agentConfigFieldGetter,
    createAgentEnable,
    createAgentModel,
    createOpenAIRequest,
    defaultOpenAIRequestBuilder,
    ImageSupportFormat,
} from '#/agent/openai_compatibility';
import { getAgentUserConfigFieldName, loadModelsList } from './utils';

export class Gemini implements ChatAgent {
    readonly name = 'gemini';
    readonly modelKey = getAgentUserConfigFieldName('GOOGLE_COMPLETIONS_MODEL');

    readonly fieldGetter = agentConfigFieldGetter({
        base: 'GOOGLE_API_BASE',
        key: 'GOOGLE_API_KEY',
        model: 'GOOGLE_CHAT_MODEL',
        modelsList: 'GOOGLE_CHAT_MODELS_LIST',
        extraParams: 'GOOGLE_CHAT_EXTRA_PARAMS',
    });

    readonly enable = createAgentEnable(this.fieldGetter);
    readonly model = createAgentModel(this.fieldGetter);
    readonly request = createOpenAIRequest(defaultOpenAIRequestBuilder(this.fieldGetter, '/openai/chat/completions', [ImageSupportFormat.BASE64]));

    readonly modelList = async (context: AgentUserConfig): Promise<string[]> => {
        if (context.GOOGLE_CHAT_MODELS_LIST === '') {
            context.GOOGLE_CHAT_MODELS_LIST = `${context.GOOGLE_API_BASE}/models`;
        }
        return loadModelsList(context.GOOGLE_CHAT_MODELS_LIST, async (url): Promise<string[]> => {
            const data = await fetch(`${url}?key=${context.GOOGLE_API_KEY}`).then(r => r.json());
            return data?.models
                ?.filter((model: any) => model.supportedGenerationMethods?.includes('generateContent'))
                .map((model: any) => model.name.split('/').pop()) ?? [];
        });
    };
}
