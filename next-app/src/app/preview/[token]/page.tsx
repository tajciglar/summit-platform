import { notFound } from 'next/navigation';
import { fetchDraft, speakersById } from '@/lib/api/laravel';
import { getTemplate } from '@/templates/registry';

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

  const parsed = template.schema.safeParse(draft.content);
  if (!parsed.success) {
    return (
      <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
        <h1>Schema validation failed</h1>
        <p>The draft&apos;s content does not match the template&apos;s current schema.</p>
        <pre style={{ background: '#f3f4f6', padding: 16, overflow: 'auto' }}>
          {JSON.stringify(parsed.error.issues, null, 2)}
        </pre>
      </div>
    );
  }

  const speakers = speakersById(draft.speakers);
  const Component = template.Component;
  return <Component content={parsed.data} speakers={speakers} funnelId={draft.funnel_id} />;
}
