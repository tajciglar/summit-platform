import type { ComponentType } from 'react';
import { notFound } from 'next/navigation';
import { fetchDraft, speakersById } from '@/lib/api/laravel';
import type { Palette } from '@/lib/palette';
import { getTemplate } from '@/templates/registry';
import type { Speaker } from '@/templates/types';

type OpusV1ComponentProps = {
  content: unknown;
  speakers: Record<string, Speaker>;
  funnelId: string;
  enabledSections?: string[];
  palette?: Palette | null;
};

export const dynamic = 'force-dynamic';

export default async function PreviewPage({
  params,
}: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const draft = await fetchDraft(token);
  if (!draft) notFound();

  const template = getTemplate(draft.template_key);
  if (!template) {
    return (
      <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
        <h1>Template not found</h1>
        <p>Template &quot;{draft.template_key}&quot; no longer exists. Generate a new draft.</p>
      </div>
    );
  }

  const parsed = template.schema.safeParse(draft.content);
  if (!parsed.success) {
    return (
      <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
        <h1>Schema validation failed</h1>
        <p>The draft&apos;s content does not match the template&apos;s current schema.</p>
        <pre style={{ background: '#f3f4f6', padding: 16, overflow: 'auto' }}>
          {JSON.stringify(parsed.error.issues, null, 2)}
        </pre>
      </div>
    );
  }

  const speakers = speakersById(draft.speakers);
  const Component = template.Component;
  // Only opus-v1 currently accepts `enabledSections` and `palette`. Other
  // templates render their full content as-is (Phase 2a + 3a-1 scope).
  // Normalize null → undefined for enabledSections so the layout falls back
  // to its default enabled set for legacy drafts. palette stays null/Palette
  // because `paletteStyle(null)` returns undefined on purpose.
  const enabledSections = draft.enabled_sections ?? undefined;
  if (draft.template_key === 'opus-v1') {
    const OpusV1Component = Component as ComponentType<OpusV1ComponentProps>;
    return (
      <OpusV1Component
        content={parsed.data}
        enabledSections={enabledSections}
        speakers={speakers}
        funnelId={draft.funnel_id}
        palette={draft.palette}
      />
    );
  }
  return <Component content={parsed.data} speakers={speakers} funnelId={draft.funnel_id} />;
}
