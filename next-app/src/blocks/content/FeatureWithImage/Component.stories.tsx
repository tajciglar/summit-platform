import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { FeatureWithImage } from './Component'
import { meta as blockMeta } from './meta'
import type { Props } from './schema'

const meta: Meta<typeof FeatureWithImage> = {
  title: 'Blocks/Content/FeatureWithImage',
  component: FeatureWithImage,
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof FeatureWithImage>

const base = blockMeta.exampleProps as Props

export const ImageRight: Story = { args: base }

export const ImageLeft: Story = {
  args: { ...base, imagePosition: 'left' },
}

export const WithEyebrow: Story = {
  args: { ...base, eyebrow: 'What you\u2019ll get' },
}

export const NoCta: Story = {
  args: { ...base, ctaLabel: undefined, ctaUrl: undefined },
}
