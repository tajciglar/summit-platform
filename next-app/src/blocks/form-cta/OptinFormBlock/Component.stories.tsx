import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { OptinFormBlock } from './Component'
import { meta as blockMeta } from './meta'
import type { Props } from './schema'

const meta: Meta<typeof OptinFormBlock> = {
  title: 'Blocks/FormCTA/OptinFormBlock',
  component: OptinFormBlock,
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof OptinFormBlock>

const base = blockMeta.exampleProps as Props

export const Primary: Story = { args: base }

export const Light: Story = { args: { ...base, backgroundStyle: 'light' } }

export const Dark: Story = { args: { ...base, backgroundStyle: 'dark' } }

export const EmailOnly: Story = {
  args: { ...base, fields: { name: false, email: true } },
}
