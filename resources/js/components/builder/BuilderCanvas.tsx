import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { useBuilder } from './BuilderProvider'
import SortableBlock from './SortableBlock'
import BlockRenderer from '@/components/blocks/BlockRenderer'
import type { BuilderBlock } from '@/types/builder'

export default function BuilderCanvas() {
  const { state, dispatch } = useBuilder()

  const { setNodeRef } = useDroppable({ id: 'canvas' })

  return (
    <div
      className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-950"
      onClick={() => dispatch({ type: 'SELECT_BLOCK', blockId: null })}
    >
      <div className="max-w-4xl mx-auto py-8 px-12">
        <div
          ref={setNodeRef}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-sm min-h-[60vh]"
        >
          {state.blocks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-gray-400 dark:text-gray-500 px-8">
              <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
                <svg className="w-10 h-10 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              </div>
              <p className="text-base font-medium mb-1">Build your page</p>
              <p className="text-sm text-center max-w-xs leading-relaxed">
                Drag blocks from the left panel onto this canvas, or click a block type to add it.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs text-gray-300 dark:text-gray-600">
                <kbd className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">Ctrl+Z</kbd>
                <span>undo</span>
                <span className="mx-1">&middot;</span>
                <kbd className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">Ctrl+S</kbd>
                <span>save</span>
                <span className="mx-1">&middot;</span>
                <kbd className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">Del</kbd>
                <span>remove</span>
              </div>
            </div>
          ) : (
            <SortableContext items={state.blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
              {state.blocks.map((block) => (
                <SortableBlock key={block.id} block={block}>
                  <SingleBlockPreview block={block} />
                </SortableBlock>
              ))}
            </SortableContext>
          )}
        </div>
        <div className="h-16" />
      </div>
    </div>
  )
}

function SingleBlockPreview({ block }: { block: BuilderBlock }) {
  return <BlockRenderer blocks={[{ type: block.type, data: block.data }]} />
}
