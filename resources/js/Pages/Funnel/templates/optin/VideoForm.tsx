import type { OptinPageProps } from '@/types/funnel'

export default function VideoForm({ step, content }: OptinPageProps) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Video side */}
        <div>
          {content.video_url ? (
            <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
              <iframe
                src={content.video_url}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="aspect-video rounded-xl bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400">Video placeholder</span>
            </div>
          )}
        </div>

        {/* Form side */}
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
            <button
              className="mt-6 w-full px-8 py-3 rounded-lg text-white font-semibold text-lg shadow-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            >
              {content.cta_text}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
