'use client'

import { useEffect, useState } from 'react'
import { ArrowRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Props } from './schema'

function compute(target: string) {
  const diff = Math.max(0, new Date(target).getTime() - Date.now())
  const days = Math.floor(diff / 86_400_000)
  const hours = Math.floor((diff / 3_600_000) % 24)
  const minutes = Math.floor((diff / 60_000) % 60)
  const seconds = Math.floor((diff / 1000) % 60)
  return { days, hours, minutes, seconds }
}

function useCountdown(target: string) {
  const [timeLeft, setTimeLeft] = useState(() => compute(target))
  useEffect(() => {
    const id = setInterval(() => setTimeLeft(compute(target)), 1000)
    return () => clearInterval(id)
  }, [target])
  return { timeLeft }
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex w-12 flex-col items-center rounded-md bg-white/90 p-1 text-center shadow-inner sm:w-14">
      <span className="font-montserrat text-xl font-extrabold tabular-nums text-slate-900">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-600 sm:text-[10px]">
        {label}
      </span>
    </div>
  )
}

function CountdownDisplay({ timeLeft }: { timeLeft: ReturnType<typeof compute> }) {
  const units = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ]

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {units.map(({ label, value }) => (
        <CountdownUnit key={label} value={value} label={label} />
      ))}
    </div>
  )
}

export function StickyCountdownBar({ text, countdownTarget, ctaLabel, ctaShowArrow = true }: Props) {
  const { timeLeft } = useCountdown(countdownTarget)

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-[rgb(var(--color-primary))] to-[rgb(var(--color-accent))] text-white shadow-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-center gap-4 px-4 sm:px-6 lg:justify-between lg:px-8">
        <div className="flex items-center gap-6">
          <p className="hidden font-montserrat text-sm font-bold uppercase tracking-tight text-white/90 lg:block">
            {text}
          </p>
          <CountdownDisplay timeLeft={timeLeft} />
        </div>

        <Button
          size="sm"
          className="shrink-0 rounded-full bg-[rgb(var(--color-accent))] px-4 font-bold text-amber-950 shadow-sm transition-colors hover:bg-[rgb(var(--color-accent))]/90"
        >
          {ctaLabel}
          {ctaShowArrow && <ArrowRightIcon className="ml-1.5 size-4" />}
        </Button>
      </div>
    </header>
  )
}
