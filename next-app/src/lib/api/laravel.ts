import type { PublishedContent, Speaker } from '@/templates/types';
import type { Palette } from '../palette';

const BASE = process.env.LARAVEL_API_URL ?? 'http://localhost:8000';

export interface DraftPayload extends PublishedContent {
  speakers: Speaker[];
  status: string;
  funnel_id: string;
  enabled_sections: string[] | null;
  audience: string | null;
  palette: Palette | null;
}

export interface PublicPayload extends PublishedContent {
  speakers: Speaker[];
  funnel_id: string;
  enabled_sections: string[] | null;
  audience: string | null;
  palette: Palette | null;
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
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Published fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchStepPreview(stepId: string): Promise<PublicPayload | null> {
  const res = await fetch(`${BASE}/api/funnel-steps/${encodeURIComponent(stepId)}/preview-content`, {
    cache: 'no-store',
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Step preview fetch failed: ${res.status}`);
  return res.json();
}

export function speakersById(speakers: Speaker[]): Record<string, Speaker> {
  return Object.fromEntries(speakers.map((s) => [s.id, s]));
}
