/**
 * Fire a Meta Pixel standard event from the client. No-op when the pixel
 * script isn't loaded (e.g. brand without a pixel id, preview runs that
 * skip the pixel, or before the injected script finishes loading).
 *
 * Standard event reference:
 * https://developers.facebook.com/docs/meta-pixel/reference
 */
declare global {
  interface Window {
    fbq?: (
      command: 'init' | 'track' | 'trackCustom',
      event: string,
      params?: Record<string, unknown>,
    ) => void;
  }
}

export function trackPixelEvent(
  event: 'Lead' | 'InitiateCheckout' | 'Purchase' | 'CompleteRegistration' | 'ViewContent',
  params?: Record<string, unknown>,
): void {
  if (typeof window === 'undefined') return;
  if (typeof window.fbq !== 'function') return;
  window.fbq('track', event, params);
}
