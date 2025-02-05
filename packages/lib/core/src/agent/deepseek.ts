import type {
    ChatAgent,
} from './types';
import {
    agentConfigFieldGetter,
    createAgentEnable,
    createAgentModel,
    createAgentModelList,
    createOpenAIRequest,
    defaultOpenAIRequestBuilder,
} from '#/agent/openai_compatibility';
import { getAgentUserConfigFieldName } from './utils';

export class DeepSeek implements ChatAgent {
    readonly name = 'deepseek';
    readonly modelKey = getAgentUserConfigFieldName('DEEPSEEK_API_KEY');

    readonly fieldGetter = agentConfigFieldGetter(
        'DEEPSEEK_API_BASE',
        'DEEPSEEK_API_KEY',
        'DEEPSEEK_CHAT_MODEL',
        'DEEPSEEK_CHAT_MODELS_LIST',
    );

    readonly enable = createAgentEnable(this.fieldGetter);
    readonly model = createAgentModel(this.fieldGetter);
    readonly modelList = createAgentModelList(this.fieldGetter);
    readonly request = createOpenAIRequest(defaultOpenAIRequestBuilder(this.fieldGetter));
}
