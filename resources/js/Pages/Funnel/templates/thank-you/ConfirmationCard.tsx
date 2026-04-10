import { sanitizeHtml } from '@/lib/sanitize'
import type { FunnelPageProps } from '@/types/funnel'

export default function ConfirmationCard({ step, content }: FunnelPageProps) {
  return (
    <div className="flex items-center justify-center py-16 md:py-24 px-4">
      <div
        className="max-w-lg w-full rounded-2xl shadow-lg p-8 md:p-10 text-center"
        style={{
          backgroundColor: 'var(--theme-surface)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'var(--theme-border)',
        }}
      >
        <div
          className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center shadow-md"
          style={{ backgroundColor: 'var(--theme-primary)' }}
          aria-hidden="true"
        >
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1
          className="text-2xl md:text-3xl font-extrabold mb-3"
          style={{ fontFamily: 'var(--font-heading), sans-serif', color: 'var(--theme-secondary)' }}
        >
          {content.headline ?? step.name}
        </h1>
        {content.subheadline && (
          <p className="text-lg mb-4" style={{ color: 'var(--theme-muted)' }}>{content.subheadline}</p>
        )}
        {content.body ? (
          <div className="prose mx-auto" style={{ color: 'var(--theme-muted)' }} dangerouslySetInnerHTML={{ __html: sanitizeHtml(content.body) }} />
        ) : (
          <p style={{ color: 'var(--theme-muted)' }}>
            You will receive a confirmation email shortly with all the details.
          </p>
        )}
        <div className="mt-8 pt-6 text-sm" style={{ borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: 'var(--theme-border)', color: 'var(--theme-muted)' }}>
          Check your inbox for next steps
        </div>
      </div>
    </div>
  )
}
