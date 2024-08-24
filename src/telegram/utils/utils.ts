export function isTelegramChatTypeGroup(type: string): boolean {
    return type === 'group' || type === 'supergroup';
}
