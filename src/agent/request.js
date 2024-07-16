/* eslint-disable no-unused-vars */
import {Context} from '../config/context.js';
import {ENV} from "../config/env.js";
import {Stream} from "./stream.js";


/**
 *
 * @typedef {function} StreamBuilder
 * @param {Response} resp
 * @param {AbortController} controller
 * @return {Stream}
 *
 * @typedef {function} SSEContentExtractor
 * @param {object} data
 * @return {string|null}
 *
 * @typedef {function} FullContentExtractor
 * @param {object} data
 * @return {string|null}
 *
 * @typedef {object} ErrorExtractor
 * @param {object} data
 * @return {string|null}
 *
 * @typedef {object} SseChatCompatibleOptions
 * @property {StreamBuilder} streamBuilder
 * @property {SSEContentExtractor} contentExtractor
 * @property {FullContentExtractor} fullContentExtractor
 * @property {ErrorExtractor} errorExtractor
 */

/**
 * 修复OpenAI兼容的选项
 *
 * @param {SseChatCompatibleOptions | null} options
 * @return {SseChatCompatibleOptions}
 */
function fixOpenAICompatibleOptions(options) {
    options = options || {};
    options.streamBuilder = options.streamBuilder || function (r, c) {
        return new Stream(r, c)
    };
    options.contentExtractor = options.contentExtractor || function (d) {
        return d?.choices?.[0]?.delta?.content
    }
    options.fullContentExtractor = options.fullContentExtractor || function (d) {
        return d.choices?.[0]?.message.content
    }
    options.errorExtractor = options.errorExtractor || function (d) {
        return d.error?.message
    }
    return options;
}

/**
 * @param {Response} resp
 * @return {boolean}
 */
export function isJsonResponse(resp) {
    return resp.headers.get('content-type').indexOf('json') !== -1;
}

/**
 * @param {Response} resp
 * @return {boolean}
 */
export function isEventStreamResponse(resp) {
    const types = ['application/stream+json', 'text/event-stream']
    const content = resp.headers.get('content-type')
    for (const type of types) {
        if (content.indexOf(type) !== -1) {
            return true;
        }
    }
    return false;
}

/**
 * 发送请求到支持sse的聊天接口
 *
 * @param {string | null} url
 * @param {object} header
 * @param {object} body
 * @param {Context} context
 * @param {function} onStream
 * @param {function} onResult
 * @param {SseChatCompatibleOptions | null} options
 * @return {Promise<string>}
 */
export async function requestChatCompletions(url, header, body, context, onStream, onResult = null, options = null) {
    const controller = new AbortController();
    const {signal} = controller;

    let timeoutID = null;
    if (ENV.CHAT_COMPLETE_API_TIMEOUT > 0) {
        timeoutID = setTimeout(() => controller.abort(), ENV.CHAT_COMPLETE_API_TIMEOUT);
    }

    const resp = await fetch(url, {
        method: 'POST',
        headers: header,
        body: JSON.stringify(body),
        signal,
    });

    if (timeoutID) {
        clearTimeout(timeoutID);
    }

    options = fixOpenAICompatibleOptions(options);

    if (onStream && resp.ok && isEventStreamResponse(resp)) {
        const stream = options.streamBuilder(resp, controller);
        let contentFull = '';
        let lengthDelta = 0;
        let updateStep = 50;
        try {
            for await (const data of stream) {
                const c = options.contentExtractor(data) || '';
                if (c === '') {
                    continue;
                }
                lengthDelta += c.length;
                contentFull = contentFull + c;
                if (lengthDelta > updateStep) {
                    lengthDelta = 0;
                    updateStep += 20;
                    await onStream(`${contentFull}\n${ENV.I18N.message.loading}...`);
                }
            }
        } catch (e) {
            contentFull += `\nERROR: ${e.message}`;
        }
        return contentFull;
    }

    if (!isJsonResponse(resp)) {
        throw new Error(resp.statusText);
    }

    const result = await resp.json();

    if (!result) {
        throw new Error('Empty response');
    }

    if (options.errorExtractor(result)) {
        throw new Error(options.errorExtractor(result));
    }

    try {
        onResult?.(result);
        return options.fullContentExtractor(result)
    } catch (e) {
        throw Error(JSON.stringify(result));
    }
}
