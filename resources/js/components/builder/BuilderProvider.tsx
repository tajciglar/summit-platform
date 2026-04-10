import { createContext, useContext, type Dispatch, type ReactNode } from 'react'
import type { BuilderAction, BuilderBlock, BuilderState, BlockSchemas, BlockTypeInfo } from '@/types/builder'

interface BuilderContextValue {
  state: BuilderState
  dispatch: Dispatch<BuilderAction>
  blockSchemas: BlockSchemas
  blockTypes: BlockTypeInfo[]
  stepId: string
}

const BuilderContext = createContext<BuilderContextValue | null>(null)

export function useBuilder() {
  const ctx = useContext(BuilderContext)
  if (!ctx) throw new Error('useBuilder must be used within BuilderProvider')
  return ctx
}

interface Props {
  state: BuilderState
  dispatch: Dispatch<BuilderAction>
  blockSchemas: BlockSchemas
  blockTypes: BlockTypeInfo[]
  stepId: string
  children: ReactNode
}

export default function BuilderProvider({ state, dispatch, blockSchemas, blockTypes, stepId, children }: Props) {
  return (
    <BuilderContext.Provider value={{ state, dispatch, blockSchemas, blockTypes, stepId }}>
      {children}
    </BuilderContext.Provider>
  )
}
