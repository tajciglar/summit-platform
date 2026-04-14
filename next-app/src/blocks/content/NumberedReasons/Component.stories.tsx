import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { NumberedReasons } from './Component'
import { meta as blockMeta } from './meta'
import type { Props } from './schema'

const meta: Meta<typeof NumberedReasons> = {
  title: 'Blocks/Content/NumberedReasons',
  component: NumberedReasons,
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof NumberedReasons>

const base = blockMeta.exampleProps as Props

export const FiveReasons: Story = { args: base }

export const TitlesOnly: Story = {
  args: { ...base, reasons: base.reasons.map(({ title }) => ({ title })) },
}

export const WithCta: Story = {
  args: { ...base, ctaLabel: 'GET INSTANT ACCESS', ctaUrl: '#register' },
}
