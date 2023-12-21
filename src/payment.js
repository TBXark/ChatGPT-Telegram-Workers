/* eslint-disable indent */
import { ENV, DATABASE } from './env.js'
import { SHARE_CONTEXT } from './context.js'
import { sendMessageToTelegram } from './telegram.js'

export function needToAskForActivation(user) {
  if (user?.isActivated) return false

  const areLimitedMessages =
    typeof ENV.AMOUNT_OF_FREE_MESSAGES === 'number' && ENV.AMOUNT_OF_FREE_MESSAGES < Infinity

  if (
    areLimitedMessages &&
    ENV.ACTIVATION_CODE &&
    typeof user.msgCounter === 'number' &&
    user.msgCounter >= ENV.AMOUNT_OF_FREE_MESSAGES
  ) {
    return true
  }

  return false
}

export const extractActivationCode = (msg) => {
  if (typeof msg !== 'string') return null

  const match = msg.trim().match(/Activation code:\s*([a-zA-Z0-9 ]{4,128})/)
  return match ? match[1] : null
}

export async function checkAndValidateActivationMessage(message) {
  const code = extractActivationCode(message.text)
  if (code) {
    if (String(code) !== String(ENV.ACTIVATION_CODE)) {
      return sendMessageToTelegram('Your code is wrong')
    }

    const user = JSON.parse(await DATABASE.get(SHARE_CONTEXT.userStoreKey))

    await DATABASE.put(
      SHARE_CONTEXT.userStoreKey,
      JSON.stringify({
        ...user,
        isActivated: true,
      }),
    )

    return sendMessageToTelegram('Successfully activated')
  }

  return null
}
