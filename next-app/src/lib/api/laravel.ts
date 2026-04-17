import type { PublishedContent, Speaker } from '@/templates/types';

const BASE = process.env.LARAVEL_API_URL ?? 'http://localhost:8000';

export interface DraftPayload extends PublishedContent {
  speakers: Speaker[];
  status: string;
  funnel_id: string;
  enabled_sections: string[] | null;
}

export interface PublicPayload extends PublishedContent {
  speakers: Speaker[];
  funnel_id: string;
  enabled_sections: string[] | null;
}

export async function fetchDraft(token: string): Promise<DraftPayload | null> {
  const res = await fetch(`${BASE}/api/landing-page-drafts/${encodeURIComponent(token)}`, {
    cache: 'no-store',
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Draft fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchPublished(funnelId: string): Promise<PublicPayload | null> {
  const res = await fetch(`${BASE}/api/funnels/${encodeURIComponent(funnelId)}/published-content`, {
    next: { revalidate: 60 },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Published fetch failed: ${res.status}`);
  return res.json();
}

export function speakersById(speakers: Speaker[]): Record<string, Speaker> {
  return Object.fromEntries(speakers.map((s) => [s.id, s]));
}
