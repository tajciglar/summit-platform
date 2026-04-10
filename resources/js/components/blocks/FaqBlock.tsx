import { useState, useRef, useEffect, useCallback } from 'react'
import type { FaqBlockData } from '@/types/blocks'

export default function FaqBlock({ data }: { data: FaqBlockData }) {
  const items = data.items ?? []
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (items.length === 0) return null

  return (
    <section className="py-16 px-6">
      <div className="max-w-3xl mx-auto">
        {data.heading && (
          <h2
            className="text-2xl md:text-3xl font-bold text-center mb-10"
            style={{ fontFamily: 'var(--font-heading), sans-serif', color: 'var(--theme-secondary)' }}
          >
            {data.heading}
          </h2>
        )}
        <div className="space-y-3" role="list">
          {items.map((item, i) => (
            <FaqItem
              key={i}
              index={i}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function FaqItem({
  index,
  question,
  answer,
  isOpen,
  onToggle,
}: {
  index: number
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  const measureHeight = useCallback(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight)
    }
  }, [])

  useEffect(() => {
    measureHeight()
  }, [measureHeight, answer])

  const panelId = `faq-panel-${index}`
  const buttonId = `faq-button-${index}`

  return (
    <div
      className="rounded-xl overflow-hidden transition-colors"
      style={{
        backgroundColor: 'var(--theme-surface)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--theme-border)',
      }}
      role="listitem"
    >
      <button
        id={buttonId}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="w-full flex items-center justify-between px-6 py-4 text-left font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        style={{
          color: 'var(--theme-secondary)',
          '--tw-ring-color': 'var(--theme-primary)',
        } as React.CSSProperties}
      >
        {question}
        <svg
          className="ml-4 w-5 h-5 shrink-0 transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? `${height}px` : '0px' }}
      >
        <div ref={contentRef} className="px-6 pb-4 leading-relaxed" style={{ color: 'var(--theme-muted)' }}>
          {answer}
        </div>
      </div>
    </div>
  )
}
