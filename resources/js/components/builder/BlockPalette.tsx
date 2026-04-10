import { useDraggable } from '@dnd-kit/core'
import { useBuilder } from './BuilderProvider'
import type { BlockTypeInfo } from '@/types/builder'

function PaletteItem({ blockType }: { blockType: BlockTypeInfo }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${blockType.value}`,
    data: { type: 'palette', blockType: blockType.value },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border border-gray-200 dark:border-gray-700
        cursor-grab hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors
        ${isDragging ? 'opacity-50 ring-2 ring-blue-400' : ''}`}
    >
      <span className="text-lg text-gray-500 dark:text-gray-400">
        {blockTypeIcon(blockType.value)}
      </span>
      <span className="text-[11px] text-center text-gray-600 dark:text-gray-400 leading-tight">
        {blockType.label}
      </span>
    </div>
  )
}

export default function BlockPalette() {
  const { blockTypes } = useBuilder()

  return (
    <div className="w-60 shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      <div className="p-3">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Blocks
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {blockTypes.map((bt) => (
            <PaletteItem key={bt.value} blockType={bt} />
          ))}
        </div>
      </div>
    </div>
  )
}

function blockTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    hero: '⭐',
    speaker_grid: '👥',
    video: '▶️',
    text: '📝',
    image: '🖼️',
    cta: '👆',
    testimonials: '💬',
    faq: '❓',
    countdown: '⏱️',
    pricing_card: '💰',
    divider: '➖',
    checkout_form: '💳',
    order_bumps: '➕',
    upsell_offer: '🎁',
  }
  return icons[type] ?? '📦'
}
