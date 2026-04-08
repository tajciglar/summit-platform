import type { FunnelPageProps } from '@/types/funnel'

export default function ConfirmationCard({ step, content }: FunnelPageProps) {
  return (
    <div className="flex items-center justify-center py-16 md:py-24 px-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-8 md:p-10 text-center border border-gray-100">
        <div
          className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl text-white shadow-lg"
          style={{ backgroundColor: 'var(--theme-primary)' }}
        >
          ✓
        </div>
        <h1
          className="text-2xl md:text-3xl font-extrabold mb-3"
          style={{ fontFamily: 'var(--font-heading), sans-serif', color: 'var(--theme-secondary)' }}
        >
          {content.headline ?? step.name}
        </h1>
        {content.subheadline && (
          <p className="text-lg text-gray-500 mb-4">{content.subheadline}</p>
        )}
        {content.body ? (
          <div className="text-gray-500 prose mx-auto" dangerouslySetInnerHTML={{ __html: content.body }} />
        ) : (
          <p className="text-gray-500">
            You will receive a confirmation email shortly with all the details.
          </p>
        )}
        <div className="mt-8 pt-6 border-t border-gray-100 text-sm text-gray-400">
          Check your inbox for next steps
        </div>
      </div>
    </div>
  )
}
