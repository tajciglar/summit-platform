import { useCallback, useEffect, useRef, useState } from 'react'
import type { BuilderBlock } from '@/types/builder'
import { builderBlocksToBlocks } from './useBuilderStore'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function useAutoSave(stepId: string, blocks: BuilderBlock[], isDirty: boolean, onSaved: () => void) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const save = useCallback(async () => {
    setSaveStatus('saving')
    try {
      const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? ''
      const res = await fetch(`/admin/api/builder/${stepId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
          Accept: 'application/json',
        },
        body: JSON.stringify({ blocks: builderBlocksToBlocks(blocks) }),
      })

      if (!res.ok) throw new Error('Save failed')

      setSaveStatus('saved')
      onSaved()
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }, [stepId, blocks, onSaved])

  // Auto-save on dirty (debounced 3s)
  useEffect(() => {
    if (!isDirty) return

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(save, 3000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isDirty, blocks, save])

  return { saveStatus, saveNow: save }
}
