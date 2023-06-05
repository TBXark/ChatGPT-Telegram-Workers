import path from 'node:path';
import jsHtmlencode from 'js-htmlencode';
import { fileURLToPath } from 'url';

function getDirname() {
  // Fix ReferenceError, because we cannot set __dirname directly in ES module.
  const __filename = fileURLToPath(import.meta.url);

  return path.dirname(__filename);
}

function escapeAttr(str) {
  return jsHtmlencode.htmlEncode(str);
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
  wrapInHtmlTemplate,
  returnErrorsHtmlPage,
};
