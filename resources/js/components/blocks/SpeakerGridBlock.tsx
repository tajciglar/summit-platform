import type { SpeakerGridBlockData } from '@/types/blocks'
import type { Speaker } from '@/types/funnel'

export default function SpeakerGridBlock({ data, speakers = [] }: { data: SpeakerGridBlockData; speakers?: Speaker[] }) {
  const cols = data.columns ?? '3'
  const filtered = data.show_featured_only ? speakers.filter((s) => s.is_featured) : speakers

  if (filtered.length === 0) return null

  const gridCols = { '2': 'sm:grid-cols-2', '3': 'sm:grid-cols-2 lg:grid-cols-3', '4': 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' }[cols]

  return (
    <section className="py-16 md:py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {data.heading && (
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2" style={{ fontFamily: 'var(--font-heading), sans-serif', color: 'var(--theme-secondary)' }}>
            {data.heading}
          </h2>
        )}
        {data.subheading && <p className="text-center mb-12 max-w-xl mx-auto" style={{ color: 'var(--theme-muted)' }}>{data.subheading}</p>}
        <div className={`grid grid-cols-1 ${gridCols} gap-6`}>
          {filtered.map((speaker) => (
            <div
              key={speaker.name}
              className="group rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 text-center"
              style={{
                backgroundColor: 'var(--theme-surface)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--theme-border)',
              }}
            >
              {speaker.photo_url ? (
                <img
                  src={speaker.photo_url}
                  alt={`Photo of ${speaker.name}`}
                  className="w-28 h-28 rounded-full mx-auto mb-4 object-cover ring-4 transition-all"
                  style={{ '--tw-ring-color': 'var(--theme-surface-alt)' } as React.CSSProperties}
                  loading="lazy"
                />
              ) : (
                <div className="w-28 h-28 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white" style={{ backgroundColor: 'var(--theme-primary)' }}>
                  {speaker.name.charAt(0)}
                </div>
              )}
              <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--theme-secondary)' }}>{speaker.name}</h3>
              {speaker.title && <p className="text-sm mb-2" style={{ color: 'var(--theme-muted)' }}>{speaker.title}</p>}
              {speaker.masterclass_title && (
                <p className="text-xs font-semibold uppercase tracking-wide mt-2 px-3 py-1 rounded-full inline-block text-white" style={{ backgroundColor: 'var(--theme-primary)', opacity: 0.9 }}>
                  {speaker.masterclass_title}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
