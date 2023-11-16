// node_modules/@cloudflare/ai/dist/tensor.js
var TensorType;
(function(TensorType2) {
    TensorType2["String"] = "str";
    TensorType2["Bool"] = "bool";
    TensorType2["Float16"] = "float16";
    TensorType2["Float32"] = "float32";
    TensorType2["Int16"] = "int16";
    TensorType2["Int32"] = "int32";
    TensorType2["Int64"] = "int64";
    TensorType2["Int8"] = "int8";
    TensorType2["Uint16"] = "uint16";
    TensorType2["Uint32"] = "uint32";
    TensorType2["Uint64"] = "uint64";
    TensorType2["Uint8"] = "uint8";
})(TensorType || (TensorType = {}));
var TypedArrayProto = Object.getPrototypeOf(Uint8Array);
function isArray(value) {
    return Array.isArray(value) || value instanceof TypedArrayProto;
}
function arrLength(obj) {
    return obj instanceof TypedArrayProto ? obj.length : obj.flat().reduce((acc, cur) => acc + (cur instanceof TypedArrayProto ? cur.length : 1), 0);
}
function ensureShape(shape, value) {
    if (shape.length === 0 && !isArray(value)) {
        return;
    }
    const count = shape.reduce((acc, v) => {
        if (!Number.isInteger(v)) {
            throw new Error(`expected shape to be array-like of integers but found non-integer element "${v}"`);
        }
        return acc * v;
    }, 1);
    if (count != arrLength(value)) {
        throw new Error(`invalid shape: expected ${count} elements for shape ${shape} but value array has length ${value.length}`);
    }
}
function ensureType(type, value) {
    if (isArray(value)) {
        value.forEach((v) => ensureType(type, v));
        return;
    }
    switch (type) {
        case TensorType.Bool: {
            if (typeof value === "boolean") {
                return;
            }
            break;
        }
        case TensorType.Float16:
        case TensorType.Float32: {
            if (typeof value === "number") {
                return;
            }
            break;
        }
        case TensorType.Int8:
        case TensorType.Uint8:
        case TensorType.Int16:
        case TensorType.Uint16:
        case TensorType.Int32:
        case TensorType.Uint32: {
            if (Number.isInteger(value)) {
                return;
            }
            break;
        }
        case TensorType.Int64:
        case TensorType.Uint64: {
            if (typeof value === "bigint") {
                return;
            }
            break;
        }
        case TensorType.String: {
            if (typeof value === "string") {
                return;
            }
            break;
        }
    }
    throw new Error(`unexpected type "${type}" with value "${value}".`);
}
function serializeType(type, value) {
    if (isArray(value)) {
        return [...value].map((v) => serializeType(type, v));
    }
    switch (type) {
        case TensorType.String:
        case TensorType.Bool:
        case TensorType.Float16:
        case TensorType.Float32:
        case TensorType.Int8:
        case TensorType.Uint8:
        case TensorType.Int16:
        case TensorType.Uint16:
        case TensorType.Uint32:
        case TensorType.Int32: {
            return value;
        }
        case TensorType.Int64:
        case TensorType.Uint64: {
            return value.toString();
        }
    }
    throw new Error(`unexpected type "${type}" with value "${value}".`);
}
function deserializeType(type, value) {
    if (isArray(value)) {
        return value.map((v) => deserializeType(type, v));
    }
    switch (type) {
        case TensorType.String:
        case TensorType.Bool:
        case TensorType.Float16:
        case TensorType.Float32:
        case TensorType.Int8:
        case TensorType.Uint8:
        case TensorType.Int16:
        case TensorType.Uint16:
        case TensorType.Uint32:
        case TensorType.Int32: {
            return value;
        }
        case TensorType.Int64:
        case TensorType.Uint64: {
            return BigInt(value);
        }
    }
    throw new Error(`unexpected type "${type}" with value "${value}".`);
}
var Tensor = class _Tensor {
    constructor(type, value, opts = {}) {
        this.type = type;
        this.value = value;
        ensureType(type, this.value);
        if (opts.shape === void 0) {
            if (isArray(this.value)) {
                this.shape = [arrLength(value)];
            } else {
                this.shape = [];
            }
        } else {
            this.shape = opts.shape;
        }
        ensureShape(this.shape, this.value);
        this.name = opts.name || null;
    }
    static fromJSON(obj) {
        const { type, shape, value, b64Value, name } = obj;
        const opts = { shape, name };
        if (b64Value !== void 0) {
            const value2 = b64ToArray(b64Value, type)[0];
            return new _Tensor(type, value2, opts);
        } else {
            return new _Tensor(type, deserializeType(type, value), opts);
        }
    }
    toJSON() {
        return {
            type: this.type,
            shape: this.shape,
            name: this.name,
            value: serializeType(this.type, this.value)
        };
    }
};
function b64ToArray(base64, type) {
    const byteString = atob(base64);
    const bytes = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
        bytes[i] = byteString.charCodeAt(i);
    }
    const arrBuffer = new DataView(bytes.buffer).buffer;
    switch (type) {
        case "float32":
            return new Float32Array(arrBuffer);
        case "float64":
            return new Float64Array(arrBuffer);
        case "int32":
            return new Int32Array(arrBuffer);
        case "int64":
            return new BigInt64Array(arrBuffer);
        default:
            throw Error(`invalid data type for base64 input: ${type}`);
    }
}

// node_modules/@cloudflare/ai/dist/tasks/text-generation.js
var AiTextGeneration = class {
    constructor(inputs, modelSettings2) {
        this.schema = {
            input: {
                type: "object",
                oneOf: [
                    {
                        properties: {
                            prompt: {
                                type: "string"
                            },
                            stream: {
                                type: "boolean",
                                default: false
                            },
                            max_tokens: {
                                type: "integer",
                                default: 256
                            }
                        },
                        required: ["prompt"]
                    },
                    {
                        properties: {
                            messages: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        role: {
                                            type: "string"
                                        },
                                        content: {
                                            type: "string"
                                        }
                                    },
                                    required: ["role", "content"]
                                }
                            },
                            stream: {
                                type: "boolean",
                                default: false
                            },
                            max_tokens: {
                                type: "integer",
                                default: 256
                            }
                        },
                        required: ["messages"]
                    }
                ]
            },
            output: {
                oneOf: [
                    {
                        type: "object",
                        contentType: "application/json",
                        properties: {
                            response: {
                                type: "string"
                            }
                        }
                    },
                    {
                        type: "string",
                        contentType: "text/event-stream",
                        format: "binary"
                    }
                ]
            }
        };
        this.inputs = inputs;
        this.modelSettings = modelSettings2;
    }
    preProcessing() {
        if (this.inputs.stream && this.modelSettings.inputsDefaultsStream) {
            this.inputs = { ...this.modelSettings.inputsDefaultsStream, ...this.inputs };
        } else if (this.modelSettings.inputsDefaults) {
            this.inputs = { ...this.modelSettings.inputsDefaults, ...this.inputs };
        }
        let prompt = "";
        if (this.inputs.messages === void 0) {
            prompt = this.inputs.prompt;
        } else {
            for (let i = 0; i < this.inputs.messages.length; i++) {
                const inp = this.inputs.messages[i];
                switch (inp.role) {
                    case "system":
                        prompt += this.modelSettings.preProcessingArgs.startSysPrompt + inp.content + this.modelSettings.preProcessingArgs.endSysPrompt + "\n";
                        break;
                    case "user":
                        prompt += "[INST]" + inp.content + "[/INST]\n";
                        break;
                    case "assistant":
                        prompt += inp.content + "\n";
                        break;
                    default:
                        throw new Error("Invalid role: " + inp.role);
                }
            }
        }
        this.preProcessedInputs = prompt;
    }
    generateTensors() {
        this.tensors = [
            new Tensor(TensorType.String, [this.preProcessedInputs], {
                shape: [1],
                name: "INPUT_0"
            }),
            new Tensor(TensorType.Uint32, [this.inputs.max_tokens], {
                shape: [1],
                name: "INPUT_1"
            })
        ];
    }
    postProcessing(response) {
        this.postProcessedOutputs = { response: response.name.value[0] };
    }
    postProcessingStream(response) {
        return { response: response.name.value[0] };
    }
};

// node_modules/@cloudflare/ai/dist/tasks/text-to-image.js
var AiTextToImage = class {
    constructor(inputs, modelSettings2) {
        this.schema = {
            input: {
                type: "object",
                properties: {
                    prompt: {
                        type: "string"
                    },
                    num_steps: {
                        type: "integer",
                        default: 20,
                        maximum: 20
                    }
                },
                required: ["prompt"]
            },
            output: {
                type: "string",
                contentType: "image/png",
                format: "binary"
            }
        };
        this.inputs = inputs;
        this.modelSettings = modelSettings2;
    }
    preProcessing() {
        this.preProcessedInputs = this.inputs;
    }
    generateTensors() {
        this.tensors = [
            new Tensor(TensorType.String, [this.preProcessedInputs.prompt], {
                shape: [1],
                name: "input_text"
            }),
            new Tensor(TensorType.Int32, [this.preProcessedInputs.num_steps], {
                shape: [1],
                name: "num_steps"
            })
        ];
    }
    postProcessing(response) {
        this.postProcessedOutputs = new Uint8Array(response.output_image.value);
    }
};

// node_modules/@cloudflare/ai/dist/catalog.js
var modelMappings = {
    // "text-classification": {
    //     models: ["@cf/huggingface/distilbert-sst-2-int8"],
    //     class: AiTextClassification,
    //     id: "19606750-23ed-4371-aab2-c20349b53a60",
    // },
    "text-to-image": {
        models: ["@cf/stabilityai/stable-diffusion-xl-base-1.0"],
        class: AiTextToImage,
        id: "3d6e1f35-341b-4915-a6c8-9a7142a9033a"
    },
    // "text-embeddings": {
    //     models: ["@cf/baai/bge-small-en-v1.5", "@cf/baai/bge-base-en-v1.5", "@cf/baai/bge-large-en-v1.5"],
    //     class: AiTextEmbeddings,
    //     id: "0137cdcf-162a-4108-94f2-1ca59e8c65ee",
    // },
    // "speech-recognition": {
    //     models: ["@cf/openai/whisper"],
    //     class: AiSpeechRecognition,
    //     id: "dfce1c48-2a81-462e-a7fd-de97ce985207",
    // },
    // "image-classification": {
    //     models: ["@cf/microsoft/resnet-50"],
    //     class: AiImageClassification,
    //     id: "00cd182b-bf30-4fc4-8481-84a3ab349657",
    // },
    "text-generation": {
        models: [
            "@cf/meta/llama-2-7b-chat-int8",
            "@cf/mistral/mistral-7b-instruct-v0.1",
            "@hf/codellama/codellama-7b-hf",
            "@cf/meta/llama-2-7b-chat-fp16"
        ],
        class: AiTextGeneration,
        id: "c329a1f9-323d-4e91-b2aa-582dd4188d34"
    }
    // translation: {
    //     models: ["@cf/meta/m2m100-1.2b"],
    //     class: AiTranslation,
    //     id: "f57d07cb-9087-487a-bbbf-bc3e17fecc4b",
    // },
};
var modelSettings = {
    "@cf/stabilityai/stable-diffusion-xl-base-1.0": {
        route: "stable-diffusion-xl-base-1-0"
    },
    "@hf/codellama/codellama-7b-hf": {
        route: "hf",
        inputsDefaultsStream: {
            max_tokens: 1800
        },
        inputsDefaults: {
            max_tokens: 256
        },
        preProcessingArgs: {
            startSysPrompt: "[INST]<<SYS>>",
            endSysPrompt: "<</SYS>>[/INST]"
        }
    },
    "@cf/meta/llama-2-7b-chat-fp16": {
        route: "llama-2-7b-chat-fp16",
        inputsDefaultsStream: {
            max_tokens: 2500
        },
        inputsDefaults: {
            max_tokens: 256
        },
        preProcessingArgs: {
            startSysPrompt: "[INST]<<SYS>>",
            endSysPrompt: "<</SYS>>[/INST]"
        }
    },
    "@cf/meta/llama-2-7b-chat-int8": {
        route: "llama_2_7b_chat_int8",
        inputsDefaultsStream: {
            max_tokens: 1800
        },
        inputsDefaults: {
            max_tokens: 256
        },
        preProcessingArgs: {
            startSysPrompt: "[INST]<<SYS>>",
            endSysPrompt: "<</SYS>>[/INST]"
        }
    },
    "@cf/mistral/mistral-7b-instruct-v0.1": {
        route: "mistral-7b-instruct-v0-1",
        inputsDefaultsStream: {
            max_tokens: 1800
        },
        inputsDefaults: {
            max_tokens: 256
        },
        preProcessingArgs: {
            startSysPrompt: "<s>[INST]",
            endSysPrompt: "[/INST]</s>"
        }
    }
};
var addModel = (task, model, settings) => {
    modelMappings[task].models.push(model);
    modelSettings[model] = settings;
};

// node_modules/@cloudflare/ai/dist/tools.js
var debugLog = (dd, what, ...args) => {
    if (dd) {
        console.log(`\x1B[1m${what}`);
        if (args[0] !== false) {
            if (typeof args == "object" || Array.isArray(args)) {
                const json = JSON.stringify(args);
                console.log(json.length > 512 ? `${json.substring(0, 512)}...` : json);
            } else {
                console.log(args);
            }
        }
    }
};
var getModelSettings = (model, key) => {
    const models = Object.keys(modelSettings);
    for (var m in models) {
        if (models[m] == model) {
            return key ? modelSettings[models[m]][key] : modelSettings[models[m]];
        }
    }
    return false;
};
var EventSourceParserStream = class extends TransformStream {
    constructor() {
        let parser;
        super({
            start(controller) {
                parser = createParser((event) => {
                    if (event.type === "event") {
                        controller.enqueue(event);
                    }
                });
            },
            transform(chunk) {
                parser.feed(chunk);
            }
        });
    }
};
var BOM = [239, 187, 191];
function hasBom(buffer) {
    return BOM.every((charCode, index) => buffer.charCodeAt(index) === charCode);
}
function createParser(onParse) {
    let isFirstChunk;
    let buffer;
    let startingPosition;
    let startingFieldLength;
    let eventId;
    let eventName;
    let data;
    reset();
    return { feed, reset };
    function reset() {
        isFirstChunk = true;
        buffer = "";
        startingPosition = 0;
        startingFieldLength = -1;
        eventId = void 0;
        eventName = void 0;
        data = "";
    }
    function feed(chunk) {
        buffer = buffer ? buffer + chunk : chunk;
        if (isFirstChunk && hasBom(buffer)) {
            buffer = buffer.slice(BOM.length);
        }
        isFirstChunk = false;
        const length = buffer.length;
        let position = 0;
        let discardTrailingNewline = false;
        while (position < length) {
            if (discardTrailingNewline) {
                if (buffer[position] === "\n") {
                    ++position;
                }
                discardTrailingNewline = false;
            }
            let lineLength = -1;
            let fieldLength = startingFieldLength;
            let character;
            for (let index = startingPosition; lineLength < 0 && index < length; ++index) {
                character = buffer[index];
                if (character === ":" && fieldLength < 0) {
                    fieldLength = index - position;
                } else if (character === "\r") {
                    discardTrailingNewline = true;
                    lineLength = index - position;
                } else if (character === "\n") {
                    lineLength = index - position;
                }
            }
            if (lineLength < 0) {
                startingPosition = length - position;
                startingFieldLength = fieldLength;
                break;
            } else {
                startingPosition = 0;
                startingFieldLength = -1;
            }
            parseEventStreamLine(buffer, position, fieldLength, lineLength);
            position += lineLength + 1;
        }
        if (position === length) {
            buffer = "";
        } else if (position > 0) {
            buffer = buffer.slice(position);
        }
    }
    function parseEventStreamLine(lineBuffer, index, fieldLength, lineLength) {
        if (lineLength === 0) {
            if (data.length > 0) {
                onParse({
                    type: "event",
                    id: eventId,
                    event: eventName || void 0,
                    data: data.slice(0, -1)
                });
                data = "";
                eventId = void 0;
            }
            eventName = void 0;
            return;
        }
        const noValue = fieldLength < 0;
        const field = lineBuffer.slice(index, index + (noValue ? lineLength : fieldLength));
        let step = 0;
        if (noValue) {
            step = lineLength;
        } else if (lineBuffer[index + fieldLength + 1] === " ") {
            step = fieldLength + 2;
        } else {
            step = fieldLength + 1;
        }
        const position = index + step;
        const valueLength = lineLength - step;
        const value = lineBuffer.slice(position, position + valueLength).toString();
        if (field === "data") {
            data += value ? `${value}
` : "\n";
        } else if (field === "event") {
            eventName = value;
        } else if (field === "id" && !value.includes("\0")) {
            eventId = value;
        } else if (field === "retry") {
            const retry = parseInt(value, 10);
            if (!Number.isNaN(retry)) {
                onParse({ type: "reconnect-interval", value: retry });
            }
        }
    }
}
var ResultStream = class extends TransformStream {
    constructor() {
        super({
            transform(chunk, controller) {
                if (chunk.data === "[DONE]") {
                    return;
                }
                const data = JSON.parse(chunk.data);
                controller.enqueue(data);
            }
        });
    }
};
var getEventStream = (body) => {
    const { readable, writable } = new TransformStream();
    const eventStream = (body ?? new ReadableStream()).pipeThrough(new TextDecoderStream()).pipeThrough(new EventSourceParserStream()).pipeThrough(new ResultStream());
    const reader = eventStream.getReader();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();
    const write = async (data) => {
        await writer.write(encoder.encode(data));
    };
    return {
        readable,
        reader,
        writer,
        write
    };
};

// node_modules/@cloudflare/ai/dist/session.js
function parseInputs(inputs) {
    if (Array.isArray(inputs)) {
        return inputs.map((input) => input.toJSON());
    }
    if (inputs !== null && typeof inputs === "object") {
        return Object.keys(inputs).map((key) => {
            let tensor = inputs[key].toJSON();
            tensor.name = key;
            return tensor;
        });
    }
    throw new Error(`invalid inputs, must be Array<Tensor<any>> | TensorsObject`);
}
function tensorByName(result) {
    const outputByName = {};
    for (let i = 0, len = result.length; i < len; i++) {
        const tensor = Tensor.fromJSON(result[i]);
        const name = tensor.name || "output" + i;
        outputByName[name] = tensor;
    }
    return outputByName;
}
var InferenceUpstreamError = class extends Error {
    constructor(message, httpCode) {
        super(message);
        this.name = "InferenceUpstreamError";
        this.httpCode = httpCode;
    }
};
var InferenceSession = class {
    constructor(binding, model, options = {}) {
        this.binding = binding;
        this.model = model;
        this.options = options;
    }
    async run(inputs, options) {
        const jsonInputs = parseInputs(inputs);
        const inferRequest = {
            input: jsonInputs,
            stream: false
        };
        if (options?.stream) {
            inferRequest.stream = options?.stream;
        }
        const body = JSON.stringify(inferRequest);
        const compressedReadableStream = new Response(body).body.pipeThrough(new CompressionStream("gzip"));
        const res = await this.binding.fetch("/run", {
            method: "POST",
            body: compressedReadableStream,
            headers: {
                ...this.options?.extraHeaders || {},
                "content-encoding": "gzip",
                "cf-consn-model-id": this.model,
                "cf-consn-routing-model": getModelSettings(this.model, "route") || "default"
            }
        });
        if (!res.ok) {
            throw new InferenceUpstreamError(await res.text(), res.status);
        }
        if (!options?.stream) {
            const { result } = await res.json();
            return tensorByName(result);
        } else {
            const { readable, reader, writer, write } = getEventStream(res.body);
            const waitUntil = this.options.ctx?.waitUntil ? (f) => this.options.ctx.waitUntil(f()) : (f) => f();
            waitUntil(async () => {
                try {
                    for (; ; ) {
                        const { done, value } = await reader.read();
                        if (done) {
                            await write("data: [DONE]\n\n");
                            break;
                        }
                        const output = tensorByName(value.result);
                        await write(`data: ${JSON.stringify(options.postProcessing ? options.postProcessing(output) : output)}

`);
                    }
                } catch (e) {
                    await write("an unknown error occurred while streaming");
                }
                await writer.close();
            });
            return readable;
        }
    }
};

// node_modules/@cloudflare/ai/dist/ai.js
var Ai = class {
    constructor(binding, options = {}) {
        this.binding = binding;
        this.options = options;
    }
    addModel(task, model, settings) {
        addModel(task, model, settings);
    }
    async run(model, inputs) {
        const tasks = Object.keys(modelMappings);
        for (var t in tasks) {
            if (modelMappings[tasks[t]].models.indexOf(model) !== -1) {
                this.task = new modelMappings[tasks[t]].class(inputs, getModelSettings(model));
                debugLog(this.options.debug, "input", inputs);
                this.task.preProcessing();
                debugLog(this.options.debug, "pre-processed input", inputs);
                this.task.generateTensors();
                debugLog(this.options.debug, "input tensors", this.task.tensors);
                const sessionOptions = this.options.sessionOptions || {};
                const session = new InferenceSession(this.binding, model, sessionOptions);
                if (inputs.stream) {
                    debugLog(this.options.debug, "streaming", false);
                    return await session.run(this.task.tensors, { stream: true, postProcessing: this.task.postProcessingStream });
                } else {
                    const response = await session.run(this.task.tensors);
                    debugLog(this.options.debug, "response", response);
                    this.task.postProcessing(response, sessionOptions.ctx);
                    debugLog(this.options.debug, "post-processed response", response);
                    return this.task.postProcessedOutputs;
                }
            }
        }
        throw new Error(`No such model ${model} or task`);
    }
};
export {
    Ai
};
