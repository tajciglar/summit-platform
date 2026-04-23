import type { PublishedContent, Speaker } from '@/templates/types';
import type { Palette } from '../palette';
import type { DesignTokens } from '@/templates/shared/design-tokens';

const BASE = process.env.LARAVEL_API_URL ?? 'http://localhost:8000';
const INTERNAL_TOKEN = process.env.INTERNAL_API_TOKEN ?? '';

function internalHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return {
    Accept: 'application/json',
    ...(INTERNAL_TOKEN ? { Authorization: `Bearer ${INTERNAL_TOKEN}` } : {}),
    ...extra,
  };
}

export interface DraftPayload extends PublishedContent {
  speakers: Speaker[];
  status: string;
  funnel_id: string;
  funnel_step_id: string | null;
  summit_id: string | null;
  enabled_sections: string[] | null;
  audience: string | null;
  palette: Palette | null;
  tokens?: DesignTokens | null;
  wp_checkout_redirect_url: string | null;
  wp_thankyou_redirect_url: string | null;
}

export interface PublicPayload extends PublishedContent {
  speakers: Speaker[];
  funnel_id: string;
  funnel_step_id: string | null;
  summit_id: string | null;
  enabled_sections: string[] | null;
  audience: string | null;
  palette: Palette | null;
  tokens?: DesignTokens | null;
  wp_checkout_redirect_url: string | null;
  wp_thankyou_redirect_url: string | null;
}

export async function fetchDraft(token: string): Promise<DraftPayload | null> {
  const res = await fetch(`${BASE}/api/landing-page-drafts/${encodeURIComponent(token)}`, {
    cache: 'no-store',
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Draft fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchPublished(funnelId: string, stepType = 'optin'): Promise<PublicPayload | null> {
  const url = `${BASE}/api/funnels/${encodeURIComponent(funnelId)}/published-content?step_type=${encodeURIComponent(stepType)}`;
  const res = await fetch(url, { headers: internalHeaders(), next: { revalidate: 60 } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Published fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchStepPreview(stepId: string): Promise<PublicPayload | null> {
  const res = await fetch(`${BASE}/api/funnel-steps/${encodeURIComponent(stepId)}/preview-content`, {
    headers: internalHeaders(),
    cache: 'no-store',
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Step preview fetch failed: ${res.status}`);
  return res.json();
}

export function speakersById(speakers: Speaker[]): Record<string, Speaker> {
  return Object.fromEntries(speakers.map((s) => [s.id, s]));
}

export interface CheckoutPrefillPayload {
  email: string;
  first_name: string;
}

/**
 * Exchanges the opaque ?p= token from the optin redirect for the buyer's
 * email + first_name. Returns null for invalid/expired/tampered tokens — the
 * sales page then renders without prefill (user can still check out manually).
 */
export async function fetchCheckoutPrefill(token: string): Promise<CheckoutPrefillPayload | null> {
  const res = await fetch(`${BASE}/api/optin/prefill/${encodeURIComponent(token)}`, {
    headers: internalHeaders(),
    cache: 'no-store',
  });
  if (res.status === 404 || res.status === 401) return null;
  if (!res.ok) throw new Error(`Prefill fetch failed: ${res.status}`);
  return res.json();
}
