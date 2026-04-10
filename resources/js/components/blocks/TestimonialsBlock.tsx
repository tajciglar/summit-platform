import type { TestimonialsBlockData } from '@/types/blocks'

export default function TestimonialsBlock({ data }: { data: TestimonialsBlockData }) {
  const items = data.items ?? []
  if (items.length === 0) return null

  return (
    <section className="py-16 px-6" style={{ backgroundColor: 'var(--theme-surface-alt)' }}>
      <div className="max-w-5xl mx-auto">
        {data.heading && (
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12" style={{ fontFamily: 'var(--font-heading), sans-serif', color: 'var(--theme-secondary)' }}>
            {data.heading}
          </h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <figure
              key={i}
              className="rounded-2xl p-6 shadow-sm"
              style={{
                backgroundColor: 'var(--theme-surface)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--theme-border)',
              }}
            >
              <blockquote className="italic mb-4 leading-relaxed" style={{ color: 'var(--theme-muted)' }}>
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <figcaption className="flex items-center gap-3">
                {item.photo_url ? (
                  <img src={item.photo_url} alt={`Photo of ${item.name}`} className="w-10 h-10 rounded-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: 'var(--theme-primary)' }}>
                    {item.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--theme-secondary)' }}>{item.name}</p>
                  {item.title && <p className="text-xs" style={{ color: 'var(--theme-muted)' }}>{item.title}</p>}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
