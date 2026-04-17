import type { ComponentType } from 'react';
import { notFound } from 'next/navigation';
import { fetchPublished, speakersById } from '@/lib/api/laravel';
import { getTemplate } from '@/templates/registry';
import type { Speaker } from '@/templates/types';

type OpusV1ComponentProps = {
  content: unknown;
  speakers: Record<string, Speaker>;
  funnelId: string;
  enabledSections?: string[];
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
  // Only opus-v1 currently accepts `enabledSections`. Other templates render
  // their full content as-is (Phase 2a scope). Normalize null → undefined so
  // the layout falls back to its default enabled set for legacy published
  // content.
  const enabledSections = published.enabled_sections ?? undefined;
  if (published.template_key === 'opus-v1') {
    const OpusV1Component = Component as ComponentType<OpusV1ComponentProps>;
    return (
      <OpusV1Component
        content={parsed.data}
        enabledSections={enabledSections}
        speakers={speakersById(published.speakers)}
        funnelId={funnel}
      />
    );
  }
  return <Component content={parsed.data} speakers={speakersById(published.speakers)} funnelId={funnel} />;
}
