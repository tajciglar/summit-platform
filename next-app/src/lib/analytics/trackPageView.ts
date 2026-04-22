type PageType = 'optin' | 'sales' | 'checkout_click';

type TrackPayload = {
  page_type: PageType;
  summit_id: string;
  funnel_id: string;
  funnel_step_id: string;
};

/**
 * Fire-and-forget POST to our Next.js proxy, which forwards to Laravel.
 * Never blocks the caller; swallows errors — analytics is not critical-path.
 */
export async function trackPageView(payload: TrackPayload): Promise<void> {
  try {
    await fetch('/api/track/page-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // intentionally swallowed
  }
}
