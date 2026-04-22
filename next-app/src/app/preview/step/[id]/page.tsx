import type { ComponentType } from 'react';
import { notFound } from 'next/navigation';
import { fetchStepPreview, speakersById } from '@/lib/api/laravel';
import { getTemplate } from '@/templates/registry';

export const dynamic = 'force-dynamic';

export default async function StepPreviewPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const preview = await fetchStepPreview(id);
  if (!preview) notFound();

  const template = getTemplate(preview.template_key);
  if (!template) {
    return (
      <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
        <h1>Template not found</h1>
        <p>Template &quot;{preview.template_key}&quot; no longer exists.</p>
      </div>
    );
  }

  // Skip strict schema parsing. Sales-page previews only carry sales-section
  // content and would fail validation of the required optin sections; the
  // renderer gates each section on `enabled_sections` so absent sections
  // are simply skipped.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Component = template.Component as ComponentType<any>;
  return (
    <Component
      content={preview.content}
      speakers={speakersById(preview.speakers)}
      funnelId={preview.funnel_id ?? ''}
      enabledSections={preview.enabled_sections ?? undefined}
      palette={preview.palette}
      wpCheckoutRedirectUrl={preview.wp_checkout_redirect_url}
    />
  );
}
