import FunnelLayout from '@/layouts/FunnelLayout'
import ConfirmationCard from './templates/thank-you/ConfirmationCard'
import MinimalThankYou from './templates/thank-you/MinimalThankYou'
import type { FunnelPageProps } from '@/types/funnel'
import type { ComponentType } from 'react'

const templates: Record<string, ComponentType<FunnelPageProps>> = {
  confirmation_card: ConfirmationCard,
  minimal: MinimalThankYou,
}

export default function ThankYou(props: FunnelPageProps) {
  const Template = templates[props.template] ?? ConfirmationCard

  return (
    <FunnelLayout theme={props.theme} isPreview={props.isPreview} title={props.step.name}>
      <Template {...props} />
    </FunnelLayout>
  )
}
