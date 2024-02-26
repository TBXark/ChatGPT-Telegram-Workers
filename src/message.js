/* eslint-disable indent */
import { ENV, DATABASE, CONST } from './env.js'
import {
  SHARE_CONTEXT,
  USER_CONFIG,
  USER_DEFINE,
  CURRENT_CHAT_CONTEXT,
  initContext,
  initTelegramContext,
} from './context.js'
import { checkAndValidateActivationMessage, needToAskForActivation } from './payment.js'
import { sendMessageToTelegram, sendChatActionToTelegram } from './telegram.js'
import { requestCompletionsFromChatGPT } from './openai.js'
import { handleCommandMessage } from './command.js'
import { errorToString, tokensCounter } from './utils.js'
import logger from './logger.js'


async function msgInitChatContext(message) {
  try {
    await initContext(message)
  } catch (e) {
    return new Response(errorToString(e), { status: 500 })
  }

  return null
}

async function msgSaveLastMessage(message) {
  if (ENV.DEBUG_MODE) {
    const lastMessageKey = `last_message:${SHARE_CONTEXT.chatHistoryKey}`
    await DATABASE.put(lastMessageKey, JSON.stringify(message))
  }

  return null
}

async function msgCheckEnvIsReady(message) {
  if (!ENV.API_KEY) {
    return sendMessageToTelegram('OpenAI API key is not set')
  }
  if (!DATABASE) {
    return sendMessageToTelegram('DATABASE is not set')
  }

  return null
}

async function msgCheckAndValidateActivation(message) {
  if (!ENV.ACTIVATION_CODE) return null

  return checkAndValidateActivationMessage(message)
}

async function msgCheckRestrictionsAndCountMessages(message) {
  try {
    const user = JSON.parse(await DATABASE.get(SHARE_CONTEXT.userStoreKey))

    if (!user) {
      await DATABASE.put(
        SHARE_CONTEXT.userStoreKey,
        JSON.stringify({
          msgCounter: 1,
        }),
      )
    } else if (needToAskForActivation(user)) {
      const response = ENV.LINK_TO_PAY_FOR_CODE
        ? `<b>You've reached the limit of free messages.</b>\nTo continue using this bot you need to pay for the activation code via the link below:\n<a href="${ENV.LINK_TO_PAY_FOR_CODE}">Pay for usage</a>\nAfter payment, you need to send a message here with an activation code in the format:\n\n<i>Activation code: YOUR CODE</i>`
        : `<b>You've reached the limit of free messages.</b>\nTo continue using this bot you need to send a message here with an activation code in the format:\n\n<i>Activation code: YOUR CODE</i>`

      return sendMessageToTelegram(response, undefined, {
        ...CURRENT_CHAT_CONTEXT,
        parse_mode: 'HTML',
      })
    } else {
      await DATABASE.put(
        SHARE_CONTEXT.userStoreKey,
        JSON.stringify({
          ...user,
          msgCounter: (user.msgCounter || 0) + 1,
        }),
      )
    }
  } catch (e) {
    return new Response(errorToString(e), { status: 500 })
  }

  return null
}

// Filter non-whitelisted users
async function msgFilterWhiteList(message) {
  if (ENV.I_AM_A_GENEROUS_PERSON) {
    return null
  }
  // Judge private chat messages
  if (SHARE_CONTEXT.chatType === 'private') {
    // Whitelist judgment
    if (!ENV.CHAT_WHITE_LIST.includes(`${CURRENT_CHAT_CONTEXT.chat_id}`)) {
      return sendMessageToTelegram(
        `You do not have permission to use this command, please contact the administrator to add your ID(${CURRENT_CHAT_CONTEXT.chat_id}) to the whitelist`,
      )
    }
    return null
  }

  // Judge group chat messages
  if (CONST.GROUP_TYPES.includes(SHARE_CONTEXT.chatType)) {
    if (!ENV.GROUP_CHAT_BOT_ENABLE) {
      return new Response('ID SUPPORT', { status: 401 })
    }
    if (!ENV.CHAT_GROUP_WHITE_LIST.includes(`${CURRENT_CHAT_CONTEXT.chat_id}`)) {
      return sendMessageToTelegram(
        `This group does not have chat permission enabled, please contact the administrator to add a group ID(${CURRENT_CHAT_CONTEXT.chat_id}) to the whitelist`,
      )
    }
    return null
  }
  return sendMessageToTelegram(
    `This type is not supported at the moment (${SHARE_CONTEXT.chatType}) the chat`,
  )
}

async function msgFilterNonTextMessage(message) {
  if (!message.text) {
    return sendMessageToTelegram('Non-text format messages are not supported for the time being')
  }
  return null
}

async function msgHandleGroupMessage(message) {
  if (!message.text) {
    return new Response('NON TEXT MESSAGE', { status: 200 })
  }
  const botName = SHARE_CONTEXT.currentBotName
  if (botName) {
    let mentioned = false

    if (message.reply_to_message) {
      if (message.reply_to_message.from.username === botName) {
        mentioned = true
      }
    }
    if (message.entities) {
      let content = ''
      let offset = 0
      message.entities.forEach((entity) => {
        switch (entity.type) {
          case 'bot_command':
            if (!mentioned) {
              const mention = message.text.substring(entity.offset, entity.offset + entity.length)
              if (mention.endsWith(botName)) {
                mentioned = true
              }
              const cmd = mention.replaceAll(`@${botName}`, '').replaceAll(botName).trim()
              content += cmd
              offset = entity.offset + entity.length
            }
            break
          case 'mention':
          case 'text_mention':
            if (!mentioned) {
              const mention = message.text.substring(entity.offset, entity.offset + entity.length)
              if (mention === botName || mention === `@${botName}`) {
                mentioned = true
              }
            }
            content += message.text.substring(offset, entity.offset)
            offset = entity.offset + entity.length
            break
        }
      })
      content += message.text.substring(offset, message.text.length)
      message.text = content.trim()
    }
    if (!mentioned) {
      return new Response('NOT MENTIONED', { status: 200 })
    } else {
      return null
    }
  }
  return new Response('NOT SET BOTNAME', { status: 200 })
}

async function msgHandleCommand(message) {
  return await handleCommandMessage(message)
}

async function msgHandleRole(message) {
  if (!message.text.startsWith('~')) return null

  message.text = message.text.slice(1)
  const kv = message.text.indexOf(' ')
  if (kv === -1) return null

  const role = message.text.slice(0, kv)
  const msg = message.text.slice(kv + 1).trim()

  if (Object.hasOwn(USER_DEFINE.ROLE, role)) {
    SHARE_CONTEXT.ROLE = role
    message.text = msg
    const roleConfig = USER_DEFINE.ROLE[role]
    for (const k in roleConfig) {
      if (Object.hasOwn(USER_CONFIG, k) && typeof USER_CONFIG[k] === typeof roleConfig[k]) {
        USER_CONFIG[k] = roleConfig[k]
      }
    }
  }
}



async function msgChatWithOpenAI(message) {
  try {
    const historyDisable = ENV.AUTO_TRIM_HISTORY && ENV.MAX_HISTORY_LENGTH <= 0
    setTimeout(() => sendChatActionToTelegram('typing').catch(console.error), 0)
    const historyKey = SHARE_CONTEXT.chatHistoryKey
    const { real: history, original: original } = await loadHistory(historyKey)

    const answer = await requestCompletionsFromChatGPT(message.text, history)

    if (!historyDisable) {
      original.push({
        role: 'user',
        content: message.text || '',
        cosplay: SHARE_CONTEXT.ROLE || '',
      })
      original.push({ role: 'assistant', content: answer, cosplay: SHARE_CONTEXT.ROLE || '' })
      await DATABASE.put(historyKey, JSON.stringify(original)).catch(console.error)
    }

    //if answer match /{apiCall:"https://onout.org/api", {product:"его продукт",audience:"аудитория",chatId:"[chatid]"}/ then call the apiCall. all debug logs put to answer and send to telegram 
    if (answer.match(/chatId:"([^"]+)"/)) {
     
      let apiCallData = {
        apiCall: "",
        product: "",
        audience: "",
        chatId: ""
      };
      
      // Regular expressions for each element
      const apiCallRegex = /apiCall:"([^"]+)"/;
      const productRegex = /product:"([^"]+)"/;
      const audienceRegex = /audience:"([^"]+)"/;
      const chatIdRegex = /chatId:"([^"]+)"/;
      
      // Match and extract 'apiCall' URL
      const apiCallMatch = answer.match(apiCallRegex);
      if (apiCallMatch && apiCallMatch[1]) {
        apiCallData.apiCall = apiCallMatch[1];
      }
      
      // Match and extract 'product'
      const productMatch = answer.match(productRegex);
      if (productMatch && productMatch[1]) {
        apiCallData.product = productMatch[1];
      }
      
      // Match and extract 'audience'
      const audienceMatch = answer.match(audienceRegex);
      if (audienceMatch && audienceMatch[1]) {
        apiCallData.audience = audienceMatch[1];
      }
      
      // Match and extract 'chatId'
      const chatIdMatch = answer.match(chatIdRegex);
      if (chatIdMatch && chatIdMatch[1]) {
        apiCallData.chatId = chatIdMatch[1];
      }
      
      const options = {
        method: 'POST',
        headers: {
          'User-Agent': CONST.USER_AGENT,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiCallData),
      }

      
      
      //normalize apiCallData.apiCall
      if (!apiCallData.apiCall.startsWith('http')) {
        apiCallData.apiCall = `https://${apiCallData.apiCall}`;
      }
      //trim and other
      apiCallData.apiCall = apiCallData.apiCall.trim();

      
      await fetch('https://telegram.onout.org/callPipeline', options)
        .then(response => {
          console.log('statusCode:', response.status)
          return sendMessageToTelegram(`statusCode: ${response.status}`)
        })
        .then(body => {
          console.log('body:', body)
          return sendMessageToTelegram(`statusCode: ${response.status}\nbody: ${JSON.stringify(body)}`)
        })
        .catch(error => {
          console.error('An error occurred:', error)
          return sendMessageToTelegram('Error calling pipeline')
        })
    }

    return sendMessageToTelegram(answer)
  } catch (e) {
    //send e to telegram
    

    return sendMessageToTelegram(
      'An error occurred while processing the message, please try again later'+errorToString(e),
    )
  }
}

export async function msgProcessByChatType(message) {
  const handlerMap = {
    private: [msgFilterWhiteList, msgFilterNonTextMessage, msgHandleCommand, msgHandleRole],
    group: [msgHandleGroupMessage, msgFilterWhiteList, msgHandleCommand, msgHandleRole],
    supergroup: [msgHandleGroupMessage, msgFilterWhiteList, msgHandleCommand, msgHandleRole],
  }
  if (!Object.hasOwn(handlerMap, SHARE_CONTEXT.chatType)) {
    return sendMessageToTelegram(
      `This type is not supported at the moment (${SHARE_CONTEXT.chatType}) the chat`,
    )
  }

  const handlers = handlerMap[SHARE_CONTEXT.chatType]
  for (const handler of handlers) {
    try {
      const result = await handler(message)
      if (result && result instanceof Response) {
        return result
      }
    } catch (e) {
      logger('error', e)
      return sendMessageToTelegram(
        `Deal with (${SHARE_CONTEXT.chatType}) the chat message went wrong`,
      )
    }
  }
  return null
}

async function loadMessage(request) {
  const raw = await request.json()

  if (ENV.DEV_MODE) {
    setTimeout(() => {
      DATABASE.put(`log:${new Date().toISOString()}`, JSON.stringify(raw), {
        expirationTtl: 600,
      }).catch(console.error)
    })
  }
  if (raw.edited_message) {
    raw.message = raw.edited_message
    SHARE_CONTEXT.editChat = true
  }

  if (raw.message) {
    return raw.message
  }
  throw new Error('Invalid message')
}

// { real: [], fake: [] }
async function loadHistory(key) {
  const initMessage = { role: 'system', content: USER_CONFIG.SYSTEM_INIT_MESSAGE }
  const historyDisable = ENV.AUTO_TRIM_HISTORY && ENV.MAX_HISTORY_LENGTH <= 0

  if (historyDisable) {
    return { real: [initMessage], original: [initMessage] }
  }

  let history = []
  try {
    history = JSON.parse(await DATABASE.get(key))
  } catch (e) {
    logger('error', e)
  }
  if (!history || !Array.isArray(history)) {
    history = []
  }

  let original = JSON.parse(JSON.stringify(history))

  if (SHARE_CONTEXT.ROLE) {
    history = history.filter((chat) => SHARE_CONTEXT.ROLE === chat.cosplay)
  }
  history.forEach((item) => {
    delete item.cosplay
  })

  const counter = await tokensCounter()

  const trimHistory = (list, initLength, maxLength, maxToken) => {
    if (list.length > maxLength) {
      list = list.splice(list.length - maxLength)
    }
    let tokenLength = initLength
    for (let i = list.length - 1; i >= 0; i--) {
      const historyItem = list[i]
      let length = 0
      if (historyItem.content) {
        length = counter(historyItem.content)
      } else {
        historyItem.content = ''
      }
      tokenLength += length
      if (tokenLength > maxToken) {
        list = list.splice(i + 1)
        break
      }
    }
    return list
  }

  if (ENV.AUTO_TRIM_HISTORY && ENV.MAX_HISTORY_LENGTH > 0) {
    const initLength = counter(initMessage.content)
    const roleCount = Math.max(Object.keys(USER_DEFINE.ROLE).length, 1)
    history = trimHistory(history, initLength, ENV.MAX_HISTORY_LENGTH, ENV.MAX_TOKEN_LENGTH)
    original = trimHistory(
      original,
      initLength,
      ENV.MAX_HISTORY_LENGTH * roleCount,
      ENV.MAX_TOKEN_LENGTH * roleCount,
    )
  }

  switch (history.length > 0 ? history[0].role : '') {
    case 'assistant':
    case 'system':
      history[0] = initMessage
      break
    default:
      history.unshift(initMessage)
  }

  if (
    ENV.SYSTEM_INIT_MESSAGE_ROLE !== 'system' &&
    history.length > 0 &&
    history[0].role === 'system'
  ) {
    history[0].role = ENV.SYSTEM_INIT_MESSAGE_ROLE
  }

  return { real: history, original: original }
}

export async function handleMessage(request) {
  initTelegramContext(request)

  const message = await loadMessage(request)

  // Message processing middleware
  const handlers = [
    // Initialize the chat context: generate chat_id, reply_to_message_id(Group message), SHARE_CONTEXT
    msgInitChatContext,
    msgSaveLastMessage,
    msgCheckEnvIsReady,
    msgCheckAndValidateActivation,
    msgCheckRestrictionsAndCountMessages,
    // Further process the message according to the type
    msgProcessByChatType,
    msgChatWithOpenAI,
  ]

  for (const handler of handlers) {
    try {
      const result = await handler(message)

      if (result && result instanceof Response) {
        return result
      }
    } catch (e) {
      logger('error', e)
      return new Response(errorToString(e), { status: 500 })
    }
  }

  return null
}
