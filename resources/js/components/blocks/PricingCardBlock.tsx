import type { PricingCardBlockData } from '@/types/blocks'

export default function PricingCardBlock({ data, product }: { data: PricingCardBlockData; product?: { name: string; price_cents: number; compare_at_cents?: number | null } }) {
  const features = data.features ?? []

  return (
    <section className="py-12 px-6">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-8 text-center" style={{ backgroundColor: 'var(--theme-primary)' }}>
          {data.heading && <h3 className="text-xl font-bold text-white mb-1">{data.heading}</h3>}
          {data.subheading && <p className="text-white/80 text-sm">{data.subheading}</p>}
          {product && (
            <div className="mt-4">
              <span className="text-4xl font-extrabold text-white">${(product.price_cents / 100).toFixed(0)}</span>
              {product.compare_at_cents && (
                <span className="ml-2 text-lg text-white/60 line-through">${(product.compare_at_cents / 100).toFixed(0)}</span>
              )}
            </div>
          )}
        </div>
        {features.length > 0 && (
          <div className="p-8">
            <ul className="space-y-3">
              {features.map((f, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className={f.included ? 'text-green-500' : 'text-gray-300'}>{f.included ? '✓' : '✕'}</span>
                  <span className={f.included ? 'text-gray-700' : 'text-gray-400'}>{f.text}</span>
                </li>
              ))}
            </ul>
            {data.cta_text && (
              <button
                className="w-full mt-6 py-3 rounded-xl text-white font-bold text-lg hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--theme-primary)' }}
              >
                {data.cta_text}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
