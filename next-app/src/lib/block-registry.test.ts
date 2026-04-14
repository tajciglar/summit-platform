import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import type { BlockMeta } from '@/types/block'
import { createRegistry } from './block-registry'

describe('block registry', () => {
  it('registers and retrieves a block by type+version', () => {
    const registry = createRegistry()
    const schema = z.object({ text: z.string() })
    const Component = () => null
    const meta: BlockMeta = {
      type: 'TestBlock', category: 'utility', version: 1,
      validOn: ['optin'], purpose: 'test', exampleProps: { text: 'hi' },
    }

    registry.register({ meta, schema, Component })

    const found = registry.get('TestBlock', 1)
    expect(found?.meta.type).toBe('TestBlock')
  })

  it('returns undefined for unknown type', () => {
    const registry = createRegistry()
    expect(registry.get('Missing', 1)).toBeUndefined()
  })

  it('lists all registered blocks', () => {
    const registry = createRegistry()
    const Component = () => null
    registry.register({
      meta: { type: 'A', category: 'utility', version: 1, validOn: ['optin'], purpose: 'a', exampleProps: {} },
      schema: z.object({}),
      Component,
    })
    expect(registry.all()).toHaveLength(1)
  })

  it('is a no-op when the same Component is re-registered (HMR, test re-runs)', () => {
    const registry = createRegistry()
    const Component = () => null
    const def = {
      meta: { type: 'A', category: 'utility' as const, version: 1, validOn: ['optin' as const], purpose: 'a', exampleProps: {} },
      schema: z.object({}),
      Component,
    }
    registry.register(def)
    expect(() => registry.register(def)).not.toThrow()
    expect(registry.all()).toHaveLength(1)
  })

  it('throws when a different Component claims the same type+version', () => {
    const registry = createRegistry()
    const metaBase = { type: 'A', category: 'utility' as const, version: 1, validOn: ['optin' as const], purpose: 'a', exampleProps: {} }
    registry.register({ meta: metaBase, schema: z.object({}), Component: () => null })
    expect(() =>
      registry.register({ meta: metaBase, schema: z.object({}), Component: () => null }),
    ).toThrow(/collision/)
  })
})
