import type { StepContent } from '@/types/funnel'

interface Props {
  content: StepContent
  stepName: string
}

export default function HeroSection({ content, stepName }: Props) {
  return (
    <div className="flex items-center justify-center py-16 px-6">
      <div className="max-w-2xl w-full text-center">
        {content.subheadline && (
          <p
            className="text-sm font-medium uppercase tracking-widest mb-3"
            style={{ color: 'var(--theme-primary)' }}
          >
            {content.subheadline}
          </p>
        )}
        <h1
          className="text-4xl md:text-5xl font-bold mb-4"
          style={{ fontFamily: 'var(--font-heading), sans-serif', color: 'var(--theme-secondary)' }}
        >
          {content.headline ?? stepName}
        </h1>
        {content.body && (
          <div
            className="text-lg text-gray-600 mt-4 prose prose-lg mx-auto"
            dangerouslySetInnerHTML={{ __html: content.body }}
          />
        )}
        {content.cta_text && (
          <button
            className="mt-8 px-8 py-3 rounded-lg text-white font-semibold text-lg shadow-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--theme-primary)' }}
          >
            {content.cta_text}
          </button>
        )}
      </div>
    </div>
  )
}
