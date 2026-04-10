import { useBuilder } from './BuilderProvider'

interface Props {
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
  onSave: () => void
  funnelId: string
  funnelName: string
  stepName: string
  previewUrl: string
}

export default function BuilderToolbar({ saveStatus, onSave, funnelId, funnelName, stepName, previewUrl }: Props) {
  const { state, dispatch } = useBuilder()

  const statusLabel = {
    idle: state.isDirty ? 'Unsaved changes' : 'All changes saved',
    saving: 'Saving...',
    saved: 'Saved',
    error: 'Save failed',
  }[saveStatus]

  const statusColor = {
    idle: state.isDirty ? 'text-yellow-600' : 'text-green-500',
    saving: 'text-blue-500',
    saved: 'text-green-500',
    error: 'text-red-500',
  }[saveStatus]

  const statusDot = {
    idle: state.isDirty ? 'bg-yellow-500' : 'bg-green-500',
    saving: 'bg-blue-500 animate-pulse',
    saved: 'bg-green-500',
    error: 'bg-red-500',
  }[saveStatus]

  return (
    <div className="flex items-center justify-between h-14 px-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shrink-0">
      {/* Left: back + breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        <a
          href={`/admin/funnels/${funnelId}/edit`}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none rounded"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </a>
        <span className="text-gray-300 dark:text-gray-600 shrink-0">/</span>
        <span className="text-xs text-gray-400 dark:text-gray-500 truncate">{funnelName}</span>
        <span className="text-gray-300 dark:text-gray-600 shrink-0">/</span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{stepName}</span>
      </div>

      {/* Center: undo/redo */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => dispatch({ type: 'UNDO' })}
          disabled={state.past.length === 0}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Undo (Ctrl+Z)"
          aria-label="Undo"
        >
          <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
        </button>
        <button
          onClick={() => dispatch({ type: 'REDO' })}
          disabled={state.future.length === 0}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Redo (Ctrl+Y)"
          aria-label="Redo"
        >
          <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
          </svg>
        </button>
      </div>

      {/* Right: save status + actions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
          <span className={`text-xs ${statusColor}`}>{statusLabel}</span>
        </div>
        <button
          onClick={onSave}
          disabled={!state.isDirty}
          className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Save
        </button>
        <a
          href={previewUrl}
          target="_blank"
          rel="noopener"
          className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Preview
        </a>
      </div>
    </div>
  )
}
