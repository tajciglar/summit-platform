import StandardCheckout from './StandardCheckout'
import type { CheckoutPageProps } from '@/types/funnel'

export default function SplitCheckout(props: CheckoutPageProps) {
  const { content, product, step } = props

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="lg:sticky lg:top-8">
          {content.hero_image && (
            <img src={content.hero_image} alt="" className="w-full rounded-xl shadow-lg mb-6" loading="lazy" />
          )}
          <h2
            className="text-3xl font-bold mb-2"
            style={{ fontFamily: 'var(--font-heading), sans-serif', color: 'var(--theme-secondary)' }}
          >
            {content.headline ?? step.name}
          </h2>
          {content.subheadline && (
            <p className="text-lg mb-4" style={{ color: 'var(--theme-muted)' }}>{content.subheadline}</p>
          )}
          {product && (
            <div className="text-2xl font-bold" style={{ color: 'var(--theme-primary)' }}>
              ${(product.price_cents / 100).toFixed(2)}
              {product.compare_at_cents && (
                <span className="ml-3 text-lg font-normal line-through" style={{ color: 'var(--theme-muted)' }}>
                  ${(product.compare_at_cents / 100).toFixed(2)}
                </span>
              )}
            </div>
          )}
        </div>

        <StandardCheckout {...props} />
      </div>
    </div>
  )
}
