import path from 'node:path';
import jsHtmlencode from 'js-htmlencode';
import { fileURLToPath } from 'url';
import fs from 'node:fs';

function getDirname() {
  // Fix ReferenceError, because we cannot set __dirname directly in ES module.
  const __filename = fileURLToPath(import.meta.url);
  return path.dirname(__filename);
}

function escapeAttr(str) {
  return jsHtmlencode.htmlEncode(str);
}

function writeWranglerFile({
  botName = '',
  cfAccountID = '',
  kvID = '',
  openAiKey = '',
  tgToken = '',
  initMessage = '',
  freeMessages = '',
  activationCode = '',
  paymentLink = '',
}) {
  fs.writeFileSync(
    'wrangler.toml',
    `
name = "chatgpt-telegram-${botName}"
compatibility_date = "2023-05-05"
main = "./dist/index.js"
workers_dev = true
minify = true
send_metrics = false
account_id = "${cfAccountID}"

kv_namespaces = [
  { binding = "DATABASE", id = "${kvID}" }
]

[vars]

API_KEY = "${openAiKey}"
TELEGRAM_AVAILABLE_TOKENS = "${tgToken}"
I_AM_A_GENEROUS_PERSON = "true"
SYSTEM_INIT_MESSAGE ="${initMessage}"
AMOUNT_OF_FREE_MESSAGES=${freeMessages}
ACTIVATION_CODE="${activationCode}"
LINK_TO_PAY_FOR_CODE="${paymentLink}"
`,
  );
}

function wrapInHtmlTemplate(html) {
  return `
  <html lang='en'>
    <head>
      <meta charset='UTF-8' />
      <title>Onout - deploy Telegram ChatGPT bot</title>
      <link rel='stylesheet' href='/index.css' />
      <meta content="width=device-width, initial-scale=1" name="viewport" />
      <meta name="theme-color" content="#5f48b0" />
      <meta
        name="description"
        content="Deploy your own ChatGPT bot on Telegram in one-click"
      />
      <meta name="keywords" content="chatgpt bot, telegram bot, chatgpt telegram, ai bot, ai app, no-code telegram bot, earn on ai, onout" />
    </head>
    <body>
      ${html}
    </body>
    <footer>
      <div class='supportWrapper'>
        Support:
        <a
          href="mailto:support@onout.org"
          target="_blank"
          rel="noreferrer"
        >
          Email
        </a> or
        <a
          href="https://t.me/onoutsupportbot"
          target="_blank"
          rel="noreferrer"
        >
          Telegram
        </a>
      </div>
    </footer>
  </html>
  `;
}

function returnErrorsHtmlPage({ title, description }) {
  return wrapInHtmlTemplate(`
    <header>
      <h2>${title}</h2>
    </header>
    <main class='centered'>
      ${description ? `<div>${description}</div>` : ''}
      <a href='/'>
        <strong>Go back</strong>
      </a>
    </main>
  `);
}

export default {
  getDirname,
  escapeAttr,
  writeWranglerFile,
  wrapInHtmlTemplate,
  returnErrorsHtmlPage,
};
