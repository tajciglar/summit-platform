import type { BlockData } from './blocks'

export interface FieldSchema {
  name: string
  type: 'text' | 'textarea' | 'richtext' | 'image' | 'select' | 'toggle' | 'repeater' | 'number'
  label: string
  required?: boolean
  maxLength?: number
  placeholder?: string
  default?: unknown
  options?: Array<{ value: string; label: string }>
  schema?: FieldSchema[] // for repeater
}

export type BlockSchemas = Record<string, FieldSchema[]>

export interface BlockTypeInfo {
  value: string
  label: string
  icon: string
}

export interface BuilderBlock extends BlockData {
  id: string // unique client-side ID for DnD
}

export interface BuilderState {
  blocks: BuilderBlock[]
  selectedBlockId: string | null
  past: BuilderBlock[][]
  future: BuilderBlock[][]
  isDirty: boolean
  lastSavedBlocks: string // JSON string for comparison
}

export type BuilderAction =
  | { type: 'ADD_BLOCK'; blockType: string; index?: number; defaultData?: Record<string, unknown> }
  | { type: 'REMOVE_BLOCK'; blockId: string }
  | { type: 'MOVE_BLOCK'; fromIndex: number; toIndex: number }
  | { type: 'UPDATE_BLOCK_DATA'; blockId: string; data: Record<string, unknown> }
  | { type: 'SELECT_BLOCK'; blockId: string | null }
  | { type: 'DUPLICATE_BLOCK'; blockId: string }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SET_BLOCKS'; blocks: BuilderBlock[] }
  | { type: 'MARK_SAVED' }

export interface BuilderPageProps {
  step: { id: string; name: string; slug: string; step_type: string }
  funnel: { id: string; name: string; slug: string }
  summit: { id: string; title: string; slug: string }
  theme: Record<string, unknown>
  blocks: BlockData[]
  blockSchemas: BlockSchemas
  blockTypes: BlockTypeInfo[]
}

export interface FlowStep {
  id: string
  name: string
  slug: string
  step_type: string
  sort_order: number
  is_published: boolean
  product_name: string | null
  has_blocks: boolean
}

export interface FlowPageProps {
  funnel: { id: string; name: string; slug: string }
  summit: { id: string; title: string; slug: string }
  steps: FlowStep[]
}
