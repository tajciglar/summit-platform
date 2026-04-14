'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/cn'
import type { Props } from './schema'

export function HeroWithCountdown(props: Props) {
  const { timeLeft } = useCountdown(props.countdownTarget)

  const bgClass = {
    gradient: 'bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(var(--color-primary))]/70',
    image: props.bannerImageUrl ? '' : 'bg-[rgb(var(--color-primary))]',
    solid: 'bg-[rgb(var(--color-primary))]',
  }[props.backgroundStyle]

  return (
    <section
      className={cn('relative overflow-hidden py-20 md:py-32 text-white', bgClass)}
      style={
        props.backgroundStyle === 'image' && props.bannerImageUrl
          ? { backgroundImage: `url(${props.bannerImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : undefined
      }
    >
      <div className="absolute inset-0 bg-black/20" aria-hidden />
      <div className="relative mx-auto max-w-[1024px] px-6 text-center">
        {props.eyebrow && (
          <p className="mb-4 text-sm font-semibold tracking-widest uppercase opacity-90">{props.eyebrow}</p>
        )}
        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4">{props.headline}</h1>
        {props.subheadline && <p className="text-xl md:text-2xl mb-8 opacity-95">{props.subheadline}</p>}
        <CountdownDisplay timeLeft={timeLeft} />
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-[rgb(var(--color-accent))] hover:bg-[rgb(var(--color-accent))]/90 text-white">
            {props.primaryCtaLabel}
          </Button>
          {props.secondaryCtaLabel && (
            <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/40">
              {props.secondaryCtaLabel}
            </Button>
          )}
        </div>
        {props.bodyLines.length > 0 && (
          <ul className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm opacity-95">
            {props.bodyLines.map((line, i) => (
              <li key={i}>• {line}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function CountdownDisplay({
  timeLeft,
}: {
  timeLeft: { days: number; hours: number; minutes: number; seconds: number }
}) {
  return (
    <div className="flex justify-center gap-3 md:gap-6">
      {[
        { label: 'DAYS', value: timeLeft.days },
        { label: 'HOURS', value: timeLeft.hours },
        { label: 'MINUTES', value: timeLeft.minutes },
        { label: 'SECONDS', value: timeLeft.seconds },
      ].map(({ label, value }) => (
        <div key={label} className="bg-white/15 backdrop-blur-sm rounded-lg p-3 md:p-5 min-w-[64px] md:min-w-[90px]">
          <div className="text-3xl md:text-5xl font-bold tabular-nums">{String(value).padStart(2, '0')}</div>
          <div className="text-xs md:text-sm opacity-80 mt-1">{label}</div>
        </div>
      ))}
    </div>
  )
}

function useCountdown(target: string) {
  const [timeLeft, setTimeLeft] = useState(() => compute(target))
  useEffect(() => {
    const id = setInterval(() => setTimeLeft(compute(target)), 1000)
    return () => clearInterval(id)
  }, [target])
  return { timeLeft }
}

function compute(target: string) {
  const diff = Math.max(0, new Date(target).getTime() - Date.now())
  const days = Math.floor(diff / 86_400_000)
  const hours = Math.floor((diff / 3_600_000) % 24)
  const minutes = Math.floor((diff / 60_000) % 60)
  const seconds = Math.floor((diff / 1000) % 60)
  return { days, hours, minutes, seconds }
}
