'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Props } from './schema'

export function HeroWithCountdown(props: Props) {
  const { timeLeft } = useCountdown(props.countdownTarget)

  return (
    <section className="bg-[#F0FDFA] py-16 md:py-24 lg:py-32">
      <div className="mx-auto grid max-w-[1280px] px-6 md:grid-cols-2 md:gap-x-12 lg:gap-x-24 items-center">
        {/* Left Content Column */}
        <div className="text-center md:text-left mb-12 md:mb-0">
          {props.eyebrowLabel && (
            <div className="inline-flex items-center rounded-full bg-[rgb(var(--color-primary))] px-4 py-2 text-sm font-medium tracking-wide text-white mb-6">
              {props.eyebrowLabel}
            </div>
          )}
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-[-0.02em] text-foreground mb-6">
            {props.headline}
          </h1>
          <p className="font-body text-lg leading-relaxed text-muted-foreground mb-8 max-w-[65ch] mx-auto md:mx-0">
            {props.body}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mb-8">
            <Button size="lg" asChild>
              <a href={props.primaryCtaHref}>
                {props.primaryCtaLabel}
              </a>
            </Button>
            {props.secondaryCtaLabel && props.secondaryCtaHref && (
              <Button size="lg" variant="outline" className="border-[rgb(var(--color-primary))] text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary))]/5">
                <a href={props.secondaryCtaHref}>
                  {props.secondaryCtaLabel}
                </a>
              </Button>
            )}
          </div>
          {props.footerStat && (
            <p className="font-body text-sm text-muted-foreground">
              {props.footerStat}
            </p>
          )}
        </div>

        {/* Right Countdown Card */}
        <Card className="mx-auto w-full max-w-sm p-8 text-center shadow-lg ring-1 ring-[#E5E7EB] border border-[#E5E7EB]">
          <div className="text-sm font-semibold uppercase tracking-wide text-foreground/70 mb-4">
            DAYS:HOURS:MINUTES:SECONDS
          </div>
          <div className="flex justify-center gap-2 font-heading text-5xl md:text-6xl font-extrabold tabular-nums text-[rgb(var(--color-primary))] mb-6 leading-none">
            <span className="min-w-[70px]">{String(timeLeft.days).padStart(2, '0')}</span>:
            <span className="min-w-[70px]">{String(timeLeft.hours).padStart(2, '0')}</span>:
            <span className="min-w-[70px]">{String(timeLeft.minutes).padStart(2, '0')}</span>:
            <span className="min-w-[70px]">{String(timeLeft.seconds).padStart(2, '0')}</span>
          </div>
          <div className="font-heading text-lg font-bold uppercase text-foreground/80 mb-6">
            {props.countdownEventDate}
          </div>
          {props.countdownLimitedSpotsLabel && (
            <span className="inline-flex items-center rounded-full bg-[rgb(var(--color-accent))] px-4 py-2 text-sm font-bold tracking-wider text-white">
              {props.countdownLimitedSpotsLabel}
            </span>
          )}
        </Card>
      </div>
    </section>
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