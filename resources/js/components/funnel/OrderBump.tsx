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
      className="border-2 border-dashed rounded-lg overflow-hidden transition-colors"
      style={{ borderColor: checked ? 'var(--theme-primary)' : '#d1d5db' }}
    >
      {/* Header */}
      <label
        className="flex items-center gap-3 px-4 py-3 cursor-pointer"
        style={{ backgroundColor: checked ? 'rgba(79,70,229,0.06)' : '#f9fafb' }}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onToggle(bump.id, e.target.checked)}
          className="w-5 h-5 rounded"
        />
        <span className="animate-bounce-x text-orange-500 font-bold">▶</span>
        <span className="font-medium flex-1" style={{ color: 'var(--theme-text)' }}>
          {bump.checkbox_label ?? bump.headline ?? 'Add to order'}
        </span>
        <span className="font-bold" style={{ color: 'var(--theme-primary)' }}>
          {formatPrice(bump.price_cents)}
        </span>
        {bump.compare_at_cents && (
          <span className="text-sm text-gray-400 line-through">{formatPrice(bump.compare_at_cents)}</span>
        )}
      </label>

      {/* Content */}
      {(bump.description || bump.bullets.length > 0 || bump.image_url) && (
        <div className="px-4 pb-4 flex gap-4">
          {bump.image_url && (
            <img src={bump.image_url} alt="" className="w-24 h-24 rounded-lg object-cover flex-shrink-0" />
          )}
          <div>
            {bump.description && <p className="text-sm text-gray-600 mb-2">{bump.description}</p>}
            {bump.bullets.length > 0 && (
              <ul className="text-sm text-gray-600 space-y-1">
                {bump.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
