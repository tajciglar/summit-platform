import { describe, it, expect } from 'vitest'
import { loadBlockTemplate } from './block-template'

describe('loadBlockTemplate', () => {
  it('returns the markdown contents including file-layout rules', () => {
    const md = loadBlockTemplate()
    expect(md).toContain('Block file-layout and style rules')
    expect(md).toContain('Zod schema')
    expect(md).toContain('globalRegistry')
    expect(md).toContain('JSON envelope')
  })
})
