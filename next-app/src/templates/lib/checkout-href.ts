/**
 * Resolves the href for a sales-page checkout CTA.
 *
 * Interim behavior: if the funnel has a WordPress cart URL configured, we
 * hand off there. Otherwise we fall back to the in-page `#purchase` anchor,
 * which matches the historical behavior of sales pages that scroll/jump to
 * the price card. Once native Stripe checkout ships, this helper is the one
 * place that swaps to `/f/{funnel}/checkout`.
 */
export function resolveCheckoutHref(wpCheckoutRedirectUrl?: string | null): string {
  return wpCheckoutRedirectUrl && wpCheckoutRedirectUrl.trim() !== ''
    ? wpCheckoutRedirectUrl
    : '#purchase';
}
