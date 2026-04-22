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

  const parsed = template.schema.safeParse(published.content);
  if (!parsed.success) notFound();

  const Component = template.Component;
  return (
    <>
      <PageViewTracker
        pageType="optin"
        summitId={published.summit_id ?? ''}
        funnelId={published.funnel_id ?? funnel}
        funnelStepId={published.funnel_step_id ?? ''}
      />
      <Component
        content={parsed.data}
        speakers={speakersById(published.speakers)}
        funnelId={funnel}
        enabledSections={published.enabled_sections ?? undefined}
        palette={published.palette}
      />
    </>
  );
}
