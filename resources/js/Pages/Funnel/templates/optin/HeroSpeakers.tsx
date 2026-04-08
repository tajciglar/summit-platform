import HeroSection from '@/components/funnel/HeroSection'
import SpeakerGrid from '@/components/funnel/SpeakerGrid'
import type { OptinPageProps } from '@/types/funnel'

export default function HeroSpeakers({ step, content, speakers }: OptinPageProps) {
  return (
    <>
      {content.hero_image && (
        <div className="w-full h-64 md:h-96 overflow-hidden">
          <img src={content.hero_image} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <HeroSection content={content} stepName={step.name} />
      <SpeakerGrid speakers={speakers} />
    </>
  )
}
