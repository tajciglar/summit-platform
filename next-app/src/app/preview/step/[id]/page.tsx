import { notFound } from 'next/navigation';
import { fetchStepPreview, speakersById } from '@/lib/api/laravel';
import { getTemplate } from '@/templates/registry';
import LivePreviewShell from './live-preview-shell';

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

  return (
    <LivePreviewShell
      templateKey={preview.template_key}
      stepType={preview.step_type}
      initialContent={preview.content}
      speakers={speakersById(preview.speakers)}
      funnelId={preview.funnel_id ?? ''}
      enabledSections={preview.enabled_sections ?? undefined}
      initialTokens={preview.tokens ?? null}
      initialSections={preview.sections ?? null}
      wpCheckoutRedirectUrl={preview.wp_checkout_redirect_url}
      wpThankyouRedirectUrl={preview.wp_thankyou_redirect_url}
    />
  );
}
