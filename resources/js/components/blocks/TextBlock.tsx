import { sanitizeHtml } from '@/lib/sanitize'
import type { TextBlockData } from '@/types/blocks'

const widthMap = { narrow: 'max-w-2xl', medium: 'max-w-3xl', wide: 'max-w-4xl' }

export default function TextBlock({ data }: { data: TextBlockData }) {
  const width = widthMap[data.width ?? 'medium']

  return (
    <section className="py-10 px-6">
      <div
        className={`${width} mx-auto prose prose-lg`}
        style={{ color: 'var(--theme-text)' }}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.body) }}
      />
    </section>
  )
}
