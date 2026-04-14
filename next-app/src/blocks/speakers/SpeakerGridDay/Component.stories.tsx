import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SpeakerGridDay } from './Component'
import { meta as blockMeta } from './meta'
import { SpeakersProvider, type Speaker } from '@/lib/speakers-context'
import type { Props } from './schema'

const fakeSpeakers: Speaker[] = Array.from({ length: 8 }).map((_, i) => ({
  id: `00000000-0000-0000-0000-${String(i).padStart(12, '0')}`,
  firstName: `Speaker`,
  lastName: `#${i + 1}`,
  fullName: `Speaker #${i + 1}`,
  title: ['PhD', 'MD', 'LCSW', 'Author'][i % 4],
  photoUrl: `https://placehold.co/400x400/5e4d9b/ffffff.png?text=S${i + 1}`,
  shortDescription:
    'Short description about what the speaker does and why they\u2019re excellent for this day.',
  longDescription:
    'A longer bio with more detail about credentials, publications, and the specific expertise the speaker brings to this day of the summit. Shown when Read more is clicked.',
  dayNumber: 1,
  masterclassTitle: ['Focus & Attention', 'Emotional Regulation', 'Executive Function', 'Screen Time'][i % 4],
  sortOrder: i,
}))

const meta: Meta<typeof SpeakerGridDay> = {
  title: 'Blocks/Speakers/SpeakerGridDay',
  component: SpeakerGridDay,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <SpeakersProvider speakers={fakeSpeakers}>
        <Story />
      </SpeakersProvider>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof SpeakerGridDay>

const base = blockMeta.exampleProps as Props

export const Default: Story = { args: base }

export const NoSubtitle: Story = {
  args: { ...base, subtitle: undefined },
}

export const NotExpandable: Story = {
  args: { ...base, expandable: false },
}
