import { describe, it, expectTypeOf } from 'vitest'
import type { BlockRow, BlockMeta, StepType } from './block'

describe('block types', () => {
  it('BlockRow has required shape', () => {
    expectTypeOf<BlockRow>().toEqualTypeOf<{
      id: string
      type: string
      version: number
      props: Record<string, unknown>
    }>()
  })

  it('StepType enum covers all funnel step types', () => {
    const valid: StepType[] = ['optin', 'sales_page', 'checkout', 'upsell', 'downsell', 'thank_you']
    expectTypeOf(valid).toEqualTypeOf<StepType[]>()
  })
})
