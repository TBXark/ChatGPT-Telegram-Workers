/* eslint-disable indent */
import fs from 'fs';
import path from 'node:path';
import request from 'request';
import { exec } from 'child_process';
import express from 'express';
import { body, validationResult } from 'express-validator';
import constants from './constants.js';
import utils from './utils.js';

const router = new express.Router();

router.post(
  '/',
  [
    body('access_code')
      .trim()
      .notEmpty()
      .escape()
      .matches(new RegExp(constants.accessCode))
      .withMessage('Enter a valid code'),
  ],
  async (req, res) => {
    const result = validationResult(req);

    if (result.errors.length) {
      return res.status(401).send(
        utils.returnErrorsHtmlPage({
          title: 'Not allowed',
        }),
      );
    }

    res.sendFile(path.join(utils.getDirname(), '/deploy.html'));
  },
);

router.post(
  '/deploy',
  [
    body('tg_token').notEmpty().withMessage('Please specify Telegram API token'),
    body('openai_sk').notEmpty().withMessage('Please specify OpenAI API key'),
    body('cf_account_id').notEmpty().withMessage('Please specify Cloudflare account ID'),
    body('cf_wrangler_key').notEmpty().withMessage('Please specify Cloudflare API key'),
  ],
  async (req, res) => {
    const result = validationResult(req);
    const msgErrors = result.errors.length && result.errors.map(({ msg }) => `<li>${msg}</li>`);

    if (msgErrors) {
      return res.status(422).send(
        utils.returnErrorsHtmlPage({
          title: 'Not allowed. Fix these errors:',
          description: `
            <ul>
              ${msgErrors.join('')}
            </ul>
          `,
        }),
      );
    }

    const initmessage = utils.escapeAttr(req.body.prompt).replace(/(?:\r\n|\r|\n)/g, '\\n');
    const openAiKey = utils.escapeAttr(req.body.openai_sk);
    const tgToken = utils.escapeAttr(req.body.tg_token);
    const cfWranglerKey = utils.escapeAttr(req.body.cf_wrangler_key);
    const cfAccountID = utils.escapeAttr(req.body.cf_account_id);
    // Payment related
    let freeMessages = Number(utils.escapeAttr(req.body.free_messages));
    let activationCode = utils.escapeAttr(req.body.activation_code).trim();
    let paymentLink = utils.escapeAttr(req.body.payment_link);

    if (
      !(
        typeof freeMessages === 'number' &&
        Number.isInteger(freeMessages) &&
        freeMessages > -1 &&
        freeMessages < Number.MAX_SAFE_INTEGER
      )
    ) {
      freeMessages = '';
    }

    if (
      !(
        typeof activationCode === 'string' &&
        activationCode.length > 4 &&
        activationCode.length < 64
      )
    ) {
      activationCode = '';
    }

    if (
      !(
        typeof paymentLink === 'string' &&
        paymentLink.match(
          /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/,
        )
      )
    ) {
      paymentLink = '';
    }

    request(`${constants.telegramApi}/bot${tgToken}/getMe`, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        const userData = JSON.parse(body).result;
        const botUsername = userData.username.toLowerCase();
        const nm = `${botUsername}_${new Date().getMinutes()}_${new Date().getDate()}_${
          // +1 because first month starts from 0
          new Date().getMonth() + 1
        }_${new Date().getFullYear()}`;

        // Find if we already have such KV
        exec('wrangler kv:namespace list', async (error, stdout, stderr) => {
          const regex = new RegExp(nm);
          const match = regex.exec(stdout);

          if (match) {
            return res.status(400).send(
              utils.returnErrorsHtmlPage({
                title: 'You have already deployed such a bot.',
                description: `
                  <p>Try to make a different one</p>
                `,
              }),
            );
          }

          // try {
          //   fetch('https://api.cloudflare.com/client/v4/user/tokens/verify', {
          //     method: 'GET',
          //     headers: {
          //       Authorization: `Bearer ${cfWranglerKey}`,
          //     },
          //   })
          //     .then((response) => response.json())
          //     .then((data) => {
          //       console.log('CF RESPONSE: ', data);
          //     })
          //     .catch((error) => {
          //       console.error('CF Error:', error);
          //     });
          // } catch (e) {
          //   console.error('ERROR ON FETCHING WITH BEARER', e);
          // }

          // Create a new namespace
          exec(
            `CLOUDFLARE_API_TOKEN=${cfWranglerKey} npm run wrangler kv:namespace create ${nm}`,
            (error, stdout, stderr) => {
              console.log('error', error);
              console.log('stdout', stdout);
              console.log('stderr', stderr);

              if (error) {
                console.error('Error on namespace creation. Error:', stdout);
                const errInfo = stderr.match(/\[ERROR].*/s);

                return res.status(500).send(
                  utils.returnErrorsHtmlPage({
                    title: 'Something went wrong. Try again or contact support.',
                    description: `
                  <p>Failed to create a namespace. Error: ${error.message}${
                      errInfo ? `. ${errInfo[0]}` : ''
                    }</p>
                `,
                  }),
                );
              }

              // Find the ID in the stdout. Example of stdout:
              // ...
              // kv_namespaces = [
              //   { binding = "NAME", id = "12345abc..." }
              // ]
              const regex = /id = "(\w+)"/;
              const match = regex.exec(stdout);
              const id = match ? match[1] : null;

              if (!id && error) {
                console.error(`Error to retrieve the KV ID: ${error}`);
                return res.status(400).json({ error: `Failed to create a KV. ${error}` });
              }

              fs.writeFileSync(
                'wrangler.toml',
                `
name = "chatgpt-telegram-${botUsername}"
compatibility_date = "2023-05-05"
main = "./dist/index.js"
workers_dev = true
minify = true
send_metrics = false
account_id = ${cfAccountID}

kv_namespaces = [
  { binding = "DATABASE", id = "${id}" }
]

[vars]

API_KEY = "${openAiKey}"
TELEGRAM_AVAILABLE_TOKENS = "${tgToken}"
I_AM_A_GENEROUS_PERSON = "true"
SYSTEM_INIT_MESSAGE ="${initmessage}"
AMOUNT_OF_FREE_MESSAGES=${freeMessages}
ACTIVATION_CODE="${activationCode}"
LINK_TO_PAY_FOR_CODE="${paymentLink}"
`,
              );

              fs.readFile('src/env.js', 'utf8', function (err, data) {
                if (err) {
                  console.error(err);
                  return;
                }
                // @todo fix this replacement. Allow changes through ENV file
                const updatedData = data.replace(
                  /(SYSTEM_INIT_MESSAGE: )('.*?')(,)/,
                  `SYSTEM_INIT_MESSAGE: '${initmessage}',`,
                );

                fs.writeFile('src/env.js', updatedData, 'utf8', function (err) {
                  if (err) {
                    console.error(err);
                    return;
                  }
                  console.log('File updated successfully');
                });
              });

              exec(
                `CLOUDFLARE_API_TOKEN=${cfWranglerKey} npm run deploy:build`,
                (error, stdout, stderr) => {
                  if (error) {
                    console.error(`exec deploy error: ${error}`);

                    return res.status(500).send(
                      utils.returnErrorsHtmlPage({
                        title: 'Something went wrong. Try again or contact support.',
                        description: '<p>Failed to deploy this bot.</p>',
                      }),
                    );
                  }

                  const workerDomain = stdout.match(/https:\/\/[a-z-A-Z1-9-.]*\.workers\.dev/);

                  if (!workerDomain?.[0]) {
                    return res.status(500).send(
                      utils.returnErrorsHtmlPage({
                        title: 'We did not able to activate your bot.',
                        description:
                          '<p>You need to open a new worker domain and activate it or contact the support.</p>',
                      }),
                    );
                  }

                  // Bot activation. This way, the user doesn't have to do it himself.
                  request(`${workerDomain?.[0]}/init`, (error, response, body) => {
                    if (error) {
                      console.error(`exec deploy error: ${error}`);
                      return res.status(500).json({ error: 'Failed to initialize' });
                    }

                    res.send(
                      utils.wrapInHtmlTemplate(`
                          <header>
                            <h2>Succesful deployment!</h2>
                          </header>
                          <main>
                            <p class='centered'>
                              <a href="https://t.me/${botUsername}" target='_blank' rel="noreferrer">Run your bot now</a>
                            </p>
                          </main>
                          <script>window.location="https://t.me/${botUsername}"</script>
                        `),
                    );
                  });
                },
              );
            },
          );
        });
      } else {
        console.error(error);
        return res.status(400).json({ error: 'Failed to get telegram bot name.' });
      }
    });
  },
);

export default router;
