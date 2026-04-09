import FunnelLayout from '@/layouts/FunnelLayout'
import BlockRenderer from '@/components/blocks/BlockRenderer'
import ConfirmationCard from './templates/thank-you/ConfirmationCard'
import type { FunnelPageProps } from '@/types/funnel'

export default function ThankYou(props: FunnelPageProps) {
  const blocks = props.content?.blocks ?? []

  return (
    <FunnelLayout theme={props.theme} isPreview={props.isPreview} title={props.step.name}>
      {blocks.length > 0 ? (
        <BlockRenderer blocks={blocks} context={{ summit: props.summit }} />
      ) : (
        <ConfirmationCard {...props} />
      )}
    </FunnelLayout>
  )
}
