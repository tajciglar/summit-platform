import type { FunnelPageProps } from '@/types/funnel'

export default function ConfirmationCard({ step, content }: FunnelPageProps) {
  return (
    <div className="flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center">
        <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl text-white" style={{ backgroundColor: 'var(--theme-primary)' }}>
          ✓
        </div>
        <h1
          className="text-2xl font-bold mb-2"
          style={{ fontFamily: 'var(--font-heading), sans-serif', color: 'var(--theme-secondary)' }}
        >
          {content.headline ?? step.name}
        </h1>
        {content.subheadline && (
          <p className="text-gray-500 mb-4">{content.subheadline}</p>
        )}
        {content.body ? (
          <div className="text-gray-500 prose mx-auto" dangerouslySetInnerHTML={{ __html: content.body }} />
        ) : (
          <p className="text-gray-500">You will receive a confirmation email shortly.</p>
        )}
      </div>
    </div>
  )
}
