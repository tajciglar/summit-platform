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

  const parsed = template.schema.safeParse(preview.content);
  if (!parsed.success) {
    return (
      <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
        <h1>Schema validation failed</h1>
        <p>The step&apos;s page_content does not match the template&apos;s current schema.</p>
        <pre style={{ background: '#f3f4f6', padding: 16, overflow: 'auto' }}>
          {JSON.stringify(parsed.error.issues, null, 2)}
        </pre>
      </div>
    );
  }

  const Component = template.Component;
  return (
    <Component
      content={parsed.data}
      speakers={speakersById(preview.speakers)}
      funnelId={preview.funnel_id ?? ''}
      enabledSections={preview.enabled_sections ?? undefined}
      palette={preview.palette}
    />
  );
}
