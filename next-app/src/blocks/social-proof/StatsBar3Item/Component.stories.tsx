import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { StatsBar3Item } from './Component'
import { meta as blockMeta } from './meta'
import type { Props } from './schema'

const meta: Meta<typeof StatsBar3Item> = {
  title: 'Blocks/SocialProof/StatsBar3Item',
  component: StatsBar3Item,
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof StatsBar3Item>

const base = blockMeta.exampleProps as Props

export const Default: Story = { args: base }

export const OnPrimary: Story = {
  args: { ...base, backgroundColor: 'primary' },
}

export const White: Story = {
  args: { ...base, backgroundColor: 'white' },
}
