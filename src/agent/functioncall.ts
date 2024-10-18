import type { AgentUserConfig } from '../config/env';
import type { SchemaData } from '../utils/functiontools/types';
import type { ChatStreamTextHandler, CompletionData } from './types';
import { ENV } from '../config/env';
import { requestChatCompletions } from './request';

interface FunctionCallResult {
    id: string;
    name: string;
    args: Record<string, any>;
}

interface ToolStruct {
    type: string;
    function: SchemaData;
    strict: boolean;
}

export function getValidToolStructs(tools: string[]): Record<string, ToolStruct> {
    return tools
        .filter(tool => tool in ENV.TOOLS)
        .reduce((acc, tool) => {
            acc[tool] = {
                type: 'function',
                function: ENV.TOOLS[tool].schema,
                strict: true,
            };
            return acc;
        }, {} as Record<string, ToolStruct>);
}

export class FunctionCall {
    options: any;
    tool_prompt = 'You can use the following tools:';
    user_tools: string[];

    constructor(context: AgentUserConfig, options: Record<string, any>) {
        this.options = JSON.parse(JSON.stringify(options));
        this.user_tools = context.USE_TOOLS;
    }

    async call(onStream: ChatStreamTextHandler | null): Promise<any> {
        return requestChatCompletions(this.options.url, this.options.header, this.options.body, onStream);
    }

    async exec(func: FunctionCallResult): Promise<string> {
        const { name, args } = func;
        let result = '';
        try {
            result = await ENV.TOOLS[name].func(args);
        } catch (e) {
            console.error(e);
        }
        return result;
    }

    async run(onStream: ChatStreamTextHandler | null): Promise<any> {
        const tools_struct = getValidToolStructs(this.user_tools);
        if (Object.keys(tools_struct).length === 0) {
            return '';
        }
        this.trimParams(tools_struct);
        let result = '';
        let loopCount = 0;
        while (loopCount < 3) {
            const llm_resp = await this.call(onStream);
            if (typeof llm_resp === 'string') {
                result = llm_resp;
                break;
            }
            const func_params = this.paramsExtract(llm_resp);

            if (func_params.length === 0) {
                break;
            }

            const func_result = await Promise.all(func_params.map(i => this.exec(i)));
            this.trimMessage(llm_resp, func_result);
            loopCount++;
        }
        return result;
    }

    trimParams(tools_struct: Record<string, ToolStruct>) {
        const toolDetails: [string, ToolStruct][] = Object.entries(tools_struct);
        let toolPrompts = toolDetails
            .map(([k, v]) => `##${k}\n\n###${v.function.description}`)
            .join('\n\n');
        toolPrompts = `\n\n${this.tool_prompt}${toolPrompts}`;
        if (this.options.body.messages[0].role === 'user') {
            this.options.body.messages.unshift({
                content: toolPrompts,
                role: 'system',
            });
        } else if (this.options.body.messages[0].role === 'system') {
            this.options.body.messages[0].content = `${this.options.body.messages[0].content}\n\n${toolPrompts}`;
        }
        this.options.body.tools = toolDetails.map(([, v]) => v);
        this.options.body.tool_choice = 'auto';
    }

    paramsExtract(llm_resp: CompletionData): FunctionCallResult[] {
        const tool_calls = llm_resp.tool_calls || [];
        return tool_calls.filter(i => this.user_tools.includes(i.function.name)).map(func => ({
            id: func.id,
            name: func.function.name,
            args: JSON.parse(func.function.arguments),
        }));
    }

    trimMessage(llm_content: CompletionData, func_result?: string[]) {
        const llm_result = [{ role: 'assistant', content: llm_content.content, tool_calls: llm_content.tool_calls }] as any[];
        if (!func_result) {
            return llm_result;
        }

        llm_result.push(...func_result.map((content, index) => ({
            role: 'tool',
            content,
            name: llm_content.tool_calls![index].function.name,
            tool_call_id: llm_content.tool_calls![index].id,
        })));

        this.options.body.messages.push(...llm_result);
    }
}
