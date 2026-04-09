import type { TestimonialsBlockData } from '@/types/blocks'

export default function TestimonialsBlock({ data }: { data: TestimonialsBlockData }) {
  const items = data.items ?? []
  if (items.length === 0) return null

  return (
    <section className="py-16 px-6" style={{ backgroundColor: '#f9fafb' }}>
      <div className="max-w-5xl mx-auto">
        {data.heading && (
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12" style={{ fontFamily: 'var(--font-heading), sans-serif', color: 'var(--theme-secondary)' }}>
            {data.heading}
          </h2>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <p className="text-gray-600 italic mb-4 leading-relaxed">"{item.quote}"</p>
              <div className="flex items-center gap-3">
                {item.photo_url ? (
                  <img src={item.photo_url} alt={item.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: 'var(--theme-primary)' }}>
                    {item.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--theme-secondary)' }}>{item.name}</p>
                  {item.title && <p className="text-xs text-gray-500">{item.title}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
