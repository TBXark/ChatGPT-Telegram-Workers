import jsHtmlencode from 'js-htmlencode';
import constants from './constants.js';

function escapeAttr(str) {
  return jsHtmlencode.htmlEncode(str);
}

function isValidAccessCode(value) {
  if (typeof value !== 'string') return false;

  return value.trim() === constants.accessCode;
}

export default {
  escapeAttr,
  isValidAccessCode,
};
