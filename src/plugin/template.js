/**
 * @param {string} template
 * @param {any} data
 * @returns {string}
 */
function interpolate(template, data) {
    return template.split('{{').reduce((result, part) => {
        const [value, rest] = part.split('}}');
        if (rest === undefined)
            return result + part;

        const keys = value.trim().split('.');
        let currentValue = data;

        for (const key of keys) {
            if (key.includes('[') && key.includes(']')) {
                const [arrayKey, indexStr] = key.split('[');
                const index = Number.parseInt(indexStr);
                currentValue = currentValue[arrayKey][index];
            } else {
                currentValue = currentValue[key];
            }

            if (currentValue === undefined) {
                return `${result}{{${value}}}`;
            }
        }
        return result + currentValue + rest;
    }, '');
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
//     body: {
//         type: 'json', // or 'form' or 'text'
//         content: {
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
 * @property {object} body
 * @property {string} body.type
 * @property {{[key: string]: string}} body.content
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
    const url = interpolate(template.url, data);
    const method = interpolate(template.method, data);
    const headers = Object.fromEntries(
        Object.entries(template.headers).map(([key, value]) => {
            return [key, interpolate(value, data)];
        }),
    );

    let body = null;
    if (template.body !== null) {
        if (template.body.type === 'json') {
            body = JSON.stringify(
                Object.fromEntries(
                    Object.entries(template.body.content).map(([key, value]) => {
                        return [key, interpolate(value, data)];
                    }),
                ),
            );
        } else if (template.body.type === 'form') {
            body = new URLSearchParams();
            for (const [key, value] of Object.entries(template.body.content)) {
                body.append(key, interpolate(value, data));
            }
        }
    }

    const response = await fetch(url, {
        method,
        headers,
        body,
    });

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