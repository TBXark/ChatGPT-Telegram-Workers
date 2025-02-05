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

export class Gorq implements ChatAgent {
    readonly name = 'gorq';
    readonly modelKey = getAgentUserConfigFieldName('GORQ_CHAT_MODEL');

    readonly fieldGetter = agentConfigFieldGetter(
        'GORQ_API_BASE',
        'GORQ_API_KEY',
        'GORQ_CHAT_MODEL',
        'GORQ_CHAT_MODELS_LIST',
    );

    readonly enable = createAgentEnable(this.fieldGetter);
    readonly model = createAgentModel(this.fieldGetter);
    readonly modelList = createAgentModelList(this.fieldGetter);
    readonly request = createOpenAIRequest(defaultOpenAIRequestBuilder(this.fieldGetter));
}
