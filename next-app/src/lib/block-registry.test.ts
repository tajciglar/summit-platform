import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { createRegistry } from './block-registry'

describe('block registry', () => {
  it('registers and retrieves a block by type+version', () => {
    const registry = createRegistry()
    const schema = z.object({ text: z.string() })
    const Component = () => null
    const meta = {
      type: 'TestBlock', category: 'utility', version: 1,
      validOn: ['optin'], purpose: 'test', exampleProps: { text: 'hi' },
    } as const

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
})
