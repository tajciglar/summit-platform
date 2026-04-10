import { sanitizeHtml } from '@/lib/sanitize'
import type { StepContent } from '@/types/funnel'

interface Props {
  content: StepContent
  stepName: string
}

export default function HeroSection({ content, stepName }: Props) {
  return (
    <div className="flex items-center justify-center py-16 md:py-20 px-6">
      <div className="max-w-2xl w-full text-center">
        {content.subheadline && (
          <p
            className="text-sm font-semibold uppercase tracking-[0.15em] mb-3"
            style={{ color: 'var(--theme-primary)' }}
          >
            {content.subheadline}
          </p>
        )}
        <h1
          className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight"
          style={{ fontFamily: 'var(--font-heading), sans-serif', color: 'var(--theme-secondary)' }}
        >
          {content.headline ?? stepName}
        </h1>
        {content.body && (
          <div
            className="text-lg mt-4 prose prose-lg mx-auto"
            style={{ color: 'var(--theme-muted)' }}
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(content.body) }}
          />
        )}
        {content.cta_text && (
          <a
            href="#register"
            className="mt-8 inline-block px-10 py-4 rounded-lg text-white font-bold text-lg shadow-lg hover:opacity-90 active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              backgroundColor: 'var(--theme-primary)',
              '--tw-ring-color': 'var(--theme-primary)',
            } as React.CSSProperties}
          >
            {content.cta_text}
          </a>
        )}
      </div>
    </div>
  )
}
