import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ClosingCTAWithList } from './Component'
import { meta as blockMeta } from './meta'
import type { Props } from './schema'

const meta: Meta<typeof ClosingCTAWithList> = {
  title: 'Blocks/FormCTA/ClosingCTAWithList',
  component: ClosingCTAWithList,
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof ClosingCTAWithList>

const base = blockMeta.exampleProps as Props

export const Gradient: Story = { args: base }

export const Primary: Story = {
  args: { ...base, background: 'primary' },
}

export const Light: Story = {
  args: { ...base, background: 'light' },
}

export const ShortList: Story = {
  args: { ...base, bullets: base.bullets.slice(0, 3) },
}
