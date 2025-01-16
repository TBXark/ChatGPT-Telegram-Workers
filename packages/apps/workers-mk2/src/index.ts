import { ENV, Workers } from '@chatgpt-telegram-workers/core';
import convert from 'telegramify-markdown';

ENV.CUSTOM_MESSAGE_RENDER = (parse_mode, message) => {
    if (parse_mode === 'MarkdownV2') {
        return convert(message, 'remove');
    }
    return message;
};
export default Workers;
