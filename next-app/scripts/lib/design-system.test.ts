import { describe, it, expect } from 'vitest'
import { DESIGN_SYSTEM } from './design-system'

describe('DESIGN_SYSTEM', () => {
  it('is a non-empty string', () => {
    expect(typeof DESIGN_SYSTEM).toBe('string')
    expect(DESIGN_SYSTEM.length).toBeGreaterThan(100)
  })

  it('includes the brand palette hex codes', () => {
    expect(DESIGN_SYSTEM).toContain('#0D9488')
    expect(DESIGN_SYSTEM).toContain('#F59E0B')
    expect(DESIGN_SYSTEM).toContain('#F0FDFA')
  })

  it('includes typography guidance', () => {
    expect(DESIGN_SYSTEM).toMatch(/Montserrat/)
    expect(DESIGN_SYSTEM).toMatch(/Source Sans/)
  })
})
