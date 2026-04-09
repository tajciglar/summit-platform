import FunnelLayout from '@/layouts/FunnelLayout'
import BlockRenderer from '@/components/blocks/BlockRenderer'
import type { OptinPageProps } from '@/types/funnel'

export default function Optin(props: OptinPageProps) {
  const blocks = props.content?.blocks ?? []

  // If no blocks defined, render a default hero + speakers layout
  const defaultBlocks = blocks.length > 0 ? blocks : [
    { type: 'hero', data: { headline: props.step.name, subheadline: '', cta_text: 'Register Free', style: 'gradient' } },
    { type: 'speaker_grid', data: { heading: 'Meet Your Speakers', columns: '3' } },
  ]

  return (
    <FunnelLayout theme={props.theme} isPreview={props.isPreview} title={props.step.name}>
      <BlockRenderer blocks={defaultBlocks} context={{ speakers: props.speakers, summit: props.summit }} />
    </FunnelLayout>
  )
}
