import { describe, it, expect } from 'vitest'
import { packExampleBlock } from './example-block-packer'

describe('packExampleBlock', () => {
  it('packs all 4 files for an existing block with clear headers', () => {
    const packed = packExampleBlock('hero', 'HeroWithCountdown')
    expect(packed).toMatch(/\/\/ HeroWithCountdown\/schema\.ts/)
    expect(packed).toMatch(/\/\/ HeroWithCountdown\/meta\.ts/)
    expect(packed).toMatch(/\/\/ HeroWithCountdown\/Component\.tsx/)
    expect(packed).toMatch(/\/\/ HeroWithCountdown\/index\.ts/)
    expect(packed).toMatch(/globalRegistry\.register/)
  })

  it('throws when the block directory is missing', () => {
    expect(() => packExampleBlock('hero', 'Nope')).toThrow(/block not found/i)
  })

  it('rejects path-traversal names before touching the filesystem', () => {
    expect(() => packExampleBlock('../../../etc', 'passwd')).toThrow(/rejected/i)
    expect(() => packExampleBlock('hero', '../Nope')).toThrow(/rejected/i)
  })
})
