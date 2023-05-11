/* eslint-disable indent */
import fs from 'fs';
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

    res.send(
      utils.wrapInHtmlTemplate(
        `
      <header>
        <h2 class='deploymentPageTitle'>Run your own ChatGPT telegram bot</h2>
      </header>
      <main>
        <section class="deploymentSection">
          <form method="post" action="bot/deploy">
            <div class="row">
              <label for="tgTokenInput">
                Telegram bot API token. <a href="https://t.me/BotFather" target='_blank' rel="noreferrer">Get at BotFather</a> *
              </label>
              <input type='text' name='tg_token' placeholder='57107394230:AAE33330Myi4tglJCdUrt4hsJd6J6Jo3D2tQ' id='tgTokenInput' required>
            </div>

            <div class="row">
              <label for="openAiInput">
                OpenAI API key. <a href="https://platform.openai.com/" target='_blank' rel="noreferrer">Get it here</a> *
              </label>
              <input type='text' name='openai_sk' placeholder='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' id='openAiInput' required>
            </div>

            <div class="row">
              <label for="cloudflareInput">
                Cloudflare API key. <a href="https://dash.cloudflare.com/" target='_blank' rel="noreferrer">Get it here</a> *
              </label>
              <details>
                <summary>How to get this API key?</summary>
                <ol>
                  <li>Log in to your <a href="https://dash.cloudflare.com/" target='_blank' rel="noreferrer">Cloudflare account</a> (or create a new one), add a site (you need a domain, you may register new there - check "domain registrations" tab in cloudflare) then navigate to the "My Profile" page.</li>
                  <li>Select "API Tokens" from the left-hand menu.</li>
                  <li>Click the "Create Token" button.</li>
                  <li>Choose "Edit Cloudflare Workers" from the API token templates</li>
                  <li>In the "Zone Resources" dropdown menu, select the domain you want to authorize.</li>
                  <li>In the "Account Resources" dropdown menu, select the account you want to authorize.</li>
                  <li>Click the "Create Token" button.</li>
                </ol>

                You have now created a Cloudflare API Token with Workers permissions. Remember, API Token security is very important. Do not share it unnecessarily and change your API Token regularly.
              </details>
              <input type='text' name='cf_wrangler_key' placeholder='zW5qUZ0qmy5JwqJwlRxhU2p_-Pnu-r2CeFOQcpnq' id='cloudflareInput' required>
            </div>

            <div class="row">
              <label for="promptArea">
                Prompt - instructions for a bot, user can't see this text (Optional).
                You can use any language. <a href="#" target="_blank">Examples</a>:
              </label>
              <textarea name='prompt' id='promptArea'></textarea>
            </div>

            <p><strong>Monetization</strong>: <i>if you skip the options below, your bot will be used for free.</i></p>

            <div class="row">
              <label for="freeMessagesArea">
                Number of free messages available to the user.
              </label>
              <input type='number' name='free_messages' id='freeMessagesArea' placeholder='10'></input>
            </div>
            <div class="row">
              <div>
                <label for="activationCodeArea">
                  Activation code. This code is used to get access when free messages have run out.
                </label>
                You can just <button id='generateActivationCodeBtn' type='button'>generate code!</button>.
              </div>
              <input type='text' name='activation_code' minlength='4' maxlength='128' id='activationCodeArea' placeholder='af9e4w3ef8017a003eq910dc2575497d'></input>
            </div>
            <div class="row">
              <label for="paymentLinkArea">
                URL to pay for an activation code. If you don't set this, the bot will simply ask for the activation code without a payment link.
              </label>
              <input type='text' name='payment_link' id='paymentLinkArea' placeholder='https://www.buymeacoffee.com/...'></input>
            </div>

            <input type='submit' value='Create Telegram bot' class='primaryBtn'>
          </form>
        </section>
      </main>
      <script>
        function makeRandomString(length) {
          let result = '';
          const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
          const charactersLength = characters.length;
          let counter = 0;
        
          while (counter < length) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
            counter++;
          }

          return result;
        }

        const activationCodeArea = document.getElementById('activationCodeArea')
        const generateActivationCodeBtn = document.getElementById('generateActivationCodeBtn')

        generateActivationCodeBtn.addEventListener('click', () => {
          activationCodeArea.value = makeRandomString(32)
        })
      </script>
    `,
      ),
    );
  },
);

router.post(
  '/deploy',
  [
    body('tg_token').notEmpty().withMessage('Please specify Telegram API token'),
    body('openai_sk').notEmpty().withMessage('Please specify OpenAI API key'),
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
        exec('wrangler kv:namespace list', (error, stdout, stderr) => {
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

          // Create a new namespace
          exec(
            `CLOUDFLARE_API_TOKEN=${cfWranglerKey} npm run wrangler kv:namespace create ${nm}`,
            (error, stdout, stderr) => {
              if (error) {
                console.error('Error on namespace creation. Error:', stdout);

                return res.status(500).send(
                  utils.returnErrorsHtmlPage({
                    title: 'Something went wrong. Try again or contact support.',
                    description: `
                  <p>Failed to create a namespace. Error: ${error.message}</p>
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

                  request(
                    `https://chatgpt-telegram-${botUsername}.onout.workers.dev/init`,
                    (error, response, body) => {
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
                              <a href="https://t.me/${botUsername}">Run your bot now</a>
                            </p>
                          </main>
                          <script>window.location="https://t.me/${botUsername}"</script>
                        `),
                      );
                    },
                  );
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

router.post(
  '/activateBot',
  [
    body('bot_url')
      .trim()
      .notEmpty()
      .escape()
      .matches(/https:\/\/chatgpt-telegram-\w+\.?\w+\.workers.dev/)
      .withMessage('Enter a valid bot URL'),
    body('bot_name').notEmpty().withMessage('Enter a valid bot name'),
  ],
  async (req, res) => {
    try {
      const botName = utils.escapeAttr(req.body.bot_name);
      const botUrl = utils.escapeAttr(req.body.openai_sk);
      const response = await fetch(`${botUrl}/init`);

      console.log('🚀 ~ file: botRouter.js:235 ~ response:', response);

      res.send(
        utils.wrapInHtmlTemplate(`
      <header>
        <h2>Your bot is activated!</h2>
      </header>
      <main>
        <p class='centered'>
          Check your new bot: <a
            href="https://t.me/${botName}" target="_blank" rel="noreferrer"
          >
            t.me/${botName}
          </a>
        </p>
      </main>
    `),
      );
    } catch (error) {
      console.error('Error on activation: ', error);
    }
  },
);

export default router;
