import { interpolate } from './interpolate';

/**
 * TemplateInputType: 输入数据的类型,将Telegram输入的数据转换为对应的数据类型
 * json: JSON格式
 * space-separated: 以空格分隔的字符串
 * comma-separated: 以逗号分隔的字符串
 * text: 文本,不分割(默认值)
 */
export type TemplateInputType = 'json' | 'space-separated' | 'comma-separated' | 'text';

/**
 * TemplateBodyType: 请求体的类型
 * json: JSON格式, 此时对于content字段的值应该为一个对象,其中的key为固定值,Value支持插值
 * form: 表单格式, 此时对于content字段的值应该为一个对象,其中的key为固定值,Value支持插值
 * text: 文本格式, 此时对于content字段的值应该为一个字符串,支持插值
 */
export type TemplateBodyType = 'json' | 'form' | 'text';

/**
 * TemplateResponseType: 响应体的类型
 * json: JSON格式, 此时会将响应体解析为JSON格式交给下一个模板渲染
 * text: 文本格式, 此时会将响应体解析为文本格式交给下一个模板渲染
 */
export type TemplateResponseType = 'json' | 'text';

/**
 * TemplateOutputType: 输出数据的类型
 * text: 文本格式, 将渲染结果作为纯文本发送到telegram
 * image: 图片格式, 将渲染结果作为图片url发送到telegram
 * html: HTML格式, 将渲染结果作为HTML格式发送到telegram
 * markdown: Markdown格式, 将渲染结果作为Markdown格式发送到telegram
 */
export type TemplateOutputType = 'text' | 'image' | 'html' | 'markdown';

export interface RequestTemplate {
    url: string; // 必选, 支持插值
    method: string; // 必选, 固定值
    headers: { [key: string]: string }; // 可选, Key为固定值，Value支持插值
    input: {
        type: TemplateInputType;
        required: boolean; // 必选, 是否必须输入
    };
    query: { [key: string]: string }; // 可选, Key为固定值，Value支持插值
    body: {
        type: TemplateBodyType;
        content: { [key: string]: string } | string; // content为对象时Key为固定值，Value支持插值。content为字符串时支持插值
    };
    response: {
        content: { // 必选, 当请求成功时的处理
            input_type: TemplateResponseType;
            output_type: TemplateOutputType;
            output: string;
        };
        error: { // 必选, 当请求失败时的处理
            input_type: TemplateResponseType;
            output_type: TemplateOutputType;
            output: string;
        };
    };
}

function interpolateObject(obj: any, data: any): any {
    if (obj === null || obj === undefined) {
        return null;
    }
    if (typeof obj === 'string') {
        return interpolate(obj, data);
    }
    if (Array.isArray(obj)) {
        return obj.map(item => interpolateObject(item, data));
    }
    if (typeof obj === 'object') {
        const result: any = {};
        for (const [key, value] of Object.entries(obj)) {
            result[key] = interpolateObject(value, data);
        }
        return result;
    }
    return obj;
}

export async function executeRequest(template: RequestTemplate, data: any): Promise<{ content: string; type: TemplateOutputType }> {
    const urlRaw = interpolate(template.url, data, encodeURIComponent);
    const url = new URL(urlRaw);

    if (template.query) {
        for (const [key, value] of Object.entries(template.query)) {
            url.searchParams.append(key, interpolate(value, data));
        }
    }

    const method = template.method;
    const headers = Object.fromEntries(
        Object.entries(template.headers || {}).map(([key, value]) => {
            return [key, interpolate(value, data)];
        }),
    );
    for (const key of Object.keys(headers)) {
        if (headers[key] === null) {
            delete headers[key];
        }
    }

    let body = null;
    if (template.body) {
        if (template.body.type === 'json') {
            body = JSON.stringify(interpolateObject(template.body.content, data));
        } else if (template.body.type === 'form') {
            body = new URLSearchParams();
            for (const [key, value] of Object.entries(template.body.content)) {
                body.append(key, interpolate(value, data));
            }
        } else {
            body = interpolate(template.body.content as string, data);
        }
    }

    const response = await fetch(url, {
        method,
        headers,
        body,
    });

    const renderOutput = async (type: TemplateResponseType, temple: string, response: Response): Promise<string> => {
        switch (type) {
            case 'text':
                return interpolate(temple, await response.text());
            case 'json':
            default:
                return interpolate(temple, await response.json());
        }
    };
    if (!response.ok) {
        const content = await renderOutput(template.response?.error?.input_type, template.response.error?.output, response);
        return {
            type: template.response.error.output_type,
            content,
        };
    }
    const content = await renderOutput(template.response.content?.input_type, template.response.content?.output, response);
    return {
        type: template.response.content.output_type,
        content,
    };
}

export function formatInput(input: string, type: TemplateInputType): string | string[] | any {
    if (type === 'json') {
        return JSON.parse(input);
    } else if (type === 'space-separated') {
        return input.split(/\s+/);
    } else if (type === 'comma-separated') {
        return input.split(/\s*,\s*/);
    } else {
        return input;
    }
}
