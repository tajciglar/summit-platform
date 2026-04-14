import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { BenefitsGrid } from './Component'
import { meta as blockMeta } from './meta'
import type { Props } from './schema'

const meta: Meta<typeof BenefitsGrid> = {
  title: 'Blocks/Content/BenefitsGrid',
  component: BenefitsGrid,
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof BenefitsGrid>

const base = blockMeta.exampleProps as Props

export const FourBenefits: Story = { args: base }

export const ThreeBenefits: Story = {
  args: { ...base, benefits: base.benefits.slice(0, 3) },
}

export const WithCta: Story = {
  args: { ...base, ctaLabel: 'Register now', ctaUrl: '#register' },
}
