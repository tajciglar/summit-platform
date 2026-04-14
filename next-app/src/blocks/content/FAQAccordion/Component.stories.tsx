import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { FAQAccordion } from './Component'
import { meta as blockMeta } from './meta'
import type { Props } from './schema'

const meta: Meta<typeof FAQAccordion> = {
  title: 'Blocks/Content/FAQAccordion',
  component: FAQAccordion,
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof FAQAccordion>

const base = blockMeta.exampleProps as Props

export const FiveFAQs: Story = { args: base }

export const SingleFAQ: Story = {
  args: { ...base, items: base.items.slice(0, 1) },
}
