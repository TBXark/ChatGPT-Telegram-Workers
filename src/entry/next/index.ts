import { CHAT_AGENTS } from '../../agent';
import { injectNextChatAgent } from '../../agent/next/next';

injectNextChatAgent(CHAT_AGENTS);
export * from '../core/index';
