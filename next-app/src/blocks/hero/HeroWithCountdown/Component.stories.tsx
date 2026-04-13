import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { HeroWithCountdown } from './Component'
import { meta as blockMeta } from './meta'
import type { Props } from './schema'

const meta: Meta<typeof HeroWithCountdown> = {
  title: 'Blocks/Hero/HeroWithCountdown',
  component: HeroWithCountdown,
}
export default meta

type Story = StoryObj<typeof HeroWithCountdown>

export const Default: Story = { args: blockMeta.exampleProps as Props }

export const NoSecondaryCta: Story = {
  args: { ...(blockMeta.exampleProps as Props), secondaryCtaLabel: undefined },
}

export const ImageBackground: Story = {
  args: {
    ...(blockMeta.exampleProps as Props),
    backgroundStyle: 'image',
    bannerImageUrl: 'https://placehold.co/2000x1200/302070/ffffff.jpg',
  },
}
