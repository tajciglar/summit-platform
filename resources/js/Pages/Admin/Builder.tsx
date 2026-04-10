import { Head } from '@inertiajs/react'
import { useCallback, useEffect } from 'react'
import { DndContext, DragOverlay, closestCenter, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import type { BuilderPageProps } from '@/types/builder'
import { blocksToBuilderBlocks, useBuilderStore } from '@/components/builder/useBuilderStore'
import BuilderProvider from '@/components/builder/BuilderProvider'
import BuilderToolbar from '@/components/builder/BuilderToolbar'
import BuilderLayout from '@/components/builder/BuilderLayout'
import { useAutoSave } from '@/components/builder/useAutoSave'

export default function Builder({ step, funnel, summit, theme, blocks, blockSchemas, blockTypes }: BuilderPageProps) {
  const initialBlocks = blocksToBuilderBlocks(blocks)
  const [state, dispatch] = useBuilderStore(initialBlocks)

  const onSaved = useCallback(() => dispatch({ type: 'MARK_SAVED' }), [dispatch])
  const { saveStatus, saveNow } = useAutoSave(step.id, state.blocks, state.isDirty, onSaved)

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault()
        dispatch({ type: 'UNDO' })
      }
      if ((e.key === 'y' && (e.ctrlKey || e.metaKey)) || (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey)) {
        e.preventDefault()
        dispatch({ type: 'REDO' })
      }
      if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        saveNow()
      }
      if (e.key === 'Delete' && state.selectedBlockId) {
        dispatch({ type: 'REMOVE_BLOCK', blockId: state.selectedBlockId })
      }
      if (e.key === 'Escape') {
        dispatch({ type: 'SELECT_BLOCK', blockId: null })
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [dispatch, saveNow, state.selectedBlockId])

  // Unsaved changes warning
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (state.isDirty) {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [state.isDirty])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    // Dragging from palette → canvas
    if (active.data.current?.type === 'palette') {
      const blockType = active.data.current.blockType as string
      const overIndex = state.blocks.findIndex((b) => b.id === over.id)
      dispatch({
        type: 'ADD_BLOCK',
        blockType,
        index: overIndex >= 0 ? overIndex : undefined,
      })
      return
    }

    // Reordering within canvas
    if (active.id !== over.id) {
      const oldIndex = state.blocks.findIndex((b) => b.id === active.id)
      const newIndex = state.blocks.findIndex((b) => b.id === over.id)
      if (oldIndex >= 0 && newIndex >= 0) {
        dispatch({ type: 'MOVE_BLOCK', fromIndex: oldIndex, toIndex: newIndex })
      }
    }
  }

  return (
    <>
      <Head title={`Builder — ${step.name}`} />

      {/* Mobile gate — builder requires desktop viewport */}
      <div className="lg:hidden flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-950 px-6 text-center">
        <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Desktop Required</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
          The page builder needs a wider screen. Please open this page on a desktop or laptop.
        </p>
        <a
          href={`/admin/funnel-steps/${step.id}/edit`}
          className="mt-6 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 dark:text-blue-400 dark:border-blue-700 dark:hover:bg-blue-900/20"
        >
          Edit step settings instead
        </a>
      </div>

      <BuilderProvider
        state={state}
        dispatch={dispatch}
        blockSchemas={blockSchemas}
        blockTypes={blockTypes}
        stepId={step.id}
      >
        <div className="hidden lg:flex h-screen flex-col bg-gray-50 dark:bg-gray-950">
          <BuilderToolbar
            saveStatus={saveStatus}
            onSave={saveNow}
            funnelId={funnel.id}
            funnelName={funnel.name}
            stepName={step.name}
            previewUrl={`/${summit.slug}/${funnel.slug}/${step.slug}?preview=1`}
          />
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <BuilderLayout theme={theme as Record<string, unknown>} />
          </DndContext>
        </div>
      </BuilderProvider>
    </>
  )
}
