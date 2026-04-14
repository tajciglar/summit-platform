import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Footer } from './Component'
import { meta as blockMeta } from './meta'
import type { Props } from './schema'

const meta: Meta<typeof Footer> = {
  title: 'Blocks/Utility/Footer',
  component: Footer,
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof Footer>

const base = blockMeta.exampleProps as Props

export const Default: Story = { args: base }

export const WithLogo: Story = {
  args: { ...base, logoUrl: 'https://placehold.co/200x60/00b553/ffffff.png?text=Althea' },
}

export const MinimalLegal: Story = {
  args: {
    ...base,
    tagline: undefined,
    summitDatesText: undefined,
    links: [
      { label: 'Privacy', url: '/privacy' },
      { label: 'Terms', url: '/terms' },
    ],
  },
}
