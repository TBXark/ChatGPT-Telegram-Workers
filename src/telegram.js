/* eslint-disable indent */
import { DATABASE, ENV } from './env.js'
import { CURRENT_CHAT_CONTEXT, SHARE_CONTEXT } from './context.js'
import logger from './logger.js'

async function sendMessage(message, token, context) {
  if (!message) throw new Error('No Telegram message to send')
  if (!token) throw new Error('Missing Telegram bot token to send a message')
  if (!context?.chat_id) throw new Error('Missing Telegram chat ID to send a message')

  return await fetch(`${ENV.TELEGRAM_API_DOMAIN}/bot${token}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...context,
      text: message,
    }),
  })
}

export async function sendMessageToTelegram(message, token, context) {
  const botToken = token || SHARE_CONTEXT.currentBotToken
  const chatContext = context || CURRENT_CHAT_CONTEXT
  if (message.length <= 4096) {
    return await sendMessage(message, botToken, chatContext)
  }

  const limit = 4000
  chatContext.parse_mode = 'HTML'
  for (let i = 0; i < message.length; i += limit) {
    const msg = message.slice(i, i + limit)
    await sendMessage(`<pre>\n${msg}\n</pre>`, botToken, chatContext)
  }
  return new Response('MESSAGE BATCH SEND', { status: 200 })
}

// export async function sendPhotoToTelegram(url, token, context) {
//   const chatContext = Object.assign(context || CURRENT_CHAT_CONTEXT, { parse_mode: null });
//   return await fetch(
//     `${ENV.TELEGRAM_API_DOMAIN}/bot${token || SHARE_CONTEXT.currentBotToken}/sendPhoto`,
//     {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         ...chatContext,
//         photo: url,
//       }),
//     },
//   );
// }

export async function sendChatActionToTelegram(action, token) {
  return await fetch(
    `${ENV.TELEGRAM_API_DOMAIN}/bot${token || SHARE_CONTEXT.currentBotToken}/sendChatAction`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CURRENT_CHAT_CONTEXT.chat_id,
        action: action,
      }),
    },
  ).then((res) => res.json())
}

// export async function deleteMessageInlineKeyboard(chatId, messageId, token) {
//   return await fetch(
//     `${ENV.TELEGRAM_API_DOMAIN}/bot${
//       token || SHARE_CONTEXT.currentBotToken
//     }/editMessageReplyMarkup`,
//     {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         chat_id: chatId,
//         message_id: messageId,
//         reply_markup: {
//           inline_keyboard: [],
//         },
//       }),
//     },
//   ).then((res) => res.json())
// }

export async function setTelegramWebhook(token, url) {
  return await fetch(`${ENV.TELEGRAM_API_DOMAIN}/bot${token}/setWebhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: url,
    }),
  }).then((res) => res.json())
}

export async function deleteTelegramWebhook(token) {
  return await fetch(`${ENV.TELEGRAM_API_DOMAIN}/bot${token}/deleteWebhook`).then((res) =>
    res.json(),
  )
}

export async function getChatRole(id) {
  let groupAdmin
  try {
    groupAdmin = JSON.parse(await DATABASE.get(SHARE_CONTEXT.groupAdminKey))
  } catch (e) {
    logger('error', e)
    return e.message
  }
  if (!groupAdmin || !Array.isArray(groupAdmin) || groupAdmin.length === 0) {
    const administers = await getChatAdminister(CURRENT_CHAT_CONTEXT.chat_id)
    if (administers == null) {
      return null
    }
    groupAdmin = administers
    // Cache 120s
    await DATABASE.put(SHARE_CONTEXT.groupAdminKey, JSON.stringify(groupAdmin), {
      expiration: parseInt(Date.now() / 1000) + 120,
    })
  }
  for (let i = 0; i < groupAdmin.length; i++) {
    const user = groupAdmin[i]
    if (user.user.id === id) {
      return user.status
    }
  }
  return 'member'
}

// Get group administrator information
export async function getChatAdminister(chatId, token) {
  try {
    const resp = await fetch(
      `${ENV.TELEGRAM_API_DOMAIN}/bot${
        token || SHARE_CONTEXT.currentBotToken
      }/getChatAdministrators`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chat_id: chatId }),
      },
    ).then((res) => res.json())
    if (resp.ok) {
      return resp.result
    }
  } catch (e) {
    logger('error', e)
    return null
  }
}

// Get robot information
export async function getBot(token) {
  const resp = await fetch(`${ENV.TELEGRAM_API_DOMAIN}/bot${token}/getMe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((res) => res.json())
  if (resp.ok) {
    return {
      ok: true,
      info: {
        name: resp.result.first_name,
        bot_name: resp.result.username,
        can_join_groups: resp.result.can_join_groups,
        can_read_all_group_messages: resp.result.can_read_all_group_messages,
      },
    }
  } else {
    return resp
  }
}
