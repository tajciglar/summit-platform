import FunnelLayout from '@/layouts/FunnelLayout'
import BlockRenderer from '@/components/blocks/BlockRenderer'
import StandardCheckout from './templates/checkout/StandardCheckout'
import type { CheckoutPageProps } from '@/types/funnel'

export default function Checkout(props: CheckoutPageProps) {
  const blocks = props.content?.blocks ?? []

  // Checkout always renders the checkout form — blocks go above it
  return (
    <FunnelLayout theme={props.theme} isPreview={props.isPreview} title={props.step.name}>
      {blocks.length > 0 ? (
        <BlockRenderer blocks={blocks} context={{ product: props.product, summit: props.summit }} />
      ) : (
        <StandardCheckout {...props} />
      )}
    </FunnelLayout>
  )
}
