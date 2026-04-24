/**
 * Appends tracking context onto an outbound URL (typically a WP checkout link).
 * We forward three families of identifiers so the destination's analytics can
 * attribute the conversion back to the original traffic source:
 *
 *   - UTM params (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`,
 *     `utm_content`) — inbound query strings; preserved verbatim.
 *   - Meta click id (`fbclid`) — lands on our URL when traffic came from an
 *     FB/IG ad. Forwarding it lets the WP-side Meta Pixel attribute the
 *     Purchase event back to the ad.
 *   - Meta browser identifiers (`_fbp`, `_fbc`) — pixel cookies that the WP
 *     side's Conversions API (if configured) uses for event matching.
 *
 * Existing query params on the target URL are preserved; forwarded params
 * never clobber keys already present on the destination.
 */

const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
] as const;

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp('(?:^|; )' + name.replace(/[.$?*|{}()[\]\\/+^]/g, '\\$&') + '=([^;]*)'),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export function buildTrackingUrl(href: string): string {
  if (typeof window === 'undefined') return href;
  if (href.startsWith('#')) return href;

  let target: URL;
  try {
    target = new URL(href);
  } catch {
    return href;
  }

  const inbound = new URLSearchParams(window.location.search);
  const forward: Record<string, string> = {};

  for (const key of UTM_KEYS) {
    const v = inbound.get(key);
    if (v) forward[key] = v;
  }

  const fbclid = inbound.get('fbclid');
  if (fbclid) forward.fbclid = fbclid;

  const fbp = readCookie('_fbp');
  if (fbp) forward._fbp = fbp;

  const fbc = readCookie('_fbc');
  if (fbc) forward._fbc = fbc;

  for (const [key, value] of Object.entries(forward)) {
    if (!target.searchParams.has(key)) {
      target.searchParams.set(key, value);
    }
  }

  return target.toString();
}
