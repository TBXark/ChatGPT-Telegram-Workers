// import { format, createLogger } from 'winston'
import { currentStrDate } from './utils.js'

function customLogger(lvl, input) {
  // if (process.env.NODE_ENV === 'production') return
  let msg = input
  if (typeof msg === 'function') msg = input.toString()

  if (lvl === 'error') {
    console.error(
        `(${currentStrDate()}) [${lvl}] ${typeof msg === 'object' ? JSON.stringify(msg) : msg}`,
    )
  } else {
    console.log(
        `(${currentStrDate()}) [${lvl}] ${typeof msg === 'object' ? JSON.stringify(msg) : msg}`,
    )
  }
}

const logger = customLogger
// process.env.NODE_ENV === 'production'
//   ? customLogger
//   : createLogger({
//       defaultMeta: { service: 'sensorica' },
//       level: 'info',
//       format: format.combine(
//         format.timestamp({
//           format: 'YYYY-MM-DD HH:mm:ss',
//         }),
//         format.errors({ stack: true }),
//         format.splat(),
//         format.simple(),
//       ),
//       transports: [
//         // Only for local development
//         // new transports.File({ filename: 'sensorica.log', level: 'error', format: format.json() }),
//       ],
//     })

export default logger
