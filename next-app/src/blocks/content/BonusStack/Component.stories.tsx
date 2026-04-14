import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { BonusStack } from './Component'
import { meta as blockMeta } from './meta'
import type { Props } from './schema'

const meta: Meta<typeof BonusStack> = {
  title: 'Blocks/Content/BonusStack',
  component: BonusStack,
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof BonusStack>

const base = blockMeta.exampleProps as Props

export const FourBonuses: Story = { args: base }

export const SingleBonus: Story = {
  args: { ...base, bonuses: base.bonuses.slice(0, 1) },
}

export const NoValueChips: Story = {
  args: {
    ...base,
    bonuses: base.bonuses.map(({ valueLabel: _v, ...b }) => b),
  },
}
