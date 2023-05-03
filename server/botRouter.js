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
        utils.wrapInHtmlTemplate(
          `
          <main class='centered'>
            <h2>Not allowed. Wrong code.</h2>
            <a href='/'>
              <strong>Go back</strong>
            </a>
          </main>
        `,
        ),
      );
    }

    res.send(
      utils.wrapInHtmlTemplate(
        `
      <header class="">
        <h2>Run your own ChatGPT telegram bot in 1 click</h2>
      </header>
      <main>
        <section class="deploymentSection">
          <form method="post" action="bot/deploy">
            <div class="row">
              <label for="promptArea">
                Prompt - instructions for a bot, user can't see this text (Optional).
                You can use any language. <a href="#" target="_blank">Examples</a>:
              </label>
              <textarea name='prompt' id='promptArea'></textarea>
            </div>

            <div class="row">
              <label for="tgTokenInput">
                Telegram bot API token. <a href="https://t.me/BotFather" target='_blank'>Get at BotFather</a>:
              </label>
              <input type='text' name='tg_token' placeholder='57107394230:AAE33330Myi4tglJCdUrt4hsJd6J6Jo3D2tQ' id='tgTokenInput'>
            </div>

            <div class="row">
              <label for="openAiInput">
                OpenAI API key. <a href="https://platform.openai.com/" target='_blank'>Get it here</a>:
              </label>
              <input type='text' name='openai_sk' placeholder='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' id='openAiInput'>
            </div>  

            <input type='submit' value='Create Telegram bot' class='primaryBtn'>
          </form>
        </section>
      </main>
    `,
      ),
    );
  },
);

router.post(
  '/deploy',
  [
    body('prompt').notEmpty().withMessage('Please specify Prompt for a bot'),
    body('tg_token').notEmpty().withMessage('Please specify Telegram API token'),
    body('openai_sk').notEmpty().withMessage('Please specify OpenAI API key'),
  ],
  async (req, res) => {
    const result = validationResult(req);
    const msgErrors = result.errors.length && result.errors.map(({ msg }) => `<li>${msg}</li>`);

    if (msgErrors) {
      return res.status(422).send(
        utils.wrapInHtmlTemplate(
          `
        <main class='centered'>
          <h2>Not allowed. Fix these errors</h2>
          <ul>
            ${msgErrors.join('')}
          </ul>
        </main>
        `,
        ),
      );
    }

    const prompt = utils.excapeAttr(req.body.prompt);
    const tgToken = utils.escapeAttr(req.body.tg_token);

    // telegram api get bit name by api key
    const apiPath = `${constants.telegramApi}/bot${tgToken}/getMe`;

    request(apiPath, function (error, response, body) {
      if (!error && response.statusCode === 200) {
        const data = JSON.parse(body).result;
        const botUsername = data.username.toLowerCase();
        const nm = `${botUsername}${new Date().getDate()}_${new Date().getMonth()}_${new Date().getFullYear()}`;

        console.log(`nm:${nm}`);

        exec(`cd ../ && wrangler kv:namespace create ${nm}`, (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            return res.status(400).json({ error: `Failed to create a KV. ${error}` });
          }

          // Find the ID in the stdout
          const regex = /id = "(\w+)"/;
          const match = regex.exec(stdout);
          const id = match ? match[1] : null;

          console.log(`Namespace ID: ${id}`);

          fs.writeFileSync(
            '/root/ChatGPT-Telegram-Workers/wrangler.toml',
            `
name = "chatgpt-telegram-${botUsername}"
compatibility_date = "2023-04-14"
main = "./dist/index.js"
workers_dev = true

kv_namespaces = [
  { binding = "DATABASE", id = "${id}" }
]

[vars]

API_KEY = "${utils.escapeAttr(req.body.openai_sk)}"
TELEGRAM_AVAILABLE_TOKENS = "${tgToken}"
I_AM_A_GENEROUS_PERSON = "true"
PROMPT=${prompt}

AMOUNT_OF_FREE_MESSAGES=2
ACTIVATION_CODE=abcde
LINK_TO_PAY_FOR_CODE="https://google.com"
`,
          );

          exec(
            'cd /root/ChatGPT-Telegram-Workers/ && npm run deploy:build',
            (error, stdout, stderr) => {
              if (error) {
                console.error(`exec deploy error: ${error}`);
                return res.status(400).json({ error: 'Failed to npm run deploy.' });
              }

              res.send(
                utils.wrapInHtmlTemplate(`
                <h2>Succesful deployment</h2>
              `),
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
