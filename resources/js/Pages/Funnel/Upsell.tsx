import FunnelLayout from '@/layouts/FunnelLayout'
import SimpleUpsell from './templates/upsell/SimpleUpsell'
import UrgencyUpsell from './templates/upsell/UrgencyUpsell'
import type { UpsellPageProps } from '@/types/funnel'
import type { ComponentType } from 'react'

const templates: Record<string, ComponentType<UpsellPageProps>> = {
  simple_upsell: SimpleUpsell,
  urgency_upsell: UrgencyUpsell,
}

export default function Upsell(props: UpsellPageProps) {
  const Template = templates[props.template] ?? SimpleUpsell

  return (
    <FunnelLayout theme={props.theme} isPreview={props.isPreview} title={props.step.name}>
      <Template {...props} />
    </FunnelLayout>
  )
}
