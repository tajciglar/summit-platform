import { notFound } from 'next/navigation';
import { fetchPublished, speakersById } from '@/lib/api/laravel';
import { getTemplate } from '@/templates/registry';

export const revalidate = 60;

export default async function SalesPage({
  params,
}: { params: Promise<{ funnel: string }> }) {
  const { funnel } = await params;
  const published = await fetchPublished(funnel, 'sales_page');
  if (!published) notFound();

  const template = getTemplate(published.template_key);
  if (!template) notFound();

  const parsed = template.schema.safeParse(published.content);
  if (!parsed.success) notFound();

  const Component = template.Component;
  return <Component content={parsed.data} speakers={speakersById(published.speakers)} funnelId={funnel} />;
}
