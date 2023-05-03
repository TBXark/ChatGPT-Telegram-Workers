import jsHtmlencode from 'js-htmlencode';
import constants from './constants.js';

function escapeAttr(str) {
  return jsHtmlencode.htmlEncode(str);
}

function isValidAccessCode(value) {
  if (typeof value !== 'string') return false;

  return value.trim() === constants.accessCode;
}

function wrapInHtmlTemplate(html) {
  return `
  <html lang='en'>
    <head>
      <meta charset='UTF-8' />
      <title>Onout - deploy Telegram ChatGPT bot</title>
      <link rel='stylesheet' href='/index.css' />
    </head>
    <body>
      ${html}
    </body>
  </html>
  `;
}

export default {
  escapeAttr,
  isValidAccessCode,
  wrapInHtmlTemplate,
};
