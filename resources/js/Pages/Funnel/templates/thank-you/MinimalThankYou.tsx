import type { FunnelPageProps } from '@/types/funnel'

export default function MinimalThankYou({ step, content }: FunnelPageProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-lg">
        <h1
          className="text-3xl font-bold mb-3"
          style={{ fontFamily: 'var(--font-heading), sans-serif', color: 'var(--theme-secondary)' }}
        >
          {content.headline ?? step.name}
        </h1>
        {content.subheadline && <p className="text-lg text-gray-500">{content.subheadline}</p>}
      </div>
    </div>
  )
}
