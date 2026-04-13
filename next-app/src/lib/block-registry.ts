import type { BlockDefinition } from '@/types/block'

export interface BlockRegistry {
  register: (def: BlockDefinition) => void
  get: (type: string, version: number) => BlockDefinition | undefined
  all: () => BlockDefinition[]
}

export function createRegistry(): BlockRegistry {
  const blocks = new Map<string, BlockDefinition>()

  return {
    register(def) {
      const key = `${def.meta.type}@${def.meta.version}`
      if (blocks.has(key)) {
        throw new Error(`Block already registered: ${key}`)
      }
      blocks.set(key, def)
    },
    get(type, version) {
      return blocks.get(`${type}@${version}`)
    },
    all() {
      return Array.from(blocks.values())
    },
  }
}

export const globalRegistry = createRegistry()
