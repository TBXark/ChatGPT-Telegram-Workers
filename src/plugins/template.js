import {
    TemplateBodyTypeForm,
    TemplateBodyTypeJson,
    TemplateInputTypeCommaSeparated,
    TemplateInputTypeJson,
    TemplateInputTypeSpaceSeparated,
    TemplateResponseTypeJson,
    TemplateResponseTypeText,
} from '../types/template.js';
import { interpolate } from './interpolate.js';

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

/**
 * @param {RequestTemplate} template
 * @param {any} data
 * @returns {Promise<{content: string, type: string}>}
 */
export async function executeRequest(template, data) {
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
        if (template.body.type === TemplateBodyTypeJson) {
            body = JSON.stringify(interpolateObject(template.body.content, data));
        } else if (template.body.type === TemplateBodyTypeForm) {
            body = new URLSearchParams();
            for (const [key, value] of Object.entries(template.body.content)) {
                body.append(key, interpolate(value, data));
            }
        } else {
            body = interpolate(template.body.content, data);
        }
    }

    const response = await fetch(url, {
        method,
        headers,
        body,
    });

    const renderOutput = async (type, temple, response) => {
        switch (type) {
            case TemplateResponseTypeText:
                return interpolate(temple, await response.text());
            case TemplateResponseTypeJson:
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

/**
 * @param {string} input
 * @param {string} type
 * @returns {string | string[] | object}
 */
export function formatInput(input, type) {
    if (type === TemplateInputTypeJson) {
        return JSON.parse(input);
    } else if (type === TemplateInputTypeSpaceSeparated) {
        return input.split(/\s+/);
    } else if (type === TemplateInputTypeCommaSeparated) {
        return input.split(/\s*,\s*/);
    } else {
        return input;
    }
}
