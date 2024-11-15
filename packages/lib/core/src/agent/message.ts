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

export interface ToolCallPart {
    type: 'tool-call';
    toolCallId: string;
    toolName: string;
    args: unknown;
}

export interface FilePart {
    type: 'file';
    data: DataContent | URL;
}

export interface ToolResultPart {
    type: 'tool-result';
    toolCallId: string;
    toolName: string;
    result: unknown;
}

export type AssistantContent = string | Array<TextPart | ToolCallPart>;
export type UserContent = string | Array<TextPart | ImagePart | FilePart>;
export type ToolContent = Array<ToolResultPart>;

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

export interface CoreToolMessage {
    role: 'tool';
    content: ToolContent;
}
