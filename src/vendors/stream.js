/* eslint-disable */
// https://github.com/openai/openai-node/blob/master/src/streaming.ts

export class Stream {
    constructor(response, controller) {
        this.response = response;
        this.controller = controller;
        this.decoder = new SSEDecoder();
    }
    async *iterMessages() {
        if (!this.response.body) {
            this.controller.abort();
            throw new Error(`Attempted to iterate over a response with no body`);
        }
        const lineDecoder = new LineDecoder();
        const iter = this.response.body;
        for await (const chunk of iter) {
            for (const line of lineDecoder.decode(chunk)) {
                const sse = this.decoder.decode(line);
                if (sse)
                    yield sse;
            }
        }
        for (const line of lineDecoder.flush()) {
            const sse = this.decoder.decode(line);
            if (sse)
                yield sse;
        }
    }
    async *[Symbol.asyncIterator]() {
        let done = false;
        try {
            for await (const sse of this.iterMessages()) {
                if (done)
                    continue;
                if (sse.data.startsWith('[DONE]')) {
                    done = true;
                    continue;
                }
                if (sse.event === null) {
                    try {
                        yield JSON.parse(sse.data);
                    }
                    catch (e) {
                        console.error(`Could not parse message into JSON:`, sse.data);
                        console.error(`From chunk:`, sse.raw);
                        throw e;
                    }
                }
            }
            done = true;
        }
        catch (e) {
            // If the user calls `stream.controller.abort()`, we should exit without throwing.
            if (e instanceof Error && e.name === 'AbortError')
                return;
            throw e;
        }
        finally {
            // If the user `break`s, abort the ongoing request.
            if (!done)
                this.controller.abort();
        }
    }
}
class SSEDecoder {
    constructor() {
        this.event = null;
        this.data = [];
        this.chunks = [];
    }
    decode(line) {
        if (line.endsWith('\r')) {
            line = line.substring(0, line.length - 1);
        }
        if (!line) {
            // empty line and we didn't previously encounter any messages
            if (!this.event && !this.data.length)
                return null;
            const sse = {
                event: this.event,
                data: this.data.join('\n'),
                raw: this.chunks,
            };
            this.event = null;
            this.data = [];
            this.chunks = [];
            return sse;
        }
        this.chunks.push(line);
        if (line.startsWith(':')) {
            return null;
        }
        let [fieldname, _, value] = partition(line, ':');
        if (value.startsWith(' ')) {
            value = value.substring(1);
        }
        if (fieldname === 'event') {
            this.event = value;
        }
        else if (fieldname === 'data') {
            this.data.push(value);
        }
        return null;
    }
}
/**
 * A re-implementation of httpx's `LineDecoder` in Python that handles incrementally
 * reading lines from text.
 *
 * https://github.com/encode/httpx/blob/920333ea98118e9cf617f246905d7b202510941c/httpx/_decoders.py#L258
 */
class LineDecoder {
    constructor() {
        this.buffer = [];
        this.trailingCR = false;
    }
    decode(chunk) {
        let text = this.decodeText(chunk);
        if (this.trailingCR) {
            text = '\r' + text;
            this.trailingCR = false;
        }
        if (text.endsWith('\r')) {
            this.trailingCR = true;
            text = text.slice(0, -1);
        }
        if (!text) {
            return [];
        }
        const trailingNewline = LineDecoder.NEWLINE_CHARS.has(text[text.length - 1] || '');
        let lines = text.split(LineDecoder.NEWLINE_REGEXP);
        if (lines.length === 1 && !trailingNewline) {
            this.buffer.push(lines[0]);
            return [];
        }
        if (this.buffer.length > 0) {
            lines = [this.buffer.join('') + lines[0], ...lines.slice(1)];
            this.buffer = [];
        }
        if (!trailingNewline) {
            this.buffer = [lines.pop() || ''];
        }
        return lines;
    }
    decodeText(bytes) {
        var _a;
        if (bytes == null)
            return '';
        if (typeof bytes === 'string')
            return bytes;
        // Node:
        if (typeof Buffer !== 'undefined') {
            if (bytes instanceof Buffer) {
                return bytes.toString();
            }
            if (bytes instanceof Uint8Array) {
                return Buffer.from(bytes).toString();
            }
            throw new Error(`Unexpected: received non-Uint8Array (${bytes.constructor.name}) stream chunk in an environment with a global "Buffer" defined, which this library assumes to be Node. Please report this error.`);
        }
        // Browser
        if (typeof TextDecoder !== 'undefined') {
            if (bytes instanceof Uint8Array || bytes instanceof ArrayBuffer) {
                (_a = this.textDecoder) !== null && _a !== void 0 ? _a : (this.textDecoder = new TextDecoder('utf8'));
                return this.textDecoder.decode(bytes);
            }
            throw new Error(`Unexpected: received non-Uint8Array/ArrayBuffer (${bytes.constructor.name}) in a web platform. Please report this error.`);
        }
        throw new Error(`Unexpected: neither Buffer nor TextDecoder are available as globals. Please report this error.`);
    }
    flush() {
        if (!this.buffer.length && !this.trailingCR) {
            return [];
        }
        const lines = [this.buffer.join('')];
        this.buffer = [];
        this.trailingCR = false;
        return lines;
    }
}
// prettier-ignore
LineDecoder.NEWLINE_CHARS = new Set(['\n', '\r']);
LineDecoder.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function partition(str, delimiter) {
    const index = str.indexOf(delimiter);
    if (index !== -1) {
        return [str.substring(0, index), delimiter, str.substring(index + delimiter.length)];
    }
    return [str, '', ''];
}
