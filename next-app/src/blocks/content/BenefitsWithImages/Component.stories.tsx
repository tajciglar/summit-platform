import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { BenefitsWithImages } from './Component'
import { meta as blockMeta } from './meta'
import type { Props } from './schema'

const meta: Meta<typeof BenefitsWithImages> = {
  title: 'Blocks/Content/BenefitsWithImages',
  component: BenefitsWithImages,
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof BenefitsWithImages>

const base = blockMeta.exampleProps as Props

export const ThreeBenefits: Story = { args: base }

export const TwoBenefits: Story = {
  args: { ...base, benefits: base.benefits.slice(0, 2) },
}
