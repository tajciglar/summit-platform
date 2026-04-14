import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { WhyThisMattersStats } from './Component'
import { meta as blockMeta } from './meta'
import type { Props } from './schema'

const meta: Meta<typeof WhyThisMattersStats> = {
  title: 'Blocks/Content/WhyThisMattersStats',
  component: WhyThisMattersStats,
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof WhyThisMattersStats>

const base = blockMeta.exampleProps as Props

export const FourStats: Story = { args: base }

export const ThreeStats: Story = {
  args: { ...base, stats: base.stats.slice(0, 3) },
}

export const MinimalNoIntro: Story = {
  args: { ...base, eyebrow: undefined, introText: undefined },
}
