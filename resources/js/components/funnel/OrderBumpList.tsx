import { useState, useCallback } from 'react'
import OrderBump from './OrderBump'
import type { OrderBumpData } from '@/types/funnel'

interface Props {
  bumps: OrderBumpData[]
  onSelectionChange: (selectedIds: string[], bumpsTotal: number) => void
}

export default function OrderBumpList({ bumps, onSelectionChange }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const handleToggle = useCallback(
    (id: string, checked: boolean) => {
      const next = checked ? [...selectedIds, id] : selectedIds.filter((s) => s !== id)
      setSelectedIds(next)

      const total = next.reduce((sum, bumpId) => {
        const bump = bumps.find((b) => b.id === bumpId)
        return sum + (bump?.price_cents ?? 0)
      }, 0)

      onSelectionChange(next, total)
    },
    [selectedIds, bumps, onSelectionChange],
  )

  if (bumps.length === 0) return null

  return (
    <div className="space-y-3 my-6">
      {bumps.map((bump) => (
        <OrderBump
          key={bump.id}
          bump={bump}
          checked={selectedIds.includes(bump.id)}
          onToggle={handleToggle}
        />
      ))}
    </div>
  )
}
