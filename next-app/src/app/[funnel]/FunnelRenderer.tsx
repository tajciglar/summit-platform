import type { ComponentType } from 'react';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { fetchByHost, speakersById } from '@/lib/api/laravel';
import { getTemplate } from '@/templates/registry';
import { PageViewTracker } from '@/lib/analytics/PageViewTracker';
import { MetaPixel } from '@/lib/analytics/MetaPixel';
import { SalesCountdownBar } from '@/components/SalesCountdownBar';
import { resolveCheckoutHref } from '@/templates/lib/checkout-href';

/**
 * Shared render path for the host-based funnel route. Both `/{funnel}` and
 * `/{funnel}/{step}` funnel here — step is optional and defaults to the
 * funnel's optin step on the Laravel side.
 *
 * Host detection order:
 *   1. x-forwarded-host   (Vercel / any reverse proxy)
 *   2. host               (direct hit)
 *
 * For localhost the resolver is expected to 404 unless a matching local
 * hostname exists in the `domains` table — intentional, because domain
 * routing is the whole point. Use `/preview/step/:id` for in-editor live
 * preview instead.
 */
export async function FunnelRenderer({
  funnelSlug,
  stepSlug,
}: {
  funnelSlug: string;
  stepSlug?: string;
}) {
  const h = await headers();
  const host = (h.get('x-forwarded-host') ?? h.get('host') ?? '').split(',')[0].trim();
  if (!host) notFound();

  const data = await fetchByHost(host, funnelSlug, stepSlug);
  if (!data) notFound();

  const template = getTemplate(data.template_key);
  if (!template) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Component = template.Component as ComponentType<any>;
  const isSales = data.step_type === 'sales_page';

  return (
    <>
      <MetaPixel pixelId={data.meta_pixel_id} />
      <PageViewTracker
        pageType={isSales ? 'sales' : 'optin'}
        summitId={data.summit_id ?? ''}
        funnelId={data.funnel_id ?? ''}
        funnelStepId={data.funnel_step_id ?? ''}
      />
      {isSales && <SalesCountdownBar checkoutHref={resolveCheckoutHref(data.wp_checkout_redirect_url)} />}
      <Component
        content={data.content}
        speakers={speakersById(data.speakers)}
        funnelId={data.funnel_id ?? ''}
        enabledSections={data.enabled_sections ?? undefined}
        tokens={data.tokens ?? undefined}
        sections={data.sections ?? undefined}
        wpCheckoutRedirectUrl={data.wp_checkout_redirect_url}
        wpThankyouRedirectUrl={data.wp_thankyou_redirect_url}
      />
    </>
  );
}
