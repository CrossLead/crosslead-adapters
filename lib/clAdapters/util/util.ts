import * as sanitize_ from 'sanitize-html';

/**
 * This is used for sanitizing the description field of an event.
 * Sadly, the sanitize-html package appears to offer no way to
 * express tags that should be *excluded*.
 * The only tags I want to exclude, really, are 'head' and 'html'.
 */
const allowedTags = [
  'a', 'b', 'br', 'div', 'font',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr',
  'img', 'label', 'li', 'ol', 'p', 'span',
  'strong', 'table', 'td', 'th', 'tr', 'u', 'ul'
];


export const sanitize = (arg: string) => {
  return sanitize_(arg, { allowedTags });
};
