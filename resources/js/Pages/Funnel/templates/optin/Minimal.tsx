import HeroSection from '@/components/funnel/HeroSection'
import type { OptinPageProps } from '@/types/funnel'

export default function Minimal({ step, content }: OptinPageProps) {
  return (
    <div className="min-h-[70vh] flex items-center">
      <HeroSection content={content} stepName={step.name} />
    </div>
  )
}
