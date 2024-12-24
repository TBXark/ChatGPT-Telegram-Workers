import type { AgentUserConfig } from '#/config';
import type {
    AgentEnable,
    AgentModel,
    AgentModelList,
    ChatAgent,
    ChatAgentRequest,
    ChatAgentResponse,
    ChatStreamTextHandler,
    LLMChatParams,
} from './types';
import { ImageSupportFormat, loadOpenAIModelList, renderOpenAIMessages } from '#/agent/openai_compatibility';
import { requestChatCompletions } from './request';
import { bearerHeader, convertStringToResponseMessages, getAgentUserConfigFieldName } from './utils';

export class Mistral implements ChatAgent {
    readonly name = 'mistral';
    readonly modelKey = getAgentUserConfigFieldName('MISTRAL_CHAT_MODEL');

    readonly enable: AgentEnable = ctx => !!(ctx.MISTRAL_API_KEY);
    readonly model: AgentModel = ctx => ctx.MISTRAL_CHAT_MODEL;
    readonly modelList: AgentModelList = ctx => loadOpenAIModelList(ctx.MISTRAL_CHAT_MODELS_LIST, ctx.MISTRAL_API_BASE, bearerHeader(ctx.MISTRAL_API_KEY));

    readonly request: ChatAgentRequest = async (params: LLMChatParams, context: AgentUserConfig, onStream: ChatStreamTextHandler | null): Promise<ChatAgentResponse> => {
        const { prompt, messages } = params;
        const url = `${context.MISTRAL_API_BASE}/chat/completions`;
        const header = bearerHeader(context.MISTRAL_API_KEY);

        const body = {
            model: context.MISTRAL_CHAT_MODEL,
            messages: await renderOpenAIMessages(prompt, messages, [ImageSupportFormat.URL]),
            stream: onStream != null,
        };

        return convertStringToResponseMessages(requestChatCompletions(url, header, body, onStream, null));
    };
}
