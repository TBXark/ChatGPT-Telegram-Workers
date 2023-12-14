var yt = {
    API_KEY: 'string',
    AMOUNT_OF_FREE_MESSAGES: 'number',
    ACTIVATION_CODE: 'string',
    LINK_TO_PAY_FOR_CODE: 'string',
  },
  s = {
    API_KEY: null,
    CHAT_MODEL: 'gpt-3.5-turbo',
    TELEGRAM_AVAILABLE_TOKENS: [],
    TELEGRAM_BOT_NAME: [],
    I_AM_A_GENEROUS_PERSON: !1,
    CHAT_WHITE_LIST: [],
    CHAT_GROUP_WHITE_LIST: [],
    GROUP_CHAT_BOT_ENABLE: !0,
    GROUP_CHAT_BOT_SHARE_MODE: !1,
    AUTO_TRIM_HISTORY: !0,
    MAX_HISTORY_LENGTH: 20,
    MAX_TOKEN_LENGTH: 2048,
    GPT3_TOKENS_COUNT: !0,
    SYSTEM_INIT_MESSAGE: `Act like a &quot;professional support agent&quot; in the IT area. I need a concise and understandable answer that solves the user&#39;s question or problem. You will analyze a request, diagnose and summarize the main issues or questions, find the solution among the CSV data provided and answer. If you can&#39;t find it there, then make an answer based on your understanding. Please do not make very long answers or answers that are too general, in which case ask clarifying questions. Input the final result in a plain text.

Respond with a structured text. Make the question and answer on new lines. If the answer is taken from the provided CSV database, use &quot;Question:&quot; and &quot;Answer:&quot; as prefixes. If the answer is not found in the database, use &quot;Q:&quot; and &quot;A:&quot; as prefixes. Template structure for a known question from CSV:
\`\`\`
Question: A known question from a user. If it is clear which product the user has, please specify its name in the user&#39;s question. If possible, shorten the question without losing the meaning or problem.
Answer: The answer is taken from the database.
\`\`\`

Teplate structure for a new question:
\`\`\`
Q: New user question with product name if possible.
A: Your response.
\`\`\`

Respond with just this structure, no additional text or introductions. If you don&#39;t understand a problem, product, or user question, ask clarifying questions before the main analysis and answer.`,
    SYSTEM_INIT_MESSAGE_ROLE: 'system',
    ENABLE_USAGE_STATISTICS: !1,
    HIDE_COMMAND_BUTTONS: [],
    UPDATE_BRANCH: 'master',
    BUILD_TIMESTAMP: 1702558118,
    BUILD_VERSION: '3cb83a0',
    AMOUNT_OF_FREE_MESSAGES: 1 / 0,
    ACTIVATION_CODE: null,
    LINK_TO_PAY_FOR_CODE: null,
    DEBUG_MODE: !1,
    DEV_MODE: !1,
    TELEGRAM_API_DOMAIN: 'https://api.telegram.org',
    OPENAI_API_DOMAIN: 'https://api.openai.com',
  },
  A = {
    PASSWORD_KEY: 'chat_history_password',
    GROUP_TYPES: ['group', 'supergroup'],
    USER_AGENT:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.2 Safari/605.1.15',
  },
  p = null
function z(e) {
  p = e.DATABASE
  for (let t in s)
    if (e[t])
      switch (yt[t] || typeof s[t]) {
        case 'number':
          s[t] = parseInt(e[t]) || s[t]
          break
        case 'boolean':
          s[t] = (e[t] || 'false') === 'true'
          break
        case 'string':
          s[t] = e[t]
          break
        case 'object':
          if (Array.isArray(s[t])) s[t] = e[t].split(',')
          else
            try {
              s[t] = JSON.parse(e[t])
            } catch (n) {
              console.error(n)
            }
          break
        default:
          s[t] = e[t]
          break
      }
  e.TELEGRAM_TOKEN &&
    !s.TELEGRAM_AVAILABLE_TOKENS.includes(e.TELEGRAM_TOKEN) &&
    (e.BOT_NAME &&
      s.TELEGRAM_AVAILABLE_TOKENS.length === s.TELEGRAM_BOT_NAME.length &&
      s.TELEGRAM_BOT_NAME.push(e.BOT_NAME),
    s.TELEGRAM_AVAILABLE_TOKENS.push(e.TELEGRAM_TOKEN))
}
var K = 'support@onout.org',
  Q = 'https://t.me/onoutsupportbot',
  j = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
async function Z(e, t) {
  try {
    let n = await p.get(e)
    if (n && n !== '') return n
  } catch (n) {
    console.error(n)
  }
  try {
    let n = await fetch(t, { headers: { 'User-Agent': A.USER_AGENT } }).then((o) => o.text())
    return await p.put(e, n), n
  } catch (n) {
    console.error(n)
  }
  return null
}
async function H() {
  let e = 'https://raw.githubusercontent.com/tbxark-archive/GPT-3-Encoder/master',
    t = await Z('encoder_raw_file', `${e}/encoder.json`).then((c) => JSON.parse(c)),
    n = await Z('bpe_raw_file', `${e}/vocab.bpe`),
    o = (c, l) => Array.from(Array(l).keys()).slice(c),
    r = (c) => c.charCodeAt(0),
    i = (c) => String.fromCharCode(c),
    f = new TextEncoder('utf-8'),
    u = (c) => Array.from(f.encode(c)).map((l) => l.toString()),
    w = (c, l) => {
      let d = {}
      return (
        c.map((_, m) => {
          d[c[m]] = l[m]
        }),
        d
      )
    }
  function $() {
    let c = o(r('!'), r('~') + 1).concat(o(r('\xA1'), r('\xAC') + 1), o(r('\xAE'), r('\xFF') + 1)),
      l = c.slice(),
      d = 0
    for (let m = 0; m < 2 ** 8; m++) c.includes(m) || (c.push(m), l.push(2 ** 8 + d), (d = d + 1))
    l = l.map((m) => i(m))
    let _ = {}
    return (
      c.map((m, N) => {
        _[c[N]] = l[N]
      }),
      _
    )
  }
  function P(c) {
    let l = new Set(),
      d = c[0]
    for (let _ = 1; _ < c.length; _++) {
      let m = c[_]
      l.add([d, m]), (d = m)
    }
    return l
  }
  let G = /'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu,
    M = {}
  Object.keys(t).map((c) => {
    M[t[c]] = c
  })
  let C = n.split(`
`),
    x = C.slice(1, C.length - 1).map((c) =>
      c.split(/(\s+)/).filter(function (l) {
        return l.trim().length > 0
      }),
    ),
    B = $(),
    At = {}
  Object.keys(B).map((c) => {
    At[B[c]] = c
  })
  let q = w(x, o(0, x.length)),
    U = new Map()
  function gt(c) {
    if (U.has(c)) return U.get(c)
    let l = c.split(''),
      d = P(l)
    if (!d) return c
    for (;;) {
      let _ = {}
      Array.from(d).map((I) => {
        let X = q[I]
        _[isNaN(X) ? 1e11 : X] = I
      })
      let m = _[Math.min(...Object.keys(_).map((I) => parseInt(I)))]
      if (!(m in q)) break
      let N = m[0],
        L = m[1],
        R = [],
        E = 0
      for (; E < l.length; ) {
        let I = l.indexOf(N, E)
        if (I === -1) {
          R = R.concat(l.slice(E))
          break
        }
        ;(R = R.concat(l.slice(E, I))),
          (E = I),
          l[E] === N && E < l.length - 1 && l[E + 1] === L
            ? (R.push(N + L), (E = E + 2))
            : (R.push(l[E]), (E = E + 1))
      }
      if (((l = R), l.length === 1)) break
      d = P(l)
    }
    return (l = l.join(' ')), U.set(c, l), l
  }
  return function (l) {
    let d = 0,
      _ = Array.from(l.matchAll(G)).map((m) => m[0])
    for (let m of _) {
      m = u(m)
        .map((L) => B[L])
        .join('')
      let N = gt(m)
        .split(' ')
        .map((L) => t[L])
      d += N.length
    }
    return d
  }
}
function Y() {
  let e = new Date(),
    t = e.getFullYear(),
    n = String(e.getMonth() + 1).padStart(2, '0'),
    o = String(e.getDate()).padStart(2, '0'),
    r = String(e.getHours()).padStart(2, '0'),
    i = String(e.getMinutes()).padStart(2, '0'),
    f = String(e.getSeconds()).padStart(2, '0'),
    u = String(e.getMilliseconds()).padStart(3, '0')
  return `${t}-${n}-${o} ${r}:${i}:${f}.${u}`
}
function Ot(e) {
  let t = ''
  for (let n = e; n > 0; --n) t += j[Math.floor(Math.random() * j.length)]
  return t
}
async function tt() {
  let e = await p.get(A.PASSWORD_KEY)
  return e === null && ((e = Ot(32)), await p.put(A.PASSWORD_KEY, e)), e
}
function k(e) {
  return `
<html lang='en'>  
  <head>
    <title>ChatGPT-Telegram-Workers</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="ChatGPT-Telegram-Workers">
    <meta name="author" content="TBXark">
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
        font-size: 1rem;
        font-weight: 400;
        line-height: 1.5;
        color: #212529;
        text-align: left;
        background-color: #fff;
      }
      h1 {
        margin-top: 0;
        margin-bottom: 0.5rem;
      }
      p {
        margin-top: 0;
        margin-bottom: 1rem;
      }
      a {
        color: #007bff;
        text-decoration: none;
        background-color: transparent;
      }
      a:hover {
        color: #0056b3;
        text-decoration: underline;
      }
      strong {
        font-weight: bolder;
      }
    </style>
  </head>
  <body>
    ${e}
  </body>
</html>
  `
}
function O(e) {
  return JSON.stringify({ message: e.message, stack: e.stack })
}
async function et() {
  let e = (t) => Array.from(t).length
  try {
    s.GPT3_TOKENS_COUNT && (e = await H())
  } catch (t) {
    console.error(t)
  }
  return (t) => {
    try {
      return e(t)
    } catch (n) {
      return console.error(n), Array.from(t).length
    }
  }
}
function St(e, t) {
  let n = t
  typeof n == 'function' && (n = t.toString()),
    e === 'error'
      ? console.error(`(${Y()}) [${e}] ${typeof n == 'object' ? JSON.stringify(n) : n}`)
      : console.log(`(${Y()}) [${e}] ${typeof n == 'object' ? JSON.stringify(n) : n}`)
}
var wt = St,
  g = wt
var S = { SYSTEM_INIT_MESSAGE: s.SYSTEM_INIT_MESSAGE, OPENAI_API_EXTRA_PARAMS: {} },
  b = { ROLE: {} },
  T = { chat_id: null, reply_to_message_id: null, parse_mode: 'Markdown' },
  a = {
    currentBotId: null,
    currentBotToken: null,
    currentBotName: null,
    chatHistoryKey: null,
    configStoreKey: null,
    userStoreKey: null,
    groupAdminKey: null,
    usageKey: null,
    chatType: null,
    chatId: null,
    speakerId: null,
  }
function Nt(e, t) {
  ;(T.chat_id = e), (T.reply_to_message_id = t), t && (T.allow_sending_without_reply = !0)
}
async function It(e) {
  try {
    let t = JSON.parse(await p.get(e))
    for (let n in t)
      n === 'USER_DEFINE' && typeof b == typeof t[n]
        ? bt(t[n])
        : Object.hasOwn(S, n) && typeof S[n] == typeof t[n] && (S[n] = t[n])
  } catch (t) {
    g('error', t), g('info', `DATABASE: ${JSON.stringify(p)}`)
  }
}
function bt(e) {
  for (let t in e) Object.hasOwn(b, t) && typeof b[t] == typeof e[t] && (b[t] = e[t])
}
var Rt = /^\/telegram\/bot(\d+:[A-Za-z0-9_-]+)\/webhook/
function nt(e) {
  let { pathname: t } = new URL(e.url),
    n = t.match(Rt)
  if (!n) throw new Error('Token not found in the request path')
  let o = n[1],
    r = s.TELEGRAM_AVAILABLE_TOKENS.indexOf(o)
  if (r === -1)
    throw (
      (g('info', s.TELEGRAM_AVAILABLE_TOKENS),
      g('info', new URL(e.url)),
      g('info', `Pathname - ${t}`),
      g('info', `Extracted token - ${o}. Index - ${r}.`),
      new Error('The bot token is not allowed'))
    )
  ;(a.currentBotToken = o),
    (a.currentBotId = o.split(':')[0]),
    s.TELEGRAM_BOT_NAME.length > r && (a.currentBotName = s.TELEGRAM_BOT_NAME[r])
}
async function Mt(e) {
  a.usageKey = `usage:${a.currentBotId}`
  let t = e?.chat?.id,
    n = e?.from?.id
  if (!t) throw new Error('Chat id not found')
  if (!n) throw new Error('User id not found')
  let o = a.currentBotId,
    r = `history:${t}`,
    i = `user_config:${t}`,
    f = `user:${n}`,
    u = null
  o && ((r += `:${o}`), (i += `:${o}`), (f += `:${o}`)),
    A.GROUP_TYPES.includes(e.chat?.type) &&
      (!s.GROUP_CHAT_BOT_SHARE_MODE &&
        e.from.id &&
        ((r += `:${e.from.id}`), (i += `:${e.from.id}`)),
      (u = `group_admin:${t}`)),
    (a.chatHistoryKey = r),
    (a.configStoreKey = i),
    (a.userStoreKey = f),
    (a.groupAdminKey = u),
    (a.chatType = e.chat?.type),
    (a.chatId = e.chat.id),
    (a.speakerId = e.from.id || e.chat.id)
}
async function ot(e) {
  let t = e?.chat?.id,
    n = A.GROUP_TYPES.includes(e.chat?.type) ? e.message_id : null
  Nt(t, n), await Mt(e), await It(a.configStoreKey)
}
async function rt(e, t, n) {
  return await fetch(`${s.TELEGRAM_API_DOMAIN}/bot${t}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...n, text: e }),
  })
}
async function h(e, t, n) {
  let o = t || a.currentBotToken,
    r = n || T
  if (e.length <= 4096) return await rt(e, o, r)
  console.log('The message will be sent in pieces')
  let i = 4e3
  r.parse_mode = 'HTML'
  for (let f = 0; f < e.length; f += i) {
    let u = e.slice(f, f + i)
    await rt(
      `<pre>
${u}
</pre>`,
      o,
      r,
    )
  }
  return new Response('MESSAGE BATCH SEND', { status: 200 })
}
async function st(e, t) {
  return await fetch(`${s.TELEGRAM_API_DOMAIN}/bot${t || a.currentBotToken}/sendChatAction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: T.chat_id, action: e }),
  }).then((n) => n.json())
}
async function at(e, t) {
  return await fetch(`${s.TELEGRAM_API_DOMAIN}/bot${e}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: t }),
  }).then((n) => n.json())
}
async function it(e) {
  let t
  try {
    t = JSON.parse(await p.get(a.groupAdminKey))
  } catch (n) {
    return console.error(n), n.message
  }
  if (!t || !Array.isArray(t) || t.length === 0) {
    let n = await Ct(T.chat_id)
    if (n == null) return null
    ;(t = n),
      await p.put(a.groupAdminKey, JSON.stringify(t), {
        expiration: parseInt(Date.now() / 1e3) + 120,
      })
  }
  for (let n = 0; n < t.length; n++) {
    let o = t[n]
    if (o.user.id === e) return o.status
  }
  return 'member'
}
async function Ct(e, t) {
  try {
    let n = await fetch(
      `${s.TELEGRAM_API_DOMAIN}/bot${t || a.currentBotToken}/getChatAdministrators`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: e }),
      },
    ).then((o) => o.json())
    if (n.ok) return n.result
  } catch (n) {
    return console.error(n), null
  }
}
async function ct(e) {
  let t = await fetch(`${s.TELEGRAM_API_DOMAIN}/bot${e}/getMe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  }).then((n) => n.json())
  return t.ok
    ? {
        ok: !0,
        info: {
          name: t.result.first_name,
          bot_name: t.result.username,
          can_join_groups: t.result.can_join_groups,
          can_read_all_group_messages: t.result.can_read_all_group_messages,
        },
      }
    : t
}
function ut(e) {
  return e?.isActivated
    ? !1
    : !!(
        typeof s.AMOUNT_OF_FREE_MESSAGES == 'number' &&
        s.AMOUNT_OF_FREE_MESSAGES < 1 / 0 &&
        s.ACTIVATION_CODE &&
        typeof e.msgCounter == 'number' &&
        e.msgCounter >= s.AMOUNT_OF_FREE_MESSAGES
      )
}
async function lt(e) {
  if (e.text.match(/This is the activation code: ?\n?[a-zA-Z0-9 ]{4,128}$/m)) {
    let t = e.text.match(/^[a-zA-Z0-9 ]{4,128}$/m)
    if (String(t) !== String(s.ACTIVATION_CODE)) return h('Your code is incorrect')
    let n = JSON.parse(await p.get(a.userStoreKey))
    return (
      await p.put(a.userStoreKey, JSON.stringify({ ...n, isActivated: !0 })),
      h('Successfully activated')
    )
  }
  return null
}
async function D(e, t) {
  let n = {
      model: s.CHAT_MODEL,
      ...S.OPENAI_API_EXTRA_PARAMS,
      messages: [...(t || []), { role: 'user', content: e }],
    },
    o = await fetch(`${s.OPENAI_API_DOMAIN}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${s.API_KEY}` },
      body: JSON.stringify(n),
    }).then((r) => r.json())
  if (o.error?.message)
    throw new Error(`OpenAI API error
> ${o.error.message}
current parameters: ${JSON.stringify(n)}`)
  return setTimeout(() => Lt(o.usage).catch(console.error), 0), o.choices[0].message.content
}
async function Lt(e) {
  if (!s.ENABLE_USAGE_STATISTICS) return
  let t = JSON.parse(await p.get(a.usageKey))
  t || (t = { tokens: { total: 0, chats: {} } }),
    (t.tokens.total += e.total_tokens),
    t.tokens.chats[a.chatId]
      ? (t.tokens.chats[a.chatId] += e.total_tokens)
      : (t.tokens.chats[a.chatId] = e.total_tokens),
    await p.put(a.usageKey, JSON.stringify(t))
}
var v = {
    default: function () {
      return A.GROUP_TYPES.includes(a.chatType) ? ['administrator', 'creator'] : !1
    },
    shareModeGroup: function () {
      return A.GROUP_TYPES.includes(a.chatType) && s.GROUP_CHAT_BOT_SHARE_MODE
        ? ['administrator', 'creator']
        : !1
    },
  },
  y = {
    '/help': {
      help: 'Get command help',
      scopes: ['all_private_chats', 'all_chat_administrators'],
      fn: kt,
    },
    '/new': {
      help: 'Initiate a new conversation',
      scopes: ['all_private_chats', 'all_group_chats', 'all_chat_administrators'],
      fn: pt,
      needAuth: v.shareModeGroup,
    },
    '/start': {
      help: 'Get your ID and start a new conversation',
      scopes: ['all_private_chats', 'all_chat_administrators'],
      fn: pt,
      needAuth: v.default,
    },
  }
async function kt(e, t, n) {
  let o =
    `The following commands are currently supported:
` +
    Object.keys(y).map((r) => `${r}\uFF1A${y[r].help}`).join(`
`)
  return h(o)
}
async function pt(e, t, n) {
  try {
    return (
      await p.delete(a.chatHistoryKey),
      t === '/new'
        ? h('A new dialogue has begun')
        : (console.log(a.chatType),
          a.chatType === 'private'
            ? (h('...'), await D('/start'))
            : h(`A new conversation has begun, group ID(${T.chat_id})`))
    )
  } catch (o) {
    return h(`ERROR: ${o.message}`)
  }
}
async function xt(e) {
  let t = '<pre>'
  return (
    (t += JSON.stringify({ message: e }, null, 2)), (t += '</pre>'), (T.parse_mode = 'HTML'), h(t)
  )
}
async function ht(e) {
  s.DEV_MODE &&
    (y['/echo'] = {
      help: '[DEBUG ONLY] Echo message',
      scopes: ['all_private_chats', 'all_chat_administrators'],
      fn: xt,
      needAuth: v.default,
    })
  for (let t in y)
    if (e.text === t || e.text.startsWith(t + ' ')) {
      let n = y[t]
      try {
        if (n.needAuth) {
          let r = n.needAuth()
          if (r) {
            let i = await it(a.speakerId)
            if (i === null) return h('Authentication failed')
            if (!r.includes(i))
              return h(`Insufficient authority, need ${r.join(',')}, current:${i}`)
          }
        }
      } catch (r) {
        return h(`Authentication error: ${r.message}`)
      }
      let o = e.text.substring(t.length).trim()
      try {
        return await n.fn(e, t, o)
      } catch (r) {
        return h(`Command execution error: ${r.message}`)
      }
    }
  return null
}
async function ft(e) {
  let t = { all_private_chats: [], all_group_chats: [], all_chat_administrators: [] }
  for (let o in y)
    if (!s.HIDE_COMMAND_BUTTONS.includes(o) && Object.hasOwn(y, o) && y[o].scopes)
      for (let r of y[o].scopes) t[r] || (t[r] = []), t[r].push(o)
  let n = {}
  for (let o in t)
    n[o] = await fetch(`https://api.telegram.org/bot${e}/setMyCommands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        commands: t[o].map((r) => ({ command: r, description: y[r].help })),
        scope: { type: o },
      }),
    }).then((r) => r.json())
  return { ok: !0, result: n }
}
function mt() {
  return Object.keys(y).map((e) => {
    let t = y[e]
    return { command: e, description: t.help }
  })
}
async function $t(e) {
  try {
    await ot(e)
  } catch (t) {
    return new Response(O(t), { status: 500 })
  }
  return null
}
async function Pt(e) {
  if (s.DEBUG_MODE) {
    let t = `last_message:${a.chatHistoryKey}`
    await p.put(t, JSON.stringify(e))
  }
  return null
}
async function Gt(e) {
  return s.API_KEY ? (p ? null : h('DATABASE Not set')) : h('OpenAI API Key Not set')
}
async function Ht(e) {
  return s.ACTIVATION_CODE ? lt(e) : null
}
async function Dt(e) {
  try {
    let t = JSON.parse(await p.get(a.userStoreKey))
    if (!t) await p.put(a.userStoreKey, JSON.stringify({ msgCounter: 1 }))
    else if (ut(t)) {
      let n = s.LINK_TO_PAY_FOR_CODE
        ? `<b>You've reached the limit of free messages.</b>
To continue using this bot you need to pay for the activation code via the link below:
<a href="${s.LINK_TO_PAY_FOR_CODE}">Pay for usage</a>
After payment, you need to send a message here with an activation code in the format:

<i>This is the activation code:
"REPLACE WITH AN ACTIVATION CODE"</i>`
        : `<b>You've reached the limit of free messages.</b>
To continue using this bot you need to send a message here with an activation code in the format:

<i>This is the activation code:
"REPLACE WITH AN ACTIVATION CODE"</i>`
      return h(n, void 0, { ...T, parse_mode: 'HTML' })
    } else
      await p.put(a.userStoreKey, JSON.stringify({ ...t, msgCounter: (t.msgCounter || 0) + 1 }))
  } catch (t) {
    return new Response(O(t), { status: 500 })
  }
  return null
}
async function V(e) {
  return s.I_AM_A_GENEROUS_PERSON
    ? null
    : a.chatType === 'private'
    ? s.CHAT_WHITE_LIST.includes(`${T.chat_id}`)
      ? null
      : h(
          `You do not have permission to use this command, please contact the administrator to add your ID(${T.chat_id}) to the whitelist`,
        )
    : A.GROUP_TYPES.includes(a.chatType)
    ? s.GROUP_CHAT_BOT_ENABLE
      ? s.CHAT_GROUP_WHITE_LIST.includes(`${T.chat_id}`)
        ? null
        : h(
            `This group does not have chat permission enabled, please contact the administrator to add a group ID(${T.chat_id}) to the whitelist`,
          )
      : new Response('ID SUPPORT', { status: 401 })
    : h(`This type is not supported at the moment (${a.chatType}) the chat`)
}
async function Bt(e) {
  return e.text ? null : h('Non-text format messages are not supported for the time being')
}
async function dt(e) {
  if (!e.text) return new Response('NON TEXT MESSAGE', { status: 200 })
  let t = a.currentBotName
  if (t) {
    let n = !1
    if ((e.reply_to_message && e.reply_to_message.from.username === t && (n = !0), e.entities)) {
      let o = '',
        r = 0
      e.entities.forEach((i) => {
        switch (i.type) {
          case 'bot_command':
            if (!n) {
              let f = e.text.substring(i.offset, i.offset + i.length)
              f.endsWith(t) && (n = !0)
              let u = f.replaceAll(`@${t}`, '').replaceAll(t).trim()
              ;(o += u), (r = i.offset + i.length)
            }
            break
          case 'mention':
          case 'text_mention':
            if (!n) {
              let f = e.text.substring(i.offset, i.offset + i.length)
              ;(f === t || f === `@${t}`) && (n = !0)
            }
            ;(o += e.text.substring(r, i.offset)), (r = i.offset + i.length)
            break
        }
      }),
        (o += e.text.substring(r, e.text.length)),
        (e.text = o.trim())
    }
    return n ? null : new Response('NOT MENTIONED', { status: 200 })
  }
  return new Response('NOT SET BOTNAME', { status: 200 })
}
async function W(e) {
  return await ht(e)
}
async function J(e) {
  if (!e.text.startsWith('~')) return null
  e.text = e.text.slice(1)
  let t = e.text.indexOf(' ')
  if (t === -1) return null
  let n = e.text.slice(0, t),
    o = e.text.slice(t + 1).trim()
  if (Object.hasOwn(b.ROLE, n)) {
    ;(a.ROLE = n), (e.text = o)
    let r = b.ROLE[n]
    for (let i in r) Object.hasOwn(S, i) && typeof S[i] == typeof r[i] && (S[i] = r[i])
  }
}
async function Ut(e) {
  try {
    let t = s.AUTO_TRIM_HISTORY && s.MAX_HISTORY_LENGTH <= 0
    setTimeout(() => st('typing').catch(console.error), 0)
    let n = a.chatHistoryKey,
      { real: o, original: r } = await Yt(n),
      i = await D(e.text, o)
    return (
      t ||
        (r.push({ role: 'user', content: e.text || '', cosplay: a.ROLE || '' }),
        r.push({ role: 'assistant', content: i, cosplay: a.ROLE || '' }),
        await p.put(n, JSON.stringify(r)).catch(console.error)),
      h(i)
    )
  } catch {
    return h('A problem when processing your request. Try to wait a bit and ask again')
  }
}
async function Kt(e) {
  let t = { private: [V, Bt, W, J], group: [dt, V, W, J], supergroup: [dt, V, W, J] }
  if (!Object.hasOwn(t, a.chatType))
    return h(`This type is not supported at the moment (${a.chatType}) the chat`)
  let n = t[a.chatType]
  for (let o of n)
    try {
      let r = await o(e)
      if (r && r instanceof Response) return r
    } catch (r) {
      return g('error', r), h(`Deal with (${a.chatType}) the chat message went wrong`)
    }
  return null
}
async function jt(e) {
  let t = await e.json()
  if (
    (g('info', t),
    s.DEV_MODE &&
      setTimeout(() => {
        p.put(`log:${new Date().toISOString()}`, JSON.stringify(t), { expirationTtl: 600 }).catch(
          console.error,
        )
      }),
    t.edited_message && ((t.message = t.edited_message), (a.editChat = !0)),
    t.message)
  )
    return t.message
  throw new Error('Invalid message')
}
async function Yt(e) {
  let t = { role: 'system', content: S.SYSTEM_INIT_MESSAGE }
  if (s.AUTO_TRIM_HISTORY && s.MAX_HISTORY_LENGTH <= 0) return { real: [t], original: [t] }
  let o = []
  try {
    o = JSON.parse(await p.get(e))
  } catch (u) {
    g('error', u)
  }
  ;(!o || !Array.isArray(o)) && (o = [])
  let r = JSON.parse(JSON.stringify(o))
  a.ROLE && (o = o.filter((u) => a.ROLE === u.cosplay)),
    o.forEach((u) => {
      delete u.cosplay
    })
  let i = await et(),
    f = (u, w, $, P) => {
      u.length > $ && (u = u.splice(u.length - $))
      let G = w
      for (let M = u.length - 1; M >= 0; M--) {
        let C = u[M],
          x = 0
        if ((C.content ? (x = i(C.content)) : (C.content = ''), (G += x), G > P)) {
          u = u.splice(M + 1)
          break
        }
      }
      return u
    }
  if (s.AUTO_TRIM_HISTORY && s.MAX_HISTORY_LENGTH > 0) {
    let u = i(t.content),
      w = Math.max(Object.keys(b.ROLE).length, 1)
    ;(o = f(o, u, s.MAX_HISTORY_LENGTH, s.MAX_TOKEN_LENGTH)),
      (r = f(r, u, s.MAX_HISTORY_LENGTH * w, s.MAX_TOKEN_LENGTH * w))
  }
  switch (o.length > 0 ? o[0].role : '') {
    case 'assistant':
    case 'system':
      o[0] = t
      break
    default:
      o.unshift(t)
  }
  return (
    s.SYSTEM_INIT_MESSAGE_ROLE !== 'system' &&
      o.length > 0 &&
      o[0].role === 'system' &&
      (o[0].role = s.SYSTEM_INIT_MESSAGE_ROLE),
    { real: o, original: r }
  )
}
async function Tt(e) {
  nt(e)
  let t = await jt(e),
    n = [$t, Pt, Gt, Ht, Dt, Kt, Ut]
  for (let o of n)
    try {
      let r = await o(t)
      if (r && r instanceof Response) return r
    } catch (r) {
      return g('error', r), new Response(O(r), { status: 500 })
    }
  return null
}
var vt = './init',
  F = `
<br/>
<p>
  If you have any questions, please talk to support: <a
    href="${Q}" target="_blank" rel="noreferrer">
    Onout support bot
  </a>.
  Or via email: <a href="mailto:${K}" target="_blank" rel="noreferrer">
    ${K}
  </a>
</p>
`
function _t(e) {
  return `<p style="color: red">Please set the <strong>${e}</strong> environment variable in Cloudflare Workers.</p> `
}
async function Vt(e) {
  let t = [],
    n = new URL(e.url).host
  for (let r of s.TELEGRAM_AVAILABLE_TOKENS) {
    let i = `https://${n}/telegram/${r.trim()}/webhook`,
      f = r.split(':')[0]
    t[f] = { webhook: await at(r, i).catch((u) => O(u)), command: await ft(r).catch((u) => O(u)) }
  }
  let o = k(`
    <h1>ChatGPT-Telegram-Workers</h1>
    <h2>${n}</h2>
    ${s.TELEGRAM_AVAILABLE_TOKENS.length === 0 ? _t('TELEGRAM_AVAILABLE_TOKENS') : ''}
    ${Object.keys(t)
      .map(
        (r) => `
        <br/>
        <h4>Bot ID: ${r}</h4>
        <p style="color: ${t[r].webhook.ok ? 'green' : 'red'}">Webhook: ${JSON.stringify(
          t[r].webhook,
        )}</p>
        <p style="color: ${t[r].command.ok ? 'green' : 'red'}">Command: ${JSON.stringify(
          t[r].command,
        )}</p>
        `,
      )
      .join('')}
      ${F}
    `)
  return new Response(o, { status: 200, headers: { 'Content-Type': 'text/html' } })
}
async function Wt(e) {
  let t = await tt(),
    { pathname: n } = new URL(e.url),
    o = n.match(/^\/telegram\/(.+)\/history/)[1]
  if (new URL(e.url).searchParams.get('password') !== t)
    return new Response('Password Error', { status: 401 })
  let f = JSON.parse(await p.get(o)),
    u = k(`
        <div id="history" style="width: 100%; height: 100%; overflow: auto; padding: 10px;">
            ${f
              .map(
                (w) => `
                <div style="margin-bottom: 10px;">
                    <hp style="font-size: 16px; color: #999; margin-bottom: 5px;">${w.role}:</hp>
                    <p style="font-size: 12px; color: #333;">${w.content}</p>
                </div>
            `,
              )
              .join('')}
        </div>
  `)
  return new Response(u, { status: 200, headers: { 'Content-Type': 'text/html' } })
}
async function Jt(e) {
  return (await Tt(e)) || new Response('NOT HANDLED', { status: 200 })
}
async function Ft() {
  let e = k(`
    <h1>ChatGPT-Telegram-Workers</h1>
    <br/>
    <p>Deployed Successfully!</p>
    <p>Version (ts:${s.BUILD_TIMESTAMP},sha:${s.BUILD_VERSION})</p>
    <br/>
    <p>You must <strong><a href="${vt}"> >>>>> click here <<<<< </a></strong> to bind the webhook.</p>
    <br/>
    ${s.API_KEY ? '' : _t('API_KEY')}
    <p>After binding the webhook, you can use the following commands to control the bot:</p>
    ${mt()
      .map((t) => `<p><strong>${t.command}</strong> - ${t.description}</p>`)
      .join('')}
    <br/>
    <p>You can get bot information by visiting the following URL:</p>
    <p><strong>/telegram/:token/bot</strong> - Get bot information</p>
    ${F}
  `)
  return new Response(e, { status: 200, headers: { 'Content-Type': 'text/html' } })
}
async function qt(e) {
  let t = new URL(e.url).searchParams.get('text') || 'Hello World',
    n = await H(),
    o = k(`
    <h1>ChatGPT-Telegram-Workers</h1>
    <br/>
    <p>Token Counter:</p>
    <p>source text: ${t}</p>  
    <p>token count: ${n(t)}</p>
    <br/>
    `)
  return new Response(o, { status: 200, headers: { 'Content-Type': 'text/html' } })
}
async function Xt() {
  let e = []
  for (let n of s.TELEGRAM_AVAILABLE_TOKENS) {
    let o = n.split(':')[0]
    e[o] = await ct(n)
  }
  let t = k(`
    <h1>ChatGPT-Telegram-Workers</h1>
    <br/>
    <h4>Environment About Bot</h4>
    <p><strong>GROUP_CHAT_BOT_ENABLE:</strong> ${s.GROUP_CHAT_BOT_ENABLE}</p>
    <p><strong>GROUP_CHAT_BOT_SHARE_MODE:</strong> ${s.GROUP_CHAT_BOT_SHARE_MODE}</p>
    <p><strong>TELEGRAM_BOT_NAME:</strong> ${s.TELEGRAM_BOT_NAME.join(',')}</p>
    ${Object.keys(e)
      .map(
        (n) => `
            <br/>
            <h4>Bot ID: ${n}</h4>
            <p style="color: ${e[n].ok ? 'green' : 'red'}">${JSON.stringify(e[n])}</p>
            `,
      )
      .join('')}
    ${F}
  `)
  return new Response(t, { status: 200, headers: { 'Content-Type': 'text/html' } })
}
async function Et(e) {
  let { pathname: t } = new URL(e.url)
  if (t === '/') return Ft()
  if (t.startsWith('/init')) return Vt(e)
  if (t.startsWith('/gpt3/tokens/test')) return qt(e)
  if (t.startsWith('/telegram') && t.endsWith('/history')) return Wt(e)
  if (t.startsWith('/telegram') && t.endsWith('/webhook'))
    try {
      let n = await Jt(e)
      return n.status === 200
        ? n
        : new Response(n.body, {
            status: 200,
            headers: { 'Original-Status': n.status, ...n.headers },
          })
    } catch (n) {
      return console.error(n), new Response(O(n), { status: 500 })
    }
  return t.startsWith('/telegram') && t.endsWith('/bot') ? Xt(e) : null
}
var Ve = {
  async fetch(e, t) {
    try {
      return z(t), (await Et(e)) || new Response('NOT_FOUND', { status: 404 })
    } catch (n) {
      return console.error(n), new Response(O(n), { status: 500 })
    }
  },
}
export { Ve as default }
