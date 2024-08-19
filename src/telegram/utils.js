import '../types/context.js';
import { DATABASE } from '../config/env.js';
import { getChatAdministrators } from './telegram.js';

/**
 * @param {string} content
 * @param {TelegramMessageEntity[]} entities
 * @param {string} botName
 * @param {TelegramID} botId
 * @returns {{isMention: boolean, content}}
 */
export function checkMention(content, entities, botName, botId) {
    let isMention = false;
    for (const entity of entities) {
        const entityStr = content.slice(entity.offset, entity.offset + entity.length);
        switch (entity.type) {
            case 'mention': // "mention"适用于有用户名的普通用户
                if (entityStr === `@${botName}`) {
                    isMention = true;
                    content = content.slice(0, entity.offset) + content.slice(entity.offset + entity.length);
                }
                break;
            case 'text_mention': // "text_mention"适用于没有用户名的用户或需要通过ID提及用户的情况
                if (`${entity.user.id}` === `${botId}`) {
                    isMention = true;
                    content = content.slice(0, entity.offset) + content.slice(entity.offset + entity.length);
                }
                break;
            case 'bot_command': // "bot_command"适用于命令
                if (entityStr.endsWith(`@${botName}`)) {
                    isMention = true;
                    const newEntityStr = entityStr.replace(`@${botName}`, '');
                    content = content.slice(0, entity.offset) + newEntityStr + content.slice(entity.offset + entity.length);
                }
                break;
            default:
                break;
        }
    }
    return {
        isMention,
        content,
    };
}

/**
 * @param {TelegramPhoto[]} photos
 * @param {number} offset
 * @returns {string|*}
 */
export function findPhotoFileID(photos, offset) {
    let sizeIndex = 0;
    if (offset >= 0) {
        sizeIndex = offset;
    } else if (offset < 0) {
        sizeIndex = photos.length + offset;
    }
    sizeIndex = Math.max(0, Math.min(sizeIndex, photos.length - 1));
    return photos[sizeIndex].file_id;
};

/**
 * 获取用户在群中的角色
 * @param {ContextType} context
 * @returns {Promise<string>}
 */
export async function getChatRoleWithContext(context) {
    const {
        chatId,
        speakerId,
        groupAdminKey,
        currentBotToken: token,
        allMemberAreAdmin,
    } = context.SHARE_CONTEXT;

    if (allMemberAreAdmin) {
        return 'administrator';
    }

    let groupAdmin;
    try {
        groupAdmin = JSON.parse(await DATABASE.get(groupAdminKey));
    } catch (e) {
        console.error(e);
    }
    if (!groupAdmin || !Array.isArray(groupAdmin) || groupAdmin.length === 0) {
        const { result } = await getChatAdministrators(chatId, token);
        if (result == null) {
            return null;
        }
        groupAdmin = result;
        // 缓存120s
        await DATABASE.put(
            groupAdminKey,
            JSON.stringify(groupAdmin),
            { expiration: (Date.now() / 1000) + 120 },
        );
    }
    for (let i = 0; i < groupAdmin.length; i++) {
        const user = groupAdmin[i];
        if (`${user.user.id}` === `${speakerId}`) {
            return user.status;
        }
    }
    return 'member';
}
