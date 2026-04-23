/**
 * Resolves the href for a sales-page checkout CTA.
 *
 * Interim behavior: if the funnel has a WordPress cart URL configured, we
 * hand off there. Otherwise we fall back to the in-page `#purchase` anchor,
 * which matches the historical behavior of sales pages that scroll/jump to
 * the price card. Once native Stripe checkout ships, this helper is the one
 * place that swaps to `/f/{funnel}/checkout`.
 *
 * Security: this is the chokepoint that turns an admin-editable DB field
 * (`funnels.wp_checkout_redirect_url`) into a real href. A compromised
 * admin account could otherwise plant a `javascript:` or `data:` URL and
 * pop XSS on every sales page. We only accept http/https; anything else
 * falls through to the safe in-page anchor.
 */
export function resolveCheckoutHref(wpCheckoutRedirectUrl?: string | null): string {
  if (!wpCheckoutRedirectUrl || wpCheckoutRedirectUrl.trim() === '') {
    return '#purchase';
  }

  const trimmed = wpCheckoutRedirectUrl.trim();

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return '#purchase';
    }
    return parsed.toString();
  } catch {
    // Malformed URL — refuse rather than pass a hostile string to location.href.
    return '#purchase';
  }
}
