'use client'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import type { Props } from './schema'

export function StickyCountdownBar(props: Props) {
  const { timeLeft, expired } = useCountdown(props.countdownTarget)

  if (expired && props.hideWhenExpired) return null

  const bgClass =
    props.variant === 'gradient'
      ? 'bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-accent))]'
      : 'bg-[rgb(var(--color-primary))]'

  const positionClass = props.position === 'top' ? 'top-0' : 'bottom-0'

  return (
    <div
      className={cn(
        'fixed inset-x-0 z-50 text-white shadow-lg',
        positionClass,
        bgClass,
      )}
      role="region"
      aria-label="Countdown banner"
    >
      <div className="mx-auto flex h-[52px] max-w-[1280px] items-center justify-between gap-3 px-4 md:gap-6 md:px-6">
        <p className="hidden truncate text-sm font-medium md:block md:text-base">
          {props.message}
        </p>
        <div className="flex flex-1 items-center justify-center gap-2 md:flex-initial md:gap-3">
          <p className="truncate text-xs font-medium md:hidden">{props.message}</p>
          <TimerSegments timeLeft={timeLeft} />
        </div>
        <a
          href={props.ctaUrl ?? '#'}
          className="shrink-0 rounded-md bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[rgb(var(--color-primary))] transition hover:bg-white/90 md:px-5 md:py-2 md:text-sm"
        >
          {props.ctaLabel}
        </a>
      </div>
    </div>
  )
}

function TimerSegments({
  timeLeft,
}: {
  timeLeft: { days: number; hours: number; minutes: number; seconds: number }
}) {
  const segs = [
    { label: 'd', value: timeLeft.days },
    { label: 'h', value: timeLeft.hours },
    { label: 'm', value: timeLeft.minutes },
    { label: 's', value: timeLeft.seconds },
  ]
  return (
    <div className="flex items-center gap-1 font-mono text-sm tabular-nums md:gap-2 md:text-base">
      {segs.map((s, i) => (
        <span key={s.label} className="flex items-baseline">
          <span className="font-bold">{String(s.value).padStart(2, '0')}</span>
          <span className="ml-0.5 text-[10px] opacity-80 md:text-xs">{s.label}</span>
          {i < segs.length - 1 && <span className="ml-1 opacity-50 md:ml-2">:</span>}
        </span>
      ))}
    </div>
  )
}

function useCountdown(target: string) {
  const [state, setState] = useState(() => compute(target))
  useEffect(() => {
    const id = setInterval(() => setState(compute(target)), 1000)
    return () => clearInterval(id)
  }, [target])
  return state
}

function compute(target: string) {
  const diff = new Date(target).getTime() - Date.now()
  const expired = diff <= 0
  const clamped = Math.max(0, diff)
  return {
    expired,
    timeLeft: {
      days: Math.floor(clamped / 86_400_000),
      hours: Math.floor((clamped / 3_600_000) % 24),
      minutes: Math.floor((clamped / 60_000) % 60),
      seconds: Math.floor((clamped / 1000) % 60),
    },
  }
}
