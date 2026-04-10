import { useReducer } from 'react'
import type { BuilderAction, BuilderBlock, BuilderState } from '@/types/builder'
import type { BlockData } from '@/types/blocks'

const MAX_HISTORY = 50

function generateId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function pushHistory(state: BuilderState): Pick<BuilderState, 'past' | 'future'> {
  return {
    past: [...state.past.slice(-MAX_HISTORY), state.blocks],
    future: [],
  }
}

function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case 'ADD_BLOCK': {
      const newBlock: BuilderBlock = {
        id: generateId(),
        type: action.blockType,
        data: action.defaultData ?? {},
      }
      const blocks = [...state.blocks]
      const index = action.index ?? blocks.length
      blocks.splice(index, 0, newBlock)
      return {
        ...state,
        ...pushHistory(state),
        blocks,
        selectedBlockId: newBlock.id,
        isDirty: true,
      }
    }

    case 'REMOVE_BLOCK': {
      return {
        ...state,
        ...pushHistory(state),
        blocks: state.blocks.filter((b) => b.id !== action.blockId),
        selectedBlockId: state.selectedBlockId === action.blockId ? null : state.selectedBlockId,
        isDirty: true,
      }
    }

    case 'MOVE_BLOCK': {
      const blocks = [...state.blocks]
      const [moved] = blocks.splice(action.fromIndex, 1)
      if (moved) blocks.splice(action.toIndex, 0, moved)
      return { ...state, ...pushHistory(state), blocks, isDirty: true }
    }

    case 'UPDATE_BLOCK_DATA': {
      return {
        ...state,
        ...pushHistory(state),
        blocks: state.blocks.map((b) =>
          b.id === action.blockId ? { ...b, data: { ...b.data, ...action.data } } : b
        ),
        isDirty: true,
      }
    }

    case 'SELECT_BLOCK':
      return { ...state, selectedBlockId: action.blockId }

    case 'DUPLICATE_BLOCK': {
      const idx = state.blocks.findIndex((b) => b.id === action.blockId)
      if (idx === -1) return state
      const original = state.blocks[idx]!
      const clone: BuilderBlock = {
        id: generateId(),
        type: original.type,
        data: JSON.parse(JSON.stringify(original.data)) as Record<string, unknown>,
      }
      const blocks = [...state.blocks]
      blocks.splice(idx + 1, 0, clone)
      return { ...state, ...pushHistory(state), blocks, selectedBlockId: clone.id, isDirty: true }
    }

    case 'UNDO': {
      if (state.past.length === 0) return state
      const previous = state.past[state.past.length - 1]!
      return {
        ...state,
        blocks: previous,
        past: state.past.slice(0, -1),
        future: [state.blocks, ...state.future],
        isDirty: true,
        selectedBlockId: null,
      }
    }

    case 'REDO': {
      if (state.future.length === 0) return state
      const next = state.future[0]!
      return {
        ...state,
        blocks: next,
        past: [...state.past, state.blocks],
        future: state.future.slice(1),
        isDirty: true,
        selectedBlockId: null,
      }
    }

    case 'SET_BLOCKS':
      return { ...state, blocks: action.blocks, isDirty: false, lastSavedBlocks: JSON.stringify(action.blocks) }

    case 'MARK_SAVED':
      return { ...state, isDirty: false, lastSavedBlocks: JSON.stringify(state.blocks) }

    default:
      return state
  }
}

export function blocksToBuilderBlocks(blocks: BlockData[]): BuilderBlock[] {
  return blocks.map((b) => ({ ...b, id: generateId() }))
}

export function builderBlocksToBlocks(blocks: BuilderBlock[]): BlockData[] {
  return blocks.map(({ type, data }) => ({ type, data }))
}

export function useBuilderStore(initialBlocks: BuilderBlock[]) {
  const initialState: BuilderState = {
    blocks: initialBlocks,
    selectedBlockId: null,
    past: [],
    future: [],
    isDirty: false,
    lastSavedBlocks: JSON.stringify(initialBlocks),
  }

  return useReducer(builderReducer, initialState)
}
