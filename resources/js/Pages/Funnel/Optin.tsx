import FunnelLayout from '@/layouts/FunnelLayout'
import HeroSpeakers from './templates/optin/HeroSpeakers'
import VideoForm from './templates/optin/VideoForm'
import Minimal from './templates/optin/Minimal'
import type { OptinPageProps } from '@/types/funnel'
import type { ComponentType } from 'react'

const templates: Record<string, ComponentType<OptinPageProps>> = {
  hero_speakers: HeroSpeakers,
  video_form: VideoForm,
  minimal: Minimal,
}

export default function Optin(props: OptinPageProps) {
  const Template = templates[props.template] ?? HeroSpeakers

  return (
    <FunnelLayout theme={props.theme} isPreview={props.isPreview} title={props.step.name}>
      <Template {...props} />
    </FunnelLayout>
  )
}
