import type { ComponentType } from 'react';
import { notFound } from 'next/navigation';
import { fetchPublished, speakersById } from '@/lib/api/laravel';
import { getTemplate } from '@/templates/registry';
import { PageViewTracker } from '@/lib/analytics/PageViewTracker';
import { CheckoutTrackingProvider } from '@/lib/analytics/CheckoutTrackingContext';

export const revalidate = 60;

export default async function SalesPage({
  params,
}: { params: Promise<{ funnel: string }> }) {
  const { funnel } = await params;
  const published = await fetchPublished(funnel, 'sales_page');
  if (!published) notFound();

  const template = getTemplate(published.template_key);
  if (!template) notFound();

  // Sales pages share the template family's schema with optin, but they
  // only carry sales-section content. Skip strict schema parsing — the
  // renderer gates each section on `enabled_sections` and sales-only
  // content would fail validation of the required optin sections.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Component = template.Component as ComponentType<any>;
  return (
    <>
      <PageViewTracker
        pageType="sales"
        summitId={published.summit_id ?? ''}
        funnelId={published.funnel_id ?? funnel}
        funnelStepId={published.funnel_step_id ?? ''}
      />
      <CheckoutTrackingProvider
        summitId={published.summit_id ?? ''}
        funnelId={published.funnel_id ?? funnel}
        funnelStepId={published.funnel_step_id ?? ''}
      >
        <Component
          content={published.content}
          speakers={speakersById(published.speakers)}
          funnelId={funnel}
          enabledSections={published.enabled_sections ?? undefined}
          palette={published.palette}
          wpCheckoutRedirectUrl={published.wp_checkout_redirect_url}
        />
      </CheckoutTrackingProvider>
    </>
  );
}
