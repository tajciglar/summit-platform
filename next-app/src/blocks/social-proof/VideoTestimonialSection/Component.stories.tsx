import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { VideoTestimonialSection } from './Component'
import { meta as blockMeta } from './meta'
import type { Props } from './schema'

const meta: Meta<typeof VideoTestimonialSection> = {
  title: 'Blocks/SocialProof/VideoTestimonialSection',
  component: VideoTestimonialSection,
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof VideoTestimonialSection>

const base = blockMeta.exampleProps as Props

export const Grid: Story = { args: base }

export const SingleVideo: Story = {
  args: { ...base, layout: 'single', videos: base.videos.slice(0, 1) },
}

export const FourVideos: Story = {
  args: {
    ...base,
    videos: [
      ...base.videos,
      { embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', title: 'A third testimonial', speakerName: 'Morgan' },
      { embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', title: 'Fourth one', speakerName: 'Jamie' },
    ],
  },
}
