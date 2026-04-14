import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SocialProofBadge } from './Component'
import { meta as blockMeta } from './meta'
import type { Props } from './schema'

const meta: Meta<typeof SocialProofBadge> = {
  title: 'Blocks/SocialProof/SocialProofBadge',
  component: SocialProofBadge,
}
export default meta

type Story = StoryObj<typeof SocialProofBadge>

const base = blockMeta.exampleProps as Props

export const Default: Story = { args: base }

export const WithIcon: Story = {
  args: { ...base, badgeIconUrl: 'https://placehold.co/128x128/5e4d9b/ffffff.png' },
}

export const AccentBackground: Story = {
  args: { ...base, backgroundColor: 'accent' },
}

export const HeadlineOnly: Story = {
  args: { headline: 'Trusted by the world\u2019s leading ADHD experts', backgroundColor: 'light' },
}
