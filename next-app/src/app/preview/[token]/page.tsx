import type { ComponentType } from 'react';
import { notFound } from 'next/navigation';
import { fetchDraft, speakersById } from '@/lib/api/laravel';
import { getTemplate } from '@/templates/registry';
import { SalesCountdownBar } from '@/components/SalesCountdownBar';
import { resolveCheckoutHref } from '@/templates/lib/checkout-href';

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

  // Skip strict schema parsing. Sales-page drafts only carry sales-section
  // content and would fail validation of the required optin sections; the
  // renderer gates each section on `enabled_sections` so absent sections
  // are simply skipped.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Component = template.Component as ComponentType<any>;
  const isSales = draft.step_type === 'sales_page';

  return (
    <>
      {isSales && <SalesCountdownBar checkoutHref={resolveCheckoutHref(draft.wp_checkout_redirect_url)} />}
      <Component
        content={draft.content}
        speakers={speakersById(draft.speakers)}
        funnelId={draft.funnel_id}
        enabledSections={draft.enabled_sections ?? undefined}
        wpCheckoutRedirectUrl={draft.wp_checkout_redirect_url}
        wpThankyouRedirectUrl={draft.wp_thankyou_redirect_url}
      />
    </>
  );
}
