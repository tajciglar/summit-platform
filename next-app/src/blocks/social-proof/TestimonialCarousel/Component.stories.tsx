import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { TestimonialCarousel } from './Component'
import { meta as blockMeta } from './meta'
import type { Props } from './schema'

const meta: Meta<typeof TestimonialCarousel> = {
  title: 'Blocks/SocialProof/TestimonialCarousel',
  component: TestimonialCarousel,
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof TestimonialCarousel>

const base = blockMeta.exampleProps as Props

export const AutoAdvance: Story = { args: base }

export const Manual: Story = {
  args: { ...base, autoplay: false },
}

export const WithPhotos: Story = {
  args: {
    ...base,
    testimonials: base.testimonials.map((t, i) => ({
      ...t,
      authorPhotoUrl: `https://placehold.co/96x96/5e4d9b/ffffff.png?text=${i + 1}`,
    })),
  },
}

export const NoRatings: Story = {
  args: {
    ...base,
    testimonials: base.testimonials.map(({ rating: _r, ...t }) => t),
  },
}
