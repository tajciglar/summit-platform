import { useBuilder } from './BuilderProvider'
import InspectorField from './InspectorField'
import { useCallback } from 'react'

export default function SettingsInspector() {
  const { state, dispatch, blockSchemas } = useBuilder()

  const selectedBlock = state.blocks.find((b) => b.id === state.selectedBlockId)

  const handleFieldChange = useCallback(
    (name: string, value: unknown) => {
      if (!selectedBlock) return
      dispatch({
        type: 'UPDATE_BLOCK_DATA',
        blockId: selectedBlock.id,
        data: { [name]: value },
      })
    },
    [selectedBlock, dispatch]
  )

  if (!selectedBlock) {
    return (
      <div className="w-80 shrink-0 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
        <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 px-6">
          <svg className="w-10 h-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          <p className="text-sm font-medium text-center">Select a block to edit its settings</p>
        </div>
      </div>
    )
  }

  const schema = blockSchemas[selectedBlock.type] ?? []
  const blockLabel = selectedBlock.type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <div className="w-80 shrink-0 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{blockLabel}</h3>
        <p className="text-xs text-gray-400 mt-0.5">Edit block settings below</p>
      </div>

      <div className="p-4 space-y-4">
        {schema.map((field) => (
          <InspectorField
            key={field.name}
            field={field}
            value={selectedBlock.data[field.name]}
            onChange={handleFieldChange}
          />
        ))}

        {schema.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">
            This block has no configurable settings.
          </p>
        )}
      </div>
    </div>
  )
}
