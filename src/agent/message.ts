export type DataContent = string | Uint8Array | ArrayBuffer | Buffer;

interface TextPart {
    type: 'text';
    text: string;
}

interface ImagePart {
    type: 'image';
    image: DataContent | URL;
    mimeType?: string;
}

interface ToolCallPart {
    type: 'tool-call';
    toolCallId: string;
    toolName: string;
    args: unknown;
}

interface FilePart {
    type: 'file';
    data: DataContent | URL;
}

interface ToolResultPart {
    type: 'tool-result';
    toolCallId: string;
    toolName: string;
    result: unknown;
}

type AssistantContent = string | Array<TextPart | ToolCallPart>;
type UserContent = string | Array<TextPart | ImagePart | FilePart>;
type ToolContent = Array<ToolResultPart>;

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
