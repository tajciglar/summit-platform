/**
 * POST /api/optin
 *
 * Handles email opt-in form submissions.
 *
 * Flow:
 * 1. Validate email + required fields
 * 2. Create or update ActiveCampaign contact
 * 3. Apply optin tag
 * 4. Return success
 *
 * Called by: OptinForm.tsx
 *
 * TODO: Add rate limiting via @upstash/ratelimit (10 req/min per IP)
 * before deploying to production.
 */

import type { APIRoute } from 'astro'
import { tagContact } from '~/lib/activecampaign'
import type { UTMParams } from '~/lib/utm'

interface OptinRequestBody {
  email: string
  name?: string
  summitId: string
  acTag?: string | null
  utms?: UTMParams
}

export const POST: APIRoute = async ({ request }) => {
  // Validate Content-Type
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return json({ success: false, error: 'Expected application/json' }, 400)
  }

  let body: OptinRequestBody
  try {
    body = (await request.json()) as OptinRequestBody
  } catch {
    return json({ success: false, error: 'Invalid JSON body' }, 400)
  }

  const { email, name, summitId, acTag, utms } = body

  // ── Validation ────────────────────────────────────────────────────────────
  if (!email || typeof email !== 'string') {
    return json({ success: false, error: 'Email is required' }, 422)
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return json({ success: false, error: 'Invalid email address' }, 422)
  }

  if (!summitId) {
    return json({ success: false, error: 'summitId is required' }, 422)
  }

  // ── ActiveCampaign ────────────────────────────────────────────────────────
  try {
    const tags = [acTag ?? 'summit-optin'].filter(Boolean) as string[]

    await tagContact({
      email,
      name: name ?? undefined,
      tags,
      utmParams: utms,
    })
  } catch (err) {
    // Log but don't fail the optin — AC errors should not block the user flow
    console.error('[api/optin] ActiveCampaign error:', err)
  }

  return json({ success: true })
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
