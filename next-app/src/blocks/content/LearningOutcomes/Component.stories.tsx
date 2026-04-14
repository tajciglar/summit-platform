import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { LearningOutcomes } from './Component'
import { meta as blockMeta } from './meta'
import type { Props } from './schema'

const meta: Meta<typeof LearningOutcomes> = {
  title: 'Blocks/Content/LearningOutcomes',
  component: LearningOutcomes,
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof LearningOutcomes>

const base = blockMeta.exampleProps as Props

export const SixItems: Story = { args: base }

export const ThreeItems: Story = {
  args: { ...base, items: base.items.slice(0, 3) },
}

export const NoEyebrow: Story = {
  args: { ...base, eyebrow: undefined },
}
