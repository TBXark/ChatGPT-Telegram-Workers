import { CHAT_AGENTS, Workers } from '@chatgpt-telegram-workers/core';
import { injectNextChatAgent } from '@chatgpt-telegram-workers/next';

injectNextChatAgent(CHAT_AGENTS);
export default Workers;
