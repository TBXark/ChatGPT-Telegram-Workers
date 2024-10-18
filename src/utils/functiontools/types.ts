export interface SchemaData {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: Record<string, {
            type: string;
            items?: {
                type: string;
            };
            description: string;
        }>;
        required: string[];
        additionalProperties: boolean;
    };
}

export interface FuncTool {
    schema: SchemaData;
    func: (params: Record<string, any>, signal?: AbortSignal) => Promise<string>;
}
