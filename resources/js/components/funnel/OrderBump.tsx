import type { OrderBumpData } from '@/types/funnel'

interface Props {
  bump: OrderBumpData
  checked: boolean
  onToggle: (id: string, checked: boolean) => void
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

export default function OrderBump({ bump, checked, onToggle }: Props) {
  return (
    <div
      className="rounded-xl overflow-hidden transition-all"
      style={{
        border: `2px dashed ${checked ? 'var(--theme-primary)' : '#d1d5db'}`,
        backgroundColor: checked ? 'rgba(79,70,229,0.03)' : 'transparent',
      }}
    >
      {/* Header */}
      <label
        className="flex items-center gap-3 px-4 py-3.5 cursor-pointer"
        style={{ backgroundColor: checked ? 'rgba(79,70,229,0.06)' : '#f9fafb' }}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onToggle(bump.id, e.target.checked)}
          className="w-5 h-5 rounded accent-[var(--theme-primary)]"
        />
        <span className="animate-bounce-x text-orange-500 font-bold text-lg">▶</span>
        <span className="font-semibold flex-1 text-sm" style={{ color: 'var(--theme-text)' }}>
          {bump.checkbox_label ?? bump.headline ?? 'Add to order'}
        </span>
        <div className="text-right">
          <span className="font-bold text-base" style={{ color: 'var(--theme-primary)' }}>
            {formatPrice(bump.price_cents)}
          </span>
          {bump.compare_at_cents && (
            <>
              {' '}
              <span className="text-sm text-red-400 line-through">{formatPrice(bump.compare_at_cents)}</span>
            </>
          )}
        </div>
      </label>

      {/* Content */}
      {(bump.description || bump.bullets.length > 0 || bump.image_url) && (
        <div className="px-4 pb-4 pt-2 flex gap-4">
          {bump.image_url && (
            <img src={bump.image_url} alt="" className="w-28 h-28 rounded-xl object-cover flex-shrink-0 border border-gray-100" />
          )}
          <div className="min-w-0">
            {bump.description && <p className="text-sm text-gray-600 mb-2 leading-relaxed">{bump.description}</p>}
            {bump.bullets.length > 0 && (
              <ul className="text-sm text-gray-600 space-y-1.5">
                {bump.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
            {bump.compare_at_cents && bump.compare_at_cents > bump.price_cents && (
              <div
                className="inline-block mt-2 text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: '#ecfdf5', color: '#059669' }}
              >
                Save {formatPrice(bump.compare_at_cents - bump.price_cents)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
