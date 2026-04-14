import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { FoundersSection } from './Component'
import { meta as blockMeta } from './meta'
import type { Props } from './schema'

const meta: Meta<typeof FoundersSection> = {
  title: 'Blocks/Content/FoundersSection',
  component: FoundersSection,
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof FoundersSection>

const base = blockMeta.exampleProps as Props

export const TwoFounders: Story = { args: base }

export const SingleFounder: Story = {
  args: { ...base, founders: base.founders.slice(0, 1) },
}

export const FourFounders: Story = {
  args: {
    ...base,
    founders: [
      ...base.founders,
      { name: 'Sam Contributor', title: 'Program director', photoUrl: 'https://placehold.co/400x400/302070/ffffff.png?text=SC' },
      { name: 'Pat Contributor', title: 'Community lead', photoUrl: 'https://placehold.co/400x400/008e41/ffffff.png?text=PC' },
    ],
  },
}

export const NoCta: Story = {
  args: { ...base, ctaLabel: undefined, ctaUrl: undefined },
}
