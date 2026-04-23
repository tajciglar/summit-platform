import type { ComponentType } from 'react';
import { notFound } from 'next/navigation';
import { fetchPublished, speakersById } from '@/lib/api/laravel';
import { getTemplate } from '@/templates/registry';
import { PageViewTracker } from '@/lib/analytics/PageViewTracker';

export const revalidate = 60;

export default async function OptinPage({
  params,
}: { params: Promise<{ funnel: string }> }) {
  const { funnel } = await params;
  const published = await fetchPublished(funnel);
  if (!published) notFound();

  const template = getTemplate(published.template_key);
  if (!template) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Component = template.Component as ComponentType<any>;
  return (
    <>
      <PageViewTracker
        pageType="optin"
        summitId={published.summit_id ?? ''}
        funnelId={published.funnel_id ?? funnel}
        funnelStepId={published.funnel_step_id ?? ''}
      />
      <Component
        content={published.content}
        speakers={speakersById(published.speakers)}
        funnelId={funnel}
        enabledSections={published.enabled_sections ?? undefined}
        palette={published.palette}
      />
    </>
  );
}
