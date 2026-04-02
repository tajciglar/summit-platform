/**
 * ClickMagic conversion postback — server-only.
 *
 * Fires an HTTP GET postback to ClickMagic after a confirmed purchase so
 * that ClickMagic can attribute the conversion to the originating click.
 *
 * ClickMagic postback URL format:
 *   https://www.clickmagick.com/api/postback?action=sale
 *     &uid={clickmagic_user_id}
 *     &tid={clickmagic_track_id}
 *     &amount={sale_amount_in_dollars}
 *     &ref={order_number}
 *     &type=sale
 *
 * The `clkn` / `clkid` click ID is not available server-side here — ClickMagic
 * tracks it on the client via its tracking pixel. This postback is a server-side
 * "offline conversion" signal, supplementary to the client-side pixel.
 *
 * NEVER import from client-side code — CLICKMAGIC_USER_ID/TRACK_ID must not
 * be exposed to the browser.
 */

const CLICKMAGIC_POSTBACK_URL = 'https://www.clickmagick.com/api/postback'

export interface ClickMagicPostbackParams {
  /** Order number for deduplication / reference in ClickMagic reports */
  ref: string
  /** Sale amount in cents — will be converted to dollars */
  amountCents: number
  /** Optional: ClickMagic click ID captured from the landing page URL (?clkn=...) */
  clickId?: string
}

/**
 * Fire a ClickMagic sale postback for a confirmed order.
 *
 * Non-throwing — logs errors but never throws, so a ClickMagic failure
 * never blocks the webhook response or order confirmation.
 */
export async function fireClickMagicPostback(
  params: ClickMagicPostbackParams
): Promise<void> {
  const userId = import.meta.env.CLICKMAGIC_USER_ID
  const trackId = import.meta.env.CLICKMAGIC_TRACK_ID

  if (!userId || !trackId) {
    console.warn('[clickmagic.ts] CLICKMAGIC_USER_ID or CLICKMAGIC_TRACK_ID not configured — skipping postback')
    return
  }

  const amountDollars = (params.amountCents / 100).toFixed(2)

  const url = new URL(CLICKMAGIC_POSTBACK_URL)
  url.searchParams.set('action', 'sale')
  url.searchParams.set('uid', userId)
  url.searchParams.set('tid', trackId)
  url.searchParams.set('amount', amountDollars)
  url.searchParams.set('ref', params.ref)
  url.searchParams.set('type', 'sale')

  if (params.clickId) {
    url.searchParams.set('clkid', params.clickId)
  }

  try {
    const res = await fetch(url.toString(), { method: 'GET' })
    if (!res.ok) {
      const text = await res.text()
      console.error(`[clickmagic.ts] Postback failed ${res.status}: ${text}`)
    }
  } catch (err) {
    console.error('[clickmagic.ts] Postback request error:', err)
  }
}
