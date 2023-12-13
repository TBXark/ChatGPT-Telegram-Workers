/* eslint-disable indent */
import { ENV, DATABASE } from './env.js'
import { SHARE_CONTEXT } from './context.js'
import { sendMessageToTelegram } from './telegram.js'

export function needToAskForActivation(user) {
  if (user?.isActivated) return false

  const areLimitedMessages
    = typeof ENV.AMOUNT_OF_FREE_MESSAGES === 'number' && ENV.AMOUNT_OF_FREE_MESSAGES < Infinity

  if (
    areLimitedMessages
    && ENV.ACTIVATION_CODE
    && typeof user.msgCounter === 'number'
    && user.msgCounter >= ENV.AMOUNT_OF_FREE_MESSAGES
  ) {
    return true
  }

  return false
}

export async function checkAndValidateActivationMessage(message) {
  if (message.text.match(/This is the activation code: ?\n?[a-zA-Z0-9 ]{4,128}$/m)) {
    const codeSent = message.text.match(/^[a-zA-Z0-9 ]{4,128}$/m)

    if (String(codeSent) !== String(ENV.ACTIVATION_CODE)) {
      return sendMessageToTelegram('Your code is incorrect')
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
