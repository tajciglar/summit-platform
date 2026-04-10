import type { OptinPageProps } from '@/types/funnel'

export default function VideoForm({ step, content }: OptinPageProps) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          {content.video_url ? (
            <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
              <iframe
                src={content.video_url}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={content.headline ?? step.name}
                loading="lazy"
              />
            </div>
          ) : (
            <div className="aspect-video rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--theme-surface-alt)' }}>
              <span style={{ color: 'var(--theme-muted)' }}>Video placeholder</span>
            </div>
          )}
        </div>

        <div>
          {content.subheadline && (
            <p className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: 'var(--theme-primary)' }}>
              {content.subheadline}
            </p>
          )}
          <h1
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ fontFamily: 'var(--font-heading), sans-serif', color: 'var(--theme-secondary)' }}
          >
            {content.headline ?? step.name}
          </h1>
          {content.cta_text && (
            <a
              href="#register"
              className="mt-6 inline-block w-full px-8 py-3 rounded-lg text-white font-semibold text-lg text-center shadow-lg hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-offset-2"
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
    </div>
  )
}
