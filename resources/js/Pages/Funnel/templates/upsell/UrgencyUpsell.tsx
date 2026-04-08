import { useState, useEffect } from 'react'
import SimpleUpsell from './SimpleUpsell'
import type { UpsellPageProps } from '@/types/funnel'

function CountdownTimer({ minutes }: { minutes: number }) {
  const [secondsLeft, setSecondsLeft] = useState(minutes * 60)

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60

  return (
    <div className="text-center mb-6">
      <p className="text-sm text-gray-500 mb-2">This offer expires in</p>
      <div className="inline-flex items-center gap-2 text-3xl font-bold" style={{ color: 'var(--theme-accent)' }}>
        <span className="bg-gray-100 rounded-lg px-3 py-1">{String(mins).padStart(2, '0')}</span>
        <span>:</span>
        <span className="bg-gray-100 rounded-lg px-3 py-1">{String(secs).padStart(2, '0')}</span>
      </div>
    </div>
  )
}

export default function UrgencyUpsell(props: UpsellPageProps) {
  const countdownMinutes = props.content.countdown_minutes ?? 15

  return (
    <div className="flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <CountdownTimer minutes={countdownMinutes} />
        <SimpleUpsell {...props} />
      </div>
    </div>
  )
}
