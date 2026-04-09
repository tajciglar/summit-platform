import { useState, useEffect } from 'react'
import type { CountdownBlockData } from '@/types/blocks'

export default function CountdownBlock({ data }: { data: CountdownBlockData }) {
  const [secondsLeft, setSecondsLeft] = useState((data.minutes ?? 15) * 60)

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  if (secondsLeft <= 0 && data.expired_text) {
    return (
      <section className="py-8 text-center">
        <p className="text-gray-500 text-lg">{data.expired_text}</p>
      </section>
    )
  }

  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60

  return (
    <section className="py-10 text-center">
      {data.heading && <p className="text-gray-500 mb-3">{data.heading}</p>}
      <div className="inline-flex items-center gap-2 text-4xl font-bold" style={{ color: 'var(--theme-accent)' }}>
        <span className="bg-gray-100 rounded-lg px-4 py-2">{String(mins).padStart(2, '0')}</span>
        <span>:</span>
        <span className="bg-gray-100 rounded-lg px-4 py-2">{String(secs).padStart(2, '0')}</span>
      </div>
    </section>
  )
}
