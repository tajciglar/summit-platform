import FunnelLayout from '@/layouts/FunnelLayout'
import StandardCheckout from './templates/checkout/StandardCheckout'
import SplitCheckout from './templates/checkout/SplitCheckout'
import type { CheckoutPageProps } from '@/types/funnel'
import type { ComponentType } from 'react'

const templates: Record<string, ComponentType<CheckoutPageProps>> = {
  standard_checkout: StandardCheckout,
  split_checkout: SplitCheckout,
}

export default function Checkout(props: CheckoutPageProps) {
  const Template = templates[props.template] ?? StandardCheckout

  return (
    <FunnelLayout theme={props.theme} isPreview={props.isPreview} title={props.step.name}>
      <Template {...props} />
    </FunnelLayout>
  )
}
