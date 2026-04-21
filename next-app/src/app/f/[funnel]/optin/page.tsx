import type { ComponentType } from 'react';
import { notFound } from 'next/navigation';
import { fetchPublished, speakersById } from '@/lib/api/laravel';
import type { Palette } from '@/lib/palette';
import { getTemplate } from '@/templates/registry';
import type { Speaker } from '@/templates/types';

type OchreInkComponentProps = {
  content: unknown;
  speakers: Record<string, Speaker>;
  funnelId: string;
  enabledSections?: string[];
  palette?: Palette | null;
};

export const revalidate = 60;

export default async function OptinPage({
  params,
}: { params: Promise<{ funnel: string }> }) {
  const { funnel } = await params;
  const published = await fetchPublished(funnel);
  if (!published) notFound();

  const template = getTemplate(published.template_key);
  if (!template) notFound();

  const parsed = template.schema.safeParse(published.content);
  if (!parsed.success) notFound();

  const Component = template.Component;
  // Only ochre-ink currently accepts `enabledSections` and `palette`. Other
  // templates render their full content as-is (Phase 2a + 3a-1 scope).
  // Normalize null → undefined for enabledSections so the layout falls back
  // to its default enabled set for legacy published content. palette stays
  // null/Palette because `paletteStyle(null)` returns undefined on purpose.
  const enabledSections = published.enabled_sections ?? undefined;
  if (published.template_key === 'ochre-ink') {
    const OchreInkComponent = Component as ComponentType<OchreInkComponentProps>;
    return (
      <OchreInkComponent
        content={parsed.data}
        enabledSections={enabledSections}
        speakers={speakersById(published.speakers)}
        funnelId={funnel}
        palette={published.palette}
      />
    );
  }
  return <Component content={parsed.data} speakers={speakersById(published.speakers)} funnelId={funnel} />;
}
