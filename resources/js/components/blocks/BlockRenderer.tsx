import type { BlockData } from '@/types/blocks'
import type { ComponentType } from 'react'
import HeroBlock from './HeroBlock'
import SpeakerGridBlock from './SpeakerGridBlock'
import VideoBlock from './VideoBlock'
import TextBlock from './TextBlock'
import ImageBlock from './ImageBlock'
import CtaBlock from './CtaBlock'
import TestimonialsBlock from './TestimonialsBlock'
import FaqBlock from './FaqBlock'
import CountdownBlock from './CountdownBlock'
import PricingCardBlock from './PricingCardBlock'
import DividerBlock from './DividerBlock'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const blockRegistry: Record<string, ComponentType<any>> = {
  hero: HeroBlock,
  speaker_grid: SpeakerGridBlock,
  video: VideoBlock,
  text: TextBlock,
  image: ImageBlock,
  cta: CtaBlock,
  testimonials: TestimonialsBlock,
  faq: FaqBlock,
  countdown: CountdownBlock,
  pricing_card: PricingCardBlock,
  divider: DividerBlock,
}

interface Props {
  blocks: (BlockData & { id?: string })[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extraBlocks?: Record<string, ComponentType<any>>
  context?: Record<string, unknown>
}

export default function BlockRenderer({ blocks, extraBlocks = {}, context = {} }: Props) {
  const registry = { ...blockRegistry, ...extraBlocks }

  return (
    <>
      {blocks.map((block, index) => {
        const Component = registry[block.type]
        if (!Component) return null
        return <Component key={block.id ?? `${block.type}-${index}`} data={block.data ?? {}} {...context} />
      })}
    </>
  )
}
