import FunnelLayout from '@/layouts/FunnelLayout'
import BlockRenderer from '@/components/blocks/BlockRenderer'
import SimpleUpsell from './templates/upsell/SimpleUpsell'
import type { UpsellPageProps } from '@/types/funnel'

export default function Upsell(props: UpsellPageProps) {
  const blocks = props.content?.blocks ?? []

  return (
    <FunnelLayout theme={props.theme} isPreview={props.isPreview} title={props.step.name}>
      {blocks.length > 0 ? (
        <BlockRenderer blocks={blocks} context={{ product: props.product, summit: props.summit }} />
      ) : (
        <SimpleUpsell {...props} />
      )}
    </FunnelLayout>
  )
}
