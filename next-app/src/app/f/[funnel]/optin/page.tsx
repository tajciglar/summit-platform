import { notFound } from 'next/navigation';
import { fetchPublished, speakersById } from '@/lib/api/laravel';
import { getTemplate } from '@/templates/registry';

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
    <Component
      content={parsed.data}
      speakers={speakersById(published.speakers)}
      funnelId={funnel}
      enabledSections={published.enabled_sections ?? undefined}
      palette={published.palette}
      wpCheckoutRedirectUrl={published.wp_checkout_redirect_url}
    />
  );
}
