/* eslint-disable */
// src/tensor.ts
var TensorType = /* @__PURE__ */ (TensorType2 => {
    TensorType2['String'] = 'str';
    TensorType2['Bool'] = 'bool';
    TensorType2['Float16'] = 'float16';
    TensorType2['Float32'] = 'float32';
    TensorType2['Int16'] = 'int16';
    TensorType2['Int32'] = 'int32';
    TensorType2['Int64'] = 'int64';
    TensorType2['Int8'] = 'int8';
    TensorType2['Uint16'] = 'uint16';
    TensorType2['Uint32'] = 'uint32';
    TensorType2['Uint64'] = 'uint64';
    TensorType2['Uint8'] = 'uint8';
    return TensorType2;
})(TensorType || {});
var TypedArrayProto = Object.getPrototypeOf(Uint8Array);
function isArray(value) {
    return Array.isArray(value) || value instanceof TypedArrayProto;
}
function arrLength(obj) {
    return obj instanceof TypedArrayProto
        ? obj.length
        : obj
            .flat()
            .reduce(
                (acc, cur) => acc + (cur instanceof TypedArrayProto ? cur.length : 1),
                0
            );
}
function ensureShape(shape, value) {
    if (shape.length === 0 && !isArray(value)) {
        return;
    }
    const count = shape.reduce((acc, v) => {
        if (!Number.isInteger(v)) {
            throw new Error(
                `expected shape to be array-like of integers but found non-integer element "${v}"`
            );
        }
        return acc * v;
    }, 1);
    if (count != arrLength(value)) {
        throw new Error(
            `invalid shape: expected ${count} elements for shape ${shape} but value array has length ${value.length}`
        );
    }
}
function ensureType(type, value) {
    if (isArray(value)) {
        value.forEach(v => ensureType(type, v));
        return;
    }
    switch (type) {
        case 'bool' /* Bool */: {
            if (typeof value === 'boolean') {
                return;
            }
            break;
        }
        case 'float16' /* Float16 */:
        case 'float32' /* Float32 */: {
            if (typeof value === 'number') {
                return;
            }
            break;
        }
        case 'int8' /* Int8 */:
        case 'uint8' /* Uint8 */:
        case 'int16' /* Int16 */:
        case 'uint16' /* Uint16 */:
        case 'int32' /* Int32 */:
        case 'uint32' /* Uint32 */: {
            if (Number.isInteger(value)) {
                return;
            }
            break;
        }
        case 'int64' /* Int64 */:
        case 'uint64' /* Uint64 */: {
            if (typeof value === 'bigint') {
                return;
            }
            break;
        }
        case 'str' /* String */: {
            if (typeof value === 'string') {
                return;
            }
            break;
        }
    }
    throw new Error(`unexpected type "${type}" with value "${value}".`);
}
function serializeType(type, value) {
    if (isArray(value)) {
        return [...value].map(v => serializeType(type, v));
    }
    switch (type) {
        case 'str' /* String */:
        case 'bool' /* Bool */:
        case 'float16' /* Float16 */:
        case 'float32' /* Float32 */:
        case 'int8' /* Int8 */:
        case 'uint8' /* Uint8 */:
        case 'int16' /* Int16 */:
        case 'uint16' /* Uint16 */:
        case 'uint32' /* Uint32 */:
        case 'int32' /* Int32 */: {
            return value;
        }
        case 'int64' /* Int64 */:
        case 'uint64' /* Uint64 */: {
            return value.toString();
        }
    }
    throw new Error(`unexpected type "${type}" with value "${value}".`);
}
function deserializeType(type, value) {
    if (isArray(value)) {
        return value.map(v => deserializeType(type, v));
    }
    switch (type) {
        case 'str' /* String */:
        case 'bool' /* Bool */:
        case 'float16' /* Float16 */:
        case 'float32' /* Float32 */:
        case 'int8' /* Int8 */:
        case 'uint8' /* Uint8 */:
        case 'int16' /* Int16 */:
        case 'uint16' /* Uint16 */:
        case 'uint32' /* Uint32 */:
        case 'int32' /* Int32 */: {
            return value;
        }
        case 'int64' /* Int64 */:
        case 'uint64' /* Uint64 */: {
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
        case 'float32':
            return new Float32Array(arrBuffer);
        case 'float64':
            return new Float64Array(arrBuffer);
        case 'int32':
            return new Int32Array(arrBuffer);
        case 'int64':
            return new BigInt64Array(arrBuffer);
        default:
            throw Error(`invalid data type for base64 input: ${type}`);
    }
}

// src/session.ts
function parseInputs(inputs) {
    if (Array.isArray(inputs)) {
        return inputs.map(input => input.toJSON());
    }
    if (inputs !== null && typeof inputs === 'object') {
        return Object.keys(inputs).map(key => {
            let tensor = inputs[key].toJSON();
            tensor.name = key;
            return tensor;
        });
    }
    throw new Error(`invalid inputs, must be Array<Tensor<any>> | TensorsObject`);
}
var InferenceSession = class {
    constructor(binding, model, options = {}) {
        this.binding = binding;
        this.model = model;
        this.options = options;
    }
    async run(inputs, options) {
        const jsonInputs = parseInputs(inputs);
        const body = JSON.stringify({
            input: jsonInputs
        });
        const compressedReadableStream = new Response(body).body.pipeThrough(
            new CompressionStream('gzip')
        );
        let routingModel = 'default';
        if (this.model === '@cf/meta/llama-2-7b-chat-int8') {
            routingModel = 'llama_2_7b_chat_int8';
        }
        const res = await this.binding.fetch('/run', {
            method: 'POST',
            body: compressedReadableStream,
            headers: {
                'content-encoding': 'gzip',
                'cf-consn-model-id': this.model,
                'cf-consn-routing-model': routingModel,
                ...(this.options?.extraHeaders || {})
            }
        });
        if (!res.ok) {
            throw new Error(`API returned ${res.status}: ${await res.text()}`);
        }
        const { result } = await res.json();
        const outputByName = {};
        for (let i = 0, len = result.length; i < len; i++) {
            const tensor = Tensor.fromJSON(result[i]);
            const name = tensor.name || 'output' + i;
            outputByName[name] = tensor;
        }
        return outputByName;
    }
};

// src/ai.ts
var modelMappings = {
    'text-classification': ['@cf/huggingface/distilbert-sst-2-int8'],
    'text-embeddings': ['@cf/baai/bge-base-en-v1.5'],
    'speech-recognition': ['@cf/openai/whisper'],
    'image-classification': ['@cf/microsoft/resnet-50'],
    'text-generation': ['@cf/meta/llama-2-7b-chat-int8'],
    translation: ['@cf/meta/m2m100-1.2b']
};
var chunkArray = (arr, size) =>
    arr.length > size
        ? [arr.slice(0, size), ...chunkArray(arr.slice(size), size)]
        : [arr];
var Ai = class {
    constructor(binding, options = {}) {
        this.binding = binding;
        this.options = options;
    }
    async run(model, inputs) {
        const session = new InferenceSession(
            this.binding,
            model,
            this.options.sessionOptions || {}
        );
        let tensorInput;
        let typedInputs;
        let outputMap = r => r;
        const tasks = Object.keys(modelMappings);
        let task = '';
        for (var t in tasks) {
            if (modelMappings[tasks[t]].indexOf(model) !== -1) {
                task = tasks[t];
                break;
            }
        }
        switch (task) {
            case 'text-classification':
                typedInputs = inputs;
                tensorInput = [
                    new Tensor('str' /* String */, [typedInputs.text], {
                        shape: [[typedInputs.text].length],
                        name: 'input_text'
                    })
                ];
                outputMap = r => {
                    return [
                        {
                            label: 'NEGATIVE',
                            score: r.logits.value[0][0]
                        },
                        {
                            label: 'POSITIVE',
                            score: r.logits.value[0][1]
                        }
                    ];
                };
                break;
            case 'text-embeddings':
                typedInputs = inputs;
                tensorInput = [
                    new Tensor(
                        'str' /* String */,
                        Array.isArray(typedInputs.text)
                            ? typedInputs.text
                            : [typedInputs.text],
                        {
                            shape: [
                                Array.isArray(typedInputs.text)
                                    ? typedInputs.text.length
                                    : [typedInputs.text].length
                            ],
                            name: 'input_text'
                        }
                    )
                ];
                outputMap = r => {
                    if (Array.isArray(r.embeddings.value[0])) {
                        return {
                            shape: r.embeddings.shape,
                            data: r.embeddings.value
                        };
                    } else {
                        return {
                            shape: r.embeddings.shape,
                            data: chunkArray(r.embeddings.value, r.embeddings.shape[1])
                        };
                    }
                };
                break;
            case 'speech-recognition':
                typedInputs = inputs;
                tensorInput = [
                    new Tensor('uint8' /* Uint8 */, typedInputs.audio, {
                        shape: [1, typedInputs.audio.length],
                        name: 'audio'
                    })
                ];
                outputMap = r => {
                    return { text: r.name.value[0] };
                };
                break;
            case 'text-generation':
                typedInputs = inputs;
                let prompt = '';
                if (typedInputs.messages === void 0) {
                    prompt = typedInputs.prompt;
                } else {
                    for (let i = 0; i < typedInputs.messages.length; i++) {
                        const inp = typedInputs.messages[i];
                        switch (inp.role) {
                            case 'system':
                                prompt += '[INST]<<SYS>>' + inp.content + '<</SYS>>[/INST]\n';
                                break;
                            case 'user':
                                prompt += '[INST]' + inp.content + '[/INST]\n';
                                break;
                            case 'assistant':
                                prompt += inp.content + '\n';
                                break;
                            default:
                                throw new Error('Invalid role: ' + inp.role);
                        }
                    }
                }
                tensorInput = [
                    new Tensor('str' /* String */, [prompt], {
                        shape: [1],
                        name: 'INPUT_0'
                    }),
                    new Tensor('uint32' /* Uint32 */, [256], {
                        // sequence length
                        shape: [1],
                        name: 'INPUT_1'
                    })
                ];
                outputMap = r => {
                    return { response: r.name.value[0] };
                };
                break;
            case 'translation':
                typedInputs = inputs;
                tensorInput = [
                    new Tensor('str' /* String */, [typedInputs.text], {
                        shape: [1, 1],
                        name: 'text'
                    }),
                    new Tensor('str' /* String */, [typedInputs.source_lang || 'en'], {
                        shape: [1, 1],
                        name: 'source_lang'
                    }),
                    new Tensor('str' /* String */, [typedInputs.target_lang], {
                        shape: [1, 1],
                        name: 'target_lang'
                    })
                ];
                outputMap = r => {
                    return { translated_text: r.name.value[0] };
                };
                break;
            default:
                throw new Error(`No such model ${model} or task`);
        }
        const output = await session.run(tensorInput);
        return outputMap(output);
    }
};

export { Ai }