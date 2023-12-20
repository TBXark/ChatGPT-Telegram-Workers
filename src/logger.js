function currentStrDate() {
  const dt = new Date()
  const year = dt.getFullYear()
  const month = String(dt.getMonth() + 1).padStart(2, '0') // Months are 0-indexed
  const day = String(dt.getDate()).padStart(2, '0')
  const hour = String(dt.getHours()).padStart(2, '0')
  const minute = String(dt.getMinutes()).padStart(2, '0')
  const second = String(dt.getSeconds()).padStart(2, '0')
  const ms = String(dt.getMilliseconds()).padStart(3, '0')

  return `${year}-${month}-${day} ${hour}:${minute}:${second}.${ms}`
}

/**
 *
 * @param {'info'|'error'|'debug'} lvl
 * @param {any} input
 */
export default function logger(lvl, input) {
  // if (process.env.NODE_ENV === 'production') return
  let msg = input
  if (input instanceof Error) {
    msg = { message: input.message, stack: input.stack }
  } else if (typeof input === 'function') {
    msg = input.toString()
  }

  const log = `(${currentStrDate()}) [${lvl}] ${
    typeof msg === 'object' ? JSON.stringify(msg, null, 2) : msg
  }`

  if (lvl === 'error') console.error(log)
  else console.log(log)
}
