import type { ComponentType } from 'react';
import { notFound } from 'next/navigation';
import { fetchPublished, fetchCheckoutPrefill, speakersById } from '@/lib/api/laravel';
import { getTemplate } from '@/templates/registry';
import { PageViewTracker } from '@/lib/analytics/PageViewTracker';
import { CheckoutTrackingProvider } from '@/lib/analytics/CheckoutTrackingContext';
import { CheckoutPrefillProvider } from '@/lib/checkout-prefill-context';
import { SalesCountdownBar } from '@/components/SalesCountdownBar';
import { resolveCheckoutHref } from '@/templates/lib/checkout-href';

export const revalidate = 60;

export default async function SalesPage({
  params,
  searchParams,
}: {
  params: Promise<{ funnel: string }>;
  searchParams: Promise<{ p?: string }>;
}) {
  const { funnel } = await params;
  const { p } = await searchParams;
  const [published, prefill] = await Promise.all([
    fetchPublished(funnel, 'sales_page'),
    p ? fetchCheckoutPrefill(p) : Promise.resolve(null),
  ]);
  if (!published) notFound();

  const template = getTemplate(published.template_key);
  if (!template) notFound();

  // Sales pages share the template family's schema with optin, but they
  // only carry sales-section content. Skip strict schema parsing — the
  // renderer gates each section on `enabled_sections` and sales-only
  // content would fail validation of the required optin sections.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Component = template.Component as ComponentType<any>;
  const checkoutHref = resolveCheckoutHref(published.wp_checkout_redirect_url);

  return (
    <>
      <SalesCountdownBar checkoutHref={checkoutHref} />
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
        <CheckoutPrefillProvider
          email={prefill?.email ?? null}
          firstName={prefill?.first_name ?? null}
        >
          <Component
            content={published.content}
            speakers={speakersById(published.speakers)}
            funnelId={funnel}
            enabledSections={published.enabled_sections ?? undefined}
            wpCheckoutRedirectUrl={published.wp_checkout_redirect_url}
            wpThankyouRedirectUrl={published.wp_thankyou_redirect_url}
          />
        </CheckoutPrefillProvider>
      </CheckoutTrackingProvider>
    </>
  );
}
