import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { LogoStripCarousel } from './Component'
import { meta as blockMeta } from './meta'
import type { Props } from './schema'

const meta: Meta<typeof LogoStripCarousel> = {
  title: 'Blocks/SocialProof/LogoStripCarousel',
  component: LogoStripCarousel,
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof LogoStripCarousel>

const base = blockMeta.exampleProps as Props

export const ScrollingMarquee: Story = { args: base }

export const Static: Story = {
  args: { ...base, animation: 'static' },
}

export const FewLogos: Story = {
  args: {
    ...base,
    animation: 'static',
    logos: base.logos.slice(0, 3),
  },
}
