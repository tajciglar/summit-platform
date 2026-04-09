import { useState } from 'react'
import type { FaqBlockData } from '@/types/blocks'

export default function FaqBlock({ data }: { data: FaqBlockData }) {
  const items = data.items ?? []
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (items.length === 0) return null

  return (
    <section className="py-16 px-6">
      <div className="max-w-3xl mx-auto">
        {data.heading && (
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10" style={{ fontFamily: 'var(--font-heading), sans-serif', color: 'var(--theme-secondary)' }}>
            {data.heading}
          </h2>
        )}
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left font-semibold transition-colors hover:bg-gray-50"
                style={{ color: 'var(--theme-secondary)' }}
              >
                {item.question}
                <span className="ml-4 text-xl transition-transform" style={{ transform: openIndex === i ? 'rotate(45deg)' : 'none' }}>+</span>
              </button>
              {openIndex === i && (
                <div className="px-6 pb-4 text-gray-600 leading-relaxed">{item.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
