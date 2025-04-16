export type DataContent = string | Uint8Array | ArrayBuffer | Buffer;

export interface TextPart {
    type: 'text';
    text: string;
}

export interface ImagePart {
    type: 'image';
    image: DataContent | URL;
    mimeType?: string;
}

export interface FilePart {
    type: 'file';
    data: DataContent | URL;
}

export interface AnyAdapterPart<T = any> {
    type: string;
    data: T;
}

export type AssistantContent = string | Array<TextPart | FilePart | AnyAdapterPart<any>>;
export type UserContent = string | Array<TextPart | ImagePart | FilePart>;

export interface CoreSystemMessage {
    role: 'system';
    content: string;
}

export interface CoreAssistantMessage {
    role: 'assistant';
    content: AssistantContent;
}

export interface CoreUserMessage {
    role: 'user';
    content: UserContent;
}

export interface AdapterMessage<R = string, T = any> {
    role: R;
    content: T;
}
