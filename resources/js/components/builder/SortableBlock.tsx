import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { BuilderBlock } from '@/types/builder'
import { useBuilder } from './BuilderProvider'

interface Props {
  block: BuilderBlock
  children: React.ReactNode
}

export default function SortableBlock({ block, children }: Props) {
  const { state, dispatch } = useBuilder()
  const isSelected = state.selectedBlockId === block.id

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative ${isDragging ? 'z-50' : ''}`}
      onClick={(e) => {
        e.stopPropagation()
        dispatch({ type: 'SELECT_BLOCK', blockId: block.id })
      }}
    >
      {/* Selection ring */}
      {isSelected && (
        <div className="absolute inset-0 ring-2 ring-blue-500 ring-offset-1 rounded-lg pointer-events-none z-10" />
      )}

      {/* Left-side drag handle — always visible on hover, pinned on select */}
      <div
        className={`absolute -left-10 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-0.5
          ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}
      >
        <button
          {...listeners}
          {...attributes}
          className="flex items-center justify-center w-7 h-10 rounded-md bg-gray-800 text-white shadow-lg cursor-grab active:cursor-grabbing hover:bg-gray-700 transition-colors"
          title="Drag to reorder"
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="5" cy="3" r="1.5" />
            <circle cx="11" cy="3" r="1.5" />
            <circle cx="5" cy="8" r="1.5" />
            <circle cx="11" cy="8" r="1.5" />
            <circle cx="5" cy="13" r="1.5" />
            <circle cx="11" cy="13" r="1.5" />
          </svg>
        </button>
      </div>

      {/* Top-right action buttons */}
      <div
        className={`absolute -top-3 right-2 z-20 flex items-center gap-1
          ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}
      >
        <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white bg-gray-800 rounded-md shadow-md">
          {block.type.replace(/_/g, ' ')}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); dispatch({ type: 'DUPLICATE_BLOCK', blockId: block.id }) }}
          className="flex items-center justify-center w-6 h-6 rounded-md bg-gray-800 text-white shadow-md hover:bg-blue-600 transition-colors"
          title="Duplicate"
          aria-label="Duplicate block"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); dispatch({ type: 'REMOVE_BLOCK', blockId: block.id }) }}
          className="flex items-center justify-center w-6 h-6 rounded-md bg-gray-800 text-white shadow-md hover:bg-red-600 transition-colors"
          title="Delete"
          aria-label="Delete block"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Block content — interactive, not pointer-events-none */}
      <div className="relative">
        {children}
      </div>
    </div>
  )
}
