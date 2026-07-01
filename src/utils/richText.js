import sanitizeHtml from 'sanitize-html';

const ALLOWED_TAGS = ['b', 'i', 'em', 'strong', 'a', 'br', 'span'];
const ALLOWED_ATTRIBUTES = {
  a: ['href', 'target', 'rel'],
  span: ['class'],
};

/**
 * Sanitizes trusted-but-editable rich text (citations, titles, descriptions)
 * before it is passed to `set:html`. Only a small allowlist of formatting
 * tags survives; everything else (script, event handlers, style, etc.) is
 * stripped. Links are forced to open safely regardless of source markup.
 */
export function sanitizeRichText(value) {
  if (value == null) return '';
  return sanitizeHtml(String(value), {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer' }, true),
    },
  });
}
