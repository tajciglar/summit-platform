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
      const existing = blocks.get(key)
      if (existing) {
        // Same module re-imported (HMR, test re-runs, split bundles): no-op.
        // Different Component with same key: real name collision — fail loud.
        if (existing.Component === def.Component) return
        throw new Error(`Block collision: ${key} registered with a different Component`)
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
