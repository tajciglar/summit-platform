import { sanitizeHtml } from '@/lib/sanitize'
import type { HeroBlockData } from '@/types/blocks'

export default function HeroBlock({ data }: { data: HeroBlockData }) {
  const style = data.style ?? 'gradient'

  const bgStyle =
    style === 'gradient'
      ? { background: 'linear-gradient(135deg, var(--theme-secondary) 0%, var(--theme-primary) 100%)' }
      : style === 'solid'
        ? { backgroundColor: 'var(--theme-secondary)' }
        : {}

  return (
    <section className="relative overflow-hidden" style={bgStyle}>
      {data.background_image && (
        <div className="absolute inset-0" style={{ opacity: style === 'image_overlay' ? 0.3 : 0.15 }}>
          <img src={data.background_image} alt="" className="w-full h-full object-cover" loading="lazy" />
        </div>
      )}
      <div className="relative max-w-4xl mx-auto px-6 py-20 md:py-28 text-center">
        {data.subheadline && (
          <p className="text-sm md:text-base font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--theme-accent)' }}>
            {data.subheadline}
          </p>
        )}
        {data.headline && (
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6" style={{ fontFamily: 'var(--font-heading), sans-serif' }}>
            {data.headline}
          </h1>
        )}
        {data.body && (
          <div
            className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8 prose prose-invert"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.body) }}
          />
        )}
        {data.cta_text && (
          <a
            href={data.cta_url ?? '#register'}
            className="inline-flex items-center px-10 py-4 rounded-lg text-lg font-bold shadow-lg hover:opacity-90 active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            style={{ backgroundColor: 'var(--theme-accent)', color: 'var(--theme-secondary)' }}
          >
            {data.cta_text}
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        )}
      </div>
    </section>
  )
}
