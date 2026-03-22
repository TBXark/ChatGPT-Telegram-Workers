import type { AgentUserConfig } from '#/config';
import type { LLMChatParams } from './types';
import { CHAT_AGENTS, loadChatLLM } from './agent';
import { MiniMax } from '#/agent/openai_agents';
import { ENV } from '#/config';
import '#/config/env.test';

function createMockConfig(overrides: Partial<AgentUserConfig> = {}): AgentUserConfig {
    return {
        ...ENV.USER_CONFIG,
        ...overrides,
    } as AgentUserConfig;
}

describe('MiniMax Agent', () => {
    describe('registration', () => {
        it('should be registered in CHAT_AGENTS', () => {
            const minimax = CHAT_AGENTS.find(a => a.name === 'minimax');
            expect(minimax).toBeDefined();
        });

        it('should be an instance of MiniMax', () => {
            const minimax = CHAT_AGENTS.find(a => a.name === 'minimax');
            expect(minimax).toBeInstanceOf(MiniMax);
        });
    });

    describe('configuration', () => {
        it('should have correct default config values', () => {
            const config = ENV.USER_CONFIG;
            expect(config.MINIMAX_API_KEY).toBeNull();
            expect(config.MINIMAX_API_BASE).toBe('https://api.minimax.io/v1');
            expect(config.MINIMAX_CHAT_MODEL).toBe('MiniMax-M1');
            expect(config.MINIMAX_CHAT_MODELS_LIST).toBe('["MiniMax-M1","MiniMax-M1-80k"]');
        });

        it('should include MINIMAX_API_BASE in LOCK_USER_CONFIG_KEYS', () => {
            expect(ENV.LOCK_USER_CONFIG_KEYS).toContain('MINIMAX_API_BASE');
        });
    });

    describe('enable', () => {
        it('should be disabled when API key is null', () => {
            const minimax = CHAT_AGENTS.find(a => a.name === 'minimax')!;
            const config = createMockConfig({ MINIMAX_API_KEY: null });
            expect(minimax.enable(config)).toBe(false);
        });

        it('should be disabled when API key is empty string', () => {
            const minimax = CHAT_AGENTS.find(a => a.name === 'minimax')!;
            const config = createMockConfig({ MINIMAX_API_KEY: '' });
            expect(minimax.enable(config)).toBe(false);
        });

        it('should be enabled when API key is set', () => {
            const minimax = CHAT_AGENTS.find(a => a.name === 'minimax')!;
            const config = createMockConfig({ MINIMAX_API_KEY: 'test-key' });
            expect(minimax.enable(config)).toBe(true);
        });
    });

    describe('model', () => {
        it('should return the configured model', () => {
            const minimax = CHAT_AGENTS.find(a => a.name === 'minimax')!;
            const config = createMockConfig({ MINIMAX_CHAT_MODEL: 'MiniMax-M1-80k' });
            expect(minimax.model(config)).toBe('MiniMax-M1-80k');
        });

        it('should return default model when not overridden', () => {
            const minimax = CHAT_AGENTS.find(a => a.name === 'minimax')!;
            const config = createMockConfig();
            expect(minimax.model(config)).toBe('MiniMax-M1');
        });
    });

    describe('modelKey', () => {
        it('should have MINIMAX_CHAT_MODEL as modelKey', () => {
            const minimax = CHAT_AGENTS.find(a => a.name === 'minimax')!;
            expect(minimax.modelKey).toBe('MINIMAX_CHAT_MODEL');
        });
    });

    describe('loadChatLLM', () => {
        it('should load MiniMax agent when AI_PROVIDER is minimax', () => {
            const config = createMockConfig({
                AI_PROVIDER: 'minimax',
            });
            const agent = loadChatLLM(config);
            expect(agent).toBeDefined();
            expect(agent!.name).toBe('minimax');
        });

        it('should auto-detect MiniMax when API key is set and no other provider keys exist', () => {
            const config = createMockConfig({
                AI_PROVIDER: 'auto',
                OPENAI_API_KEY: [],
                MINIMAX_API_KEY: 'test-key',
                ANTHROPIC_API_KEY: null,
                GOOGLE_API_KEY: null,
                AZURE_API_KEY: null,
                CLOUDFLARE_ACCOUNT_ID: null,
                CLOUDFLARE_TOKEN: null,
                COHERE_API_KEY: null,
                MISTRAL_API_KEY: null,
                DEEPSEEK_API_KEY: null,
                GROQ_API_KEY: null,
                XAI_API_KEY: null,
            });
            const agent = loadChatLLM(config);
            expect(agent).toBeDefined();
            expect(agent!.name).toBe('minimax');
        });
    });

    describe('modelList', () => {
        it('should return static model list from JSON config', async () => {
            const minimax = CHAT_AGENTS.find(a => a.name === 'minimax')!;
            const config = createMockConfig({
                MINIMAX_API_KEY: 'test-key',
                MINIMAX_CHAT_MODELS_LIST: '["MiniMax-M1","MiniMax-M1-80k"]',
            });
            const models = await minimax.modelList(config);
            expect(models).toEqual(['MiniMax-M1', 'MiniMax-M1-80k']);
        });
    });

    describe('request', () => {
        it('should construct correct request with MiniMax API', async () => {
            const minimax = CHAT_AGENTS.find(a => a.name === 'minimax')!;
            const config = createMockConfig({
                MINIMAX_API_KEY: 'test-key-12345',
                MINIMAX_API_BASE: 'https://api.minimax.io/v1',
                MINIMAX_CHAT_MODEL: 'MiniMax-M1',
            });
            const params: LLMChatParams = {
                prompt: 'You are a helpful assistant.',
                messages: [{ role: 'user', content: 'Hello' }],
            };

            const fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
                new Response(JSON.stringify({
                    choices: [{ message: { role: 'assistant', content: 'Hi there!' } }],
                }), {
                    headers: { 'content-type': 'application/json' },
                }),
            );

            try {
                const result = await minimax.request(params, config, null);
                expect(result).toBeDefined();
                expect(result.text).toBe('Hi there!');

                expect(fetchSpy).toHaveBeenCalledTimes(1);
                const [url, options] = fetchSpy.mock.calls[0];
                expect(url).toBe('https://api.minimax.io/v1/chat/completions');
                expect((options as any).method).toBe('POST');

                const headers = (options as any).headers;
                expect(headers.Authorization).toBe('Bearer test-key-12345');

                const body = JSON.parse((options as any).body);
                expect(body.model).toBe('MiniMax-M1');
                expect(body.stream).toBe(false);
                expect(body.messages).toHaveLength(2);
                expect(body.messages[0]).toEqual({ role: 'system', content: 'You are a helpful assistant.' });
                expect(body.messages[1]).toEqual({ role: 'user', content: 'Hello' });
            } finally {
                fetchSpy.mockRestore();
            }
        });

        it('should support streaming mode', async () => {
            const minimax = CHAT_AGENTS.find(a => a.name === 'minimax')!;
            const config = createMockConfig({
                MINIMAX_API_KEY: 'test-key',
                MINIMAX_API_BASE: 'https://api.minimax.io/v1',
                MINIMAX_CHAT_MODEL: 'MiniMax-M1',
            });
            const params: LLMChatParams = {
                prompt: 'You are a helper.',
                messages: [{ role: 'user', content: 'Hi' }],
            };

            const sseData = [
                'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n',
                'data: {"choices":[{"delta":{"content":" world"}}]}\n\n',
                'data: [DONE]\n\n',
            ].join('');

            const encoder = new TextEncoder();
            const stream = new ReadableStream({
                start(controller) {
                    controller.enqueue(encoder.encode(sseData));
                    controller.close();
                },
            });

            const fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
                new Response(stream, {
                    headers: { 'content-type': 'text/event-stream' },
                }),
            );

            try {
                const chunks: string[] = [];
                const onStream = async (text: string) => {
                    chunks.push(text);
                };
                const result = await minimax.request(params, config, onStream);
                expect(result).toBeDefined();
                expect(result.text).toBe('Hello world');

                const [url, options] = fetchSpy.mock.calls[0];
                const body = JSON.parse((options as any).body);
                expect(body.stream).toBe(true);
            } finally {
                fetchSpy.mockRestore();
            }
        });

        it('should use custom API base when configured', async () => {
            const minimax = CHAT_AGENTS.find(a => a.name === 'minimax')!;
            const config = createMockConfig({
                MINIMAX_API_KEY: 'test-key',
                MINIMAX_API_BASE: 'https://custom-proxy.example.com/v1',
                MINIMAX_CHAT_MODEL: 'MiniMax-M1',
            });
            const params: LLMChatParams = {
                prompt: 'Test',
                messages: [{ role: 'user', content: 'test' }],
            };

            const fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
                new Response(JSON.stringify({
                    choices: [{ message: { role: 'assistant', content: 'ok' } }],
                }), {
                    headers: { 'content-type': 'application/json' },
                }),
            );

            try {
                await minimax.request(params, config, null);
                const [url] = fetchSpy.mock.calls[0];
                expect(url).toBe('https://custom-proxy.example.com/v1/chat/completions');
            } finally {
                fetchSpy.mockRestore();
            }
        });

        it('should pass extra params when configured', async () => {
            const minimax = CHAT_AGENTS.find(a => a.name === 'minimax')!;
            const config = createMockConfig({
                MINIMAX_API_KEY: 'test-key',
                MINIMAX_API_BASE: 'https://api.minimax.io/v1',
                MINIMAX_CHAT_MODEL: 'MiniMax-M1',
                MINIMAX_CHAT_EXTRA_PARAMS: { temperature: 0.7, top_p: 0.9 },
            });
            const params: LLMChatParams = {
                prompt: 'Test',
                messages: [{ role: 'user', content: 'test' }],
            };

            const fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
                new Response(JSON.stringify({
                    choices: [{ message: { role: 'assistant', content: 'ok' } }],
                }), {
                    headers: { 'content-type': 'application/json' },
                }),
            );

            try {
                await minimax.request(params, config, null);
                const body = JSON.parse((fetchSpy.mock.calls[0][1] as any).body);
                expect(body.temperature).toBe(0.7);
                expect(body.top_p).toBe(0.9);
            } finally {
                fetchSpy.mockRestore();
            }
        });
    });
});

describe('MiniMax Integration Tests', () => {
    const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;

    const itIntegration = MINIMAX_API_KEY ? it : it.skip;

    itIntegration('should complete a chat request with MiniMax API', async () => {
        const minimax = CHAT_AGENTS.find(a => a.name === 'minimax')!;
        const config = createMockConfig({
            MINIMAX_API_KEY: MINIMAX_API_KEY!,
            MINIMAX_API_BASE: 'https://api.minimax.io/v1',
            MINIMAX_CHAT_MODEL: 'MiniMax-M1',
        });
        const params: LLMChatParams = {
            prompt: 'You are a helpful assistant. Reply in one short sentence.',
            messages: [{ role: 'user', content: 'What is 2+2?' }],
        };

        const result = await minimax.request(params, config, null);
        expect(result).toBeDefined();
        expect(result.text.length).toBeGreaterThan(0);
        expect(result.responses.length).toBeGreaterThan(0);
    }, 30000);

    itIntegration('should stream a chat response from MiniMax API', async () => {
        const minimax = CHAT_AGENTS.find(a => a.name === 'minimax')!;
        const config = createMockConfig({
            MINIMAX_API_KEY: MINIMAX_API_KEY!,
            MINIMAX_API_BASE: 'https://api.minimax.io/v1',
            MINIMAX_CHAT_MODEL: 'MiniMax-M1',
        });
        const params: LLMChatParams = {
            prompt: 'Reply in one word only.',
            messages: [{ role: 'user', content: 'Say hello' }],
        };

        const result = await minimax.request(params, config, async (_text) => {
            // streaming callback
        });
        expect(result).toBeDefined();
        expect(result.text.length).toBeGreaterThan(0);
    }, 60000);

    itIntegration('should use static model list', async () => {
        const minimax = CHAT_AGENTS.find(a => a.name === 'minimax')!;
        const config = createMockConfig({
            MINIMAX_API_KEY: MINIMAX_API_KEY!,
            MINIMAX_API_BASE: 'https://api.minimax.io/v1',
            MINIMAX_CHAT_MODELS_LIST: '["MiniMax-M1","MiniMax-M1-80k"]',
        });
        const models = await minimax.modelList(config);
        expect(models).toBeDefined();
        expect(Array.isArray(models)).toBe(true);
        expect(models).toContain('MiniMax-M1');
    }, 30000);
});
