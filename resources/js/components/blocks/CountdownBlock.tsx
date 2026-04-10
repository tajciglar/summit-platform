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
      <section className="py-8 text-center" aria-live="polite">
        <p style={{ color: 'var(--theme-muted)' }} className="text-lg">{data.expired_text}</p>
      </section>
    )
  }

  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60

  return (
    <section className="py-10 text-center" role="timer" aria-live="polite" aria-atomic="true">
      {data.heading && <p style={{ color: 'var(--theme-muted)' }} className="mb-3">{data.heading}</p>}
      <div className="inline-flex items-center gap-2 text-4xl font-bold" style={{ color: 'var(--theme-accent)' }}>
        <span
          className="rounded-lg px-4 py-2"
          style={{ backgroundColor: 'var(--theme-surface-alt)' }}
        >
          {String(mins).padStart(2, '0')}
        </span>
        <span aria-hidden="true">:</span>
        <span
          className="rounded-lg px-4 py-2"
          style={{ backgroundColor: 'var(--theme-surface-alt)' }}
        >
          {String(secs).padStart(2, '0')}
        </span>
      </div>
      <span className="sr-only">{mins} minutes and {secs} seconds remaining</span>
    </section>
  )
}
