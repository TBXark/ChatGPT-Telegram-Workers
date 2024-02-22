/* eslint-disable indent */
import fs from 'node:fs'
import path from 'node:path'
import { exec } from 'node:child_process'
import request from 'request'
import express from 'express'
import { body, validationResult } from 'express-validator'
import { TELEGRAM_API, ACCESS_CODE } from './constants.js'
import utils from './utils.js'

// eslint-disable-next-line new-cap
const router = express.Router()

router.post(
  '/',
  [
    body('access_code')
      .trim()
      .notEmpty()
      .escape()
      .matches(new RegExp(ACCESS_CODE))
      .withMessage('Enter a valid code'),
  ],
  async (req, res) => {
    const result = validationResult(req)

    if (result.errors.length) {
      return res.status(401).send(
        utils.returnErrorsHtmlPage({
          title: 'Not allowed',
        }),
      )
    }

    // TODO Check this route and conditions. Seems we don't need it.
    res.sendFile(path.join(utils.getDirname(), 'deploy.html'))
  },
)

// TODO Fix this replacement. Allow changes through ENV file or make a separate file for such local changes.
const updateEnvFile = (msg,model) => {
  try {
    console.log('Updating ENV: src/env.js')

    const data = fs.readFileSync('src/env.js', 'utf8')
    const regexPattern = /SYSTEM_INIT_MESSAGE:\s*(`.*?`|'.*?'|".*?"),?/s
    if (!regexPattern.test(data)) {
      throw new Error('SYSTEM_INIT_MESSAGE declaration not found in env.js')
    }

    let updatedData = data.replace(regexPattern, `SYSTEM_INIT_MESSAGE: \`${msg}\`,`)

    //same but with CHAT_MODEL: `gpt-3.5-turbo`
    const regexPattern2 = /CHAT_MODEL:\s*(`.*?`|'.*?'|".*?"),?/s
    if (!regexPattern2.test(updatedData)) {
      throw new Error('CHAT_MODEL declaration not found in env.js')
    }

    updatedData = updatedData.replace(regexPattern2, `CHAT_MODEL: \`${model}\`,`)
    

    fs.writeFileSync('src/env.js', updatedData, 'utf8')
  } catch (err) {
    console.error('Error updating ENV file:', err)
    return false
  }

  console.log('[OK] ENV file updated')
  return true
}

router.post(
  '/deploy',
  [
    body('tg_token').notEmpty().withMessage('Please specify Telegram API token'),
    body('openai_sk').notEmpty().withMessage('Please specify OpenAI API key'),
    body('cf_account_id').notEmpty().withMessage('Please specify Cloudflare account ID'),
    body('cf_wrangler_key').notEmpty().withMessage('Please specify Cloudflare API key'),
    body('system_prompt').notEmpty().withMessage('Please specify a system_prompt'),
    body('openai_model').notEmpty().withMessage('Please specify OpenAI model'),
  ],
  async (req, res) => {
    const useJSON = req.body.useJSON
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      const formattedErrors = errors
        .array()
        .map((error) => `<li>${error.msg}</li>`)
        .join('')
      const responseContent = useJSON
        ? { error: true, messages: errors.array().map((error) => error.msg) }
        : utils.returnErrorsHtmlPage({
            title: 'Not allowed. Fix these errors:',
            description: `<ul>${formattedErrors}</ul>`,
          })

      return res.status(useJSON ? 200 : 422).send(responseContent)
    }

    const initMessage = utils.escapeAttr(req.body.system_prompt).replace(/(?:\r\n|\r|\n)/g, '\\n')
    const openAiKey = utils.escapeAttr(req.body.openai_sk)
    const tgToken = utils.escapeAttr(req.body.tg_token)
    const cfWranglerKey = utils.escapeAttr(req.body.cf_wrangler_key)
    const cfAccountID = utils.escapeAttr(req.body.cf_account_id)
    // Payment related
    let freeMessages = Number(req.body.free_messages)
    let activationCode = "";//utils.escapeAttr(req.body.activation_code).trim()
    let paymentLink = "";//utils.escapeAttr(req.body.payment_link)
    const openaiModel = utils.escapeAttr(req.body.openai_model)
    if (
      !(
        typeof freeMessages === 'number' &&
        Number.isInteger(freeMessages) &&
        freeMessages > -1 &&
        freeMessages < Number.MAX_SAFE_INTEGER
      )
    ) {
      freeMessages = '1000000'
    }

    if (
      !(
        typeof activationCode === 'string' &&
        activationCode.length > 4 &&
        activationCode.length < 64
      )
    ) {
      activationCode = ''
    }

    if (
      !(
        typeof paymentLink === 'string' &&
        paymentLink.match(
          /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/,
        )
      )
    ) {
      paymentLink = ''
    }

    request(`${TELEGRAM_API}/bot${tgToken}/getMe`, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        const userData = JSON.parse(body).result
        const botUsername = userData.username.toLowerCase()
        const nm = `${botUsername}_${new Date().getMinutes()}_${new Date().getDate()}_${
          // +1 because first month starts from 0
          new Date().getMonth() + 1
        }_${new Date().getFullYear()}`

        // Find if we already have such KV
        exec('wrangler kv:namespace list', async (error, stdout, stderr) => {
          const regex = new RegExp(nm)
          const match = regex.exec(stdout)

          if (match) {
            if (useJSON) {
              return res.status(200).json({
                error: true,
                messages: ['You have already deployed such a bot. (Try to make a different one)'],
              })
            } else {
              return res.status(400).send(
                utils.returnErrorsHtmlPage({
                  title: 'You have already deployed such a bot.',
                  description: `
                    <p>Try to make a different one</p>
                  `,
                }),
              )
            }
          }

          // We need to update wrangler config twice
          // 1. for to interact with the user account and create KV
          // 2. save KV data
          utils.writeWranglerFile({
            botName: botUsername,
            cfAccountID,
            // We don't know the KV data yet. But we cannot set an empty string.
            kvID: 'any',
            openAiKey,
            tgToken,
            initMessage,
            freeMessages,
            activationCode,
            paymentLink,
            openaiModel
          })

          // Create a new namespace
          
          
          exec(
            `cross-env CLOUDFLARE_API_TOKEN=${cfWranglerKey} npm run wrangler kv:namespace create ${nm}`,
            (error, stdout, stderr) => {
              if (stdout) console.log('namespace creation stdout', stdout)
              if (stderr) console.log('namespace creation stderr', stderr)

              if (error) {
                console.error('Error on namespace creation. Error:', stdout)
                const errInfo = stderr.match(/\[ERROR].*/s)

                if (useJSON) {
                  return res.status(200).json({
                    error: true,
                    messages: [
                      'Something went wrong. Try again or contact support.',
                      `Failed to create a namespace. Error: ${error.message}${
                        errInfo ? `. ${errInfo[0]}` : ''
                      }`,
                    ],
                  })
                } else {
                  return res.status(500).send(
                    utils.returnErrorsHtmlPage({
                      title: 'Something went wrong. Try again or contact support.',
                      description: `
                    <p>Failed to create a namespace. Error: ${error.message}${
                        errInfo ? `. ${errInfo[0]}` : ''
                      }</p>
                  `,
                    }),
                  )
                }
              }

              console.log('[OK] KV creation')
              // Find the ID in the stdout. Example of stdout:
              // ...
              // kv_namespaces = [
              //   { binding = "NAME", id = "12345abc..." }
              // ]
              const regex = /id = "(\w+)"/
              const match = regex.exec(stdout)
              const id = match ? match[1] : null

              if (!id && error) {
                console.error(`Error to retrieve the KV ID: ${error}`)
                if (useJSON) {
                  return res.status(200).json({
                    error: true,
                    messages: [`Failed to create a KV. ${error}`],
                  })
                } else {
                  return res.status(400).json({ error: `Failed to create a KV. ${error}` })
                }
              }

              utils.writeWranglerFile({
                botName: botUsername,
                cfAccountID,
                kvID: id,
                openAiKey,
                tgToken,
                initMessage,
                freeMessages,
                activationCode,
                paymentLink,
                openaiModel
              })

              const updated = updateEnvFile(initMessage,openaiModel)
              if (!updated) {
                return res
                  .status(500)
                  .json({ error: `Failed to update bot ENV. Try again or contact the support.` })
              }

              exec(
                `cross-env CLOUDFLARE_API_TOKEN=${cfWranglerKey} npm run deploy:build`,
                (error, stdout, stderr) => {
                  if (error) {
                    console.error(`Deploy error: ${error}`)

                    if (useJSON) {
                      return res.status(200).json({
                        error: true,
                        messages: [
                          `Something went wrong. Try again or contact support.`,
                          `Failed to deploy this bot.`,
                        ],
                      })
                    } else {
                      return res.status(500).send(
                        utils.returnErrorsHtmlPage({
                          title: 'Something went wrong. Try again or contact support.',
                          description: '<p>Failed to deploy this bot.</p>',
                        }),
                      )
                    }
                  }
                  console.log(
                    `[OK] cross-env CLOUDFLARE_API_TOKEN=${cfWranglerKey} npm run deploy:build`,
                  )

                  const workerDomain = stdout.match(/https:\/\/[a-z-A-Z0-9\-.]*\.workers\.dev/)

                  if (!workerDomain?.[0]) {
                    if (useJSON) {
                      return res.status(200).json({
                        error: true,
                        messages: [
                          `We did not able to activate your bot.`,
                          `Possible you are using "_" in the name of the bot, contact support.`,
                        ],
                      })
                    } else {
                      return res.status(500).send(
                        utils.returnErrorsHtmlPage({
                          title: 'We did not able to activate your bot.',
                          description:
                            '<p>You need to open a domain of a new bot worker and activate it or contact the support.</p>',
                        }),
                      )
                    }
                  }

                  // Bot activation. This way, the user doesn't have to do it himself.
                  request(`${workerDomain?.[0]}/init`, (error) => {
                    if (error) {
                      console.error(`Error on bot initialization: ${error}`)
                      if (useJSON) {
                        return res.status(200).json({
                          error: true,
                          messages: [`Failed to initialize`],
                        })
                      } else {
                        return res.status(500).json({ error: 'Failed to initialize the bot' })
                      }
                    }

                    if (useJSON) {
                      return res.status(200).json({
                        success: 'yes',
                        botUsername,
                      })
                    } else {
                      res.send(
                        utils.wrapInHtmlTemplate(`
                            <header>
                              <h2>Succesful deployment!</h2>
                            </header>
                            <main>
                              <p class='centered'>
                                <a href="https://t.me/${botUsername}" target='_blank' rel="noreferrer">Open your bot now</a>
                              </p>
                            </main>
                            
                          `),
                      )
                    }
                  })
                },
              )
            },
          )
        })
      } else {
        console.error(error)
        if (useJSON) {
          return res.status(200).json({
            error: true,
            messages: [`Failed to get telegram bot name.`, `Check if your bot API token is right.`],
          })
        } else {
          return res.status(400).json({
            error: 'Failed to get telegram bot name. Check if your bot API token is right.',
          })
        }
      }
    })
  },
)

export default router
