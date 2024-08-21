const INTERPOLATE_LOOP_REGEXP = /\{\{#each\s+(\w+)\s+in\s+([\w.[\]]+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
const INTERPOLATE_CONDITION_REGEXP = /\{\{#if\s+([\w.[\]]+)\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/if\}\}/g;
const INTERPOLATE_VARIABLE_REGEXP = /\{\{([\w.[\]]+)\}\}/g;

/**
 * @param {string} template
 * @param {any} data
 * @returns {string}
 */
function interpolate(template, data) {
    const evaluateExpression = (expr, localData) => {
        if (expr === '.')
            return localData['.'] ?? localData;

        try {
            return expr.split('.').reduce((value, key) => {
                if (key.includes('[') && key.includes(']')) {
                    const [arrayKey, indexStr] = key.split('[');
                    const index = Number.parseInt(indexStr, 10);
                    return value?.[arrayKey]?.[index];
                }
                return value?.[key];
            }, localData);
        } catch (error) {
            console.error(`Error evaluating expression: ${expr}`, error);
            return undefined;
        }
    };

    const processConditional = (condition, trueBlock, falseBlock, localData) => {
        const result = evaluateExpression(condition, localData);
        return result ? trueBlock : (falseBlock || '');
    };

    const processLoop = (itemName, arrayExpr, loopContent, localData) => {
        const array = evaluateExpression(arrayExpr, localData);
        if (!Array.isArray(array)) {
            console.warn(`Expression "${arrayExpr}" did not evaluate to an array`);
            return '';
        }
        return array.map((item) => {
            const itemData = { ...localData, [itemName]: item, '.': item };
            return interpolate(loopContent, itemData);
        }).join('');
    };

    const processTemplate = (tmpl, localData) => {
        tmpl = tmpl.replace(INTERPOLATE_LOOP_REGEXP, (_, itemName, arrayExpr, loopContent) =>
            processLoop(itemName, arrayExpr, loopContent, localData));

        tmpl = tmpl.replace(INTERPOLATE_CONDITION_REGEXP, (_, condition, trueBlock, falseBlock) =>
            processConditional(condition, trueBlock, falseBlock, localData));

        return tmpl.replace(INTERPOLATE_VARIABLE_REGEXP, (_, expr) => {
            const value = evaluateExpression(expr, localData);
            return value !== undefined ? String(value) : `{{${expr}}}`;
        });
    };

    return processTemplate(template, data);
}

/**
 * @param {any} obj
 * @param {any} data
 * @returns {{}|*|string|null}
 */
function interpolateObject(obj, data) {
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
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            result[key] = interpolateObject(value, data);
        }
        return result;
    }
    return obj;
}

// {
//     url: 'https://api.example.com/users/{{userId}}',
//     method: 'POST',
//     headers: {
//         'Content-Type': 'application/json',
//         'Authorization': 'Bearer {{token}}',
//     },
//     input: {
//       type: 'text', // 'json', 'space-separated', 'dot-separated'
//     },
//     query: {
//         'q': '{{query}}',
//     },
//     body: {
//         type: 'json', // or 'form' or 'text'
//           content: {
//             name: '{{name}}',
//             age: '{{age}}',
//         },
//     },
//     response: {
//         type: 'json', // or 'text'
//         content: {
//             type: 'text', // or image
//             output: 'Hello, {{name}}',
//         },
//         error: {
//             type: 'json', // or 'text'
//             content: {
//                 type: 'text', // or image
//                 output: 'Error: {{message}}',
//             },
//         }
//     },
// }

export const TemplateInputTypeJson = 'json';
export const TemplateInputTypeSpaceSeparated = 'space-separated';
export const TemplateInputTypeDotSeparated = 'dot-separated';

export const TemplateBodyTypeJson = 'json';
export const TemplateBodyTypeForm = 'form';
export const TemplateBodyTypeText = 'text';

export const TemplateResponseTypeJson = 'json';
export const TemplateResponseTypeText = 'text';

export const TemplateResponseContentTypeText = 'text';
export const TemplateResponseContentTypeImage = 'image';

/**
 * @typedef {object} RequestTemplate
 * @property {string} url
 * @property {string} method
 * @property {{[key: string]: string}} headers
 * @property {object} input
 * @property {string} input.type
 * @property {{[key: string]: string}} query
 * @property {object} body
 * @property {string} body.type
 * @property {{[key: string]: string} | string} body.content
 * @property {object} response
 * @property {string} response.type
 * @property {object} response.content
 * @property {string} response.content.type
 * @property {string} response.content.output
 */

/**
 * @param {RequestTemplate} template
 * @param {any} data
 * @returns {Promise<string>}
 */
export async function executeRequest(template, data) {
    const url = new URL(interpolate(template.url, data));

    if (template.query !== null) {
        for (const [key, value] of Object.entries(template.query)) {
            url.searchParams.append(key, interpolate(value, data));
        }
    }

    const method = template.method;
    const headers = Object.fromEntries(
        Object.entries(template.headers).map(([key, value]) => {
            return [key, interpolate(value, data)];
        }),
    );
    for (const key of Object.keys(headers)) {
        if (headers[key] === null) {
            delete headers[key];
        }
    }

    let body = null;
    if (template.body !== null) {
        if (template.body.type === 'json') {
            body = JSON.stringify(interpolateObject(template.body.content, data));
        } else if (template.body.type === 'form') {
            body = new URLSearchParams();
            for (const [key, value] of Object.entries(template.body.content)) {
                body.append(key, interpolate(value, data));
            }
        } else if (template.body.type === 'text') {
            body = interpolate(template.body.content, data);
        }
    }

    const response = await fetch(url, {
        method,
        headers,
        body,
    });

    if (!response.ok) {
        if (template.response?.error?.type === 'json') {
            return interpolate(template.response.error.content.output, await response.json());
        } else if (template.response?.error?.type === 'text') {
            return interpolate(template.response.error.content.output, await response.text());
        } else {
            return await response.text();
        }
    }

    if (template.response?.type === 'json') {
        return interpolate(template.response.content.output, await response.json());
    } else if (template.response?.type === 'text') {
        return interpolate(template.response.content.output, await response.text());
    } else {
        return await response.text();
    }
}

/**
 * @param {string} input
 * @param {string} type
 * @returns {string | string[] | object}
 */
export function formatInput(input, type) {
    if (type === 'json') {
        return JSON.parse(input);
    } else if (type === 'space-separated') {
        return input.split(' ');
    } else if (type === 'dot-separated') {
        return input.split('.');
    } else {
        return input;
    }
}
