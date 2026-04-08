import type { StepContent } from '@/types/funnel'

interface Props {
  content: StepContent
  stepName: string
}

export default function HeroSection({ content, stepName }: Props) {
  return (
    <div className="flex items-center justify-center py-16 md:py-20 px-6">
      <div className="max-w-2xl w-full text-center">
        {content.subheadline && (
          <p
            className="text-sm font-semibold uppercase tracking-[0.15em] mb-3"
            style={{ color: 'var(--theme-primary)' }}
          >
            {content.subheadline}
          </p>
        )}
        <h1
          className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight"
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
            className="mt-8 px-10 py-4 rounded-full text-white font-bold text-lg shadow-lg hover:scale-105 active:scale-100 transition-transform"
            style={{ backgroundColor: 'var(--theme-primary)' }}
          >
            {content.cta_text}
          </button>
        )}
      </div>
    </div>
  )
}
