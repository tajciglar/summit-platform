import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { StickyCountdownBar } from './Component'
import { meta as blockMeta } from './meta'
import type { Props } from './schema'

const meta: Meta<typeof StickyCountdownBar> = {
  title: 'Blocks/Utility/StickyCountdownBar',
  component: StickyCountdownBar,
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof StickyCountdownBar>

const base = blockMeta.exampleProps as Props

export const Default: Story = { args: base }

export const BottomSolid: Story = {
  args: { ...base, position: 'bottom', variant: 'solid' },
}

export const ExpiredHidden: Story = {
  args: { ...base, countdownTarget: '2020-01-01T00:00:00Z', hideWhenExpired: true },
}

export const ExpiredVisible: Story = {
  args: { ...base, countdownTarget: '2020-01-01T00:00:00Z', hideWhenExpired: false },
}
