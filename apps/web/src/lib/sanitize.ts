/**
 * HTML sanitisation utility for user-supplied / CMS-supplied HTML content.
 *
 * Used by CustomSection.astro to safely render the `html` field from the CMS
 * without exposing the site to XSS via malicious CMS content.
 *
 * Uses isomorphic-dompurify which works in both Node.js (SSR) and browser
 * environments, so it can safely be called in Astro component frontmatter.
 */

import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitise a raw HTML string, allowing only safe tags and attributes.
 * Strips <script>, <iframe>, on* event handlers, and javascript: hrefs.
 *
 * @param html - Raw HTML string from CMS
 * @returns Safe HTML string suitable for use in `set:html` / innerHTML
 *
 * @example
 * const safe = sanitizeHtml('<p>Hello</p><script>alert(1)</script>')
 * // → '<p>Hello</p>'
 */
export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return ''

  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: [
      'p', 'br', 'hr',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'strong', 'em', 'b', 'i', 'u', 's', 'del', 'ins',
      'blockquote', 'pre', 'code',
      'a',
      'img',
      'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
      'div', 'span', 'section', 'article', 'aside', 'header', 'footer',
      'figure', 'figcaption',
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'title',
      'src', 'alt', 'width', 'height', 'loading',
      'class', 'id',
      'style',
    ],
    FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    ALLOW_DATA_ATTR: false,
  })
}
