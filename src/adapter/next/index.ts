import { CHAT_AGENTS } from '../../agent';
import core from '../core/index';
import { NextChatAgent } from './next';

for (let i = 0; i < CHAT_AGENTS.length; i++) {
    const next = NextChatAgent.from(CHAT_AGENTS[i]);
    if (next) {
        CHAT_AGENTS[i] = next;
    }
}
export default core;
