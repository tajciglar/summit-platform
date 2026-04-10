import { sanitizeHtml } from '@/lib/sanitize'
import SpeakerGrid from '@/components/funnel/SpeakerGrid'
import type { OptinPageProps } from '@/types/funnel'

export default function HeroSpeakers({ step, content, speakers, summit }: OptinPageProps) {
  return (
    <>
      <section
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, var(--theme-secondary) 0%, var(--theme-primary) 100%)`,
        }}
      >
        {content.hero_image && (
          <div className="absolute inset-0 opacity-20">
            <img src={content.hero_image} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="relative max-w-4xl mx-auto px-6 py-20 md:py-28 text-center">
          {content.subheadline && (
            <p
              className="text-sm md:text-base font-semibold uppercase tracking-[0.2em] mb-4"
              style={{ color: 'var(--theme-accent)' }}
            >
              {content.subheadline}
            </p>
          )}
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6"
            style={{ fontFamily: 'var(--font-heading), sans-serif' }}
          >
            {content.headline ?? step.name}
          </h1>
          {content.body && (
            <div
              className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8 prose prose-invert"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(content.body) }}
            />
          )}
          {content.cta_text && (
            <a
              href="#register"
              className="inline-flex items-center px-10 py-4 rounded-lg text-lg font-bold shadow-lg hover:opacity-90 active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              style={{
                backgroundColor: 'var(--theme-accent)',
                color: 'var(--theme-secondary)',
              }}
            >
              {content.cta_text}
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          )}
        </div>
      </section>

      {speakers.length > 0 && (
        <section className="py-16 md:py-24" style={{ backgroundColor: 'var(--theme-bg)' }}>
          <SpeakerGrid speakers={speakers} />
        </section>
      )}

      {content.cta_text && (
        <section
          className="py-16 text-center"
          style={{ backgroundColor: 'var(--theme-secondary)' }}
        >
          <div className="max-w-2xl mx-auto px-6">
            <h2
              className="text-2xl md:text-3xl font-bold text-white mb-6"
              style={{ fontFamily: 'var(--font-heading), sans-serif' }}
            >
              Ready to join {summit.title}?
            </h2>
            <a
              href="#register"
              className="inline-flex items-center px-10 py-4 rounded-lg text-lg font-bold shadow-lg hover:opacity-90 active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              style={{
                backgroundColor: 'var(--theme-accent)',
                color: 'var(--theme-secondary)',
              }}
            >
              {content.cta_text}
            </a>
          </div>
        </section>
      )}
    </>
  )
}
