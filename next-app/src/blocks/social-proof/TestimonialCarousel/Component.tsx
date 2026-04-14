'use client'
import { useEffect, useRef, useState } from 'react'
import { Star, Quote } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { Props } from './schema'

export function TestimonialCarousel(props: Props) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const total = props.testimonials.length
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    if (!props.autoplay || paused || total <= 1) return
    const id = setInterval(() => {
      setActive((a) => (a + 1) % total)
    }, props.intervalMs)
    return () => clearInterval(id)
  }, [props.autoplay, props.intervalMs, paused, total])

  const current = props.testimonials[active]

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current == null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(delta) < 40) return
    setActive((a) => (a + (delta < 0 ? 1 : -1) + total) % total)
  }

  return (
    <section
      className="bg-gray-50 py-16 md:py-24"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="mx-auto max-w-[820px] px-6">
        {(props.eyebrow || props.headline) && (
          <header className="mb-10 text-center">
            {props.eyebrow && (
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[rgb(var(--color-primary))]">
                {props.eyebrow}
              </p>
            )}
            {props.headline && (
              <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">{props.headline}</h2>
            )}
          </header>
        )}
        <figure
          key={active}
          className="relative animate-[fadeIn_400ms_ease-out] rounded-2xl bg-white p-8 shadow-md md:p-12"
          role="group"
          aria-roledescription="slide"
          aria-label={`${active + 1} of ${total}`}
        >
          <Quote
            className="absolute right-8 top-8 h-10 w-10 text-[rgb(var(--color-primary))]/15"
            aria-hidden
          />
          {current.rating && (
            <div className="mb-4 flex gap-0.5 text-[rgb(var(--color-accent))]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-5 w-5',
                    i < current.rating! ? 'fill-current' : 'opacity-20',
                  )}
                  aria-hidden
                />
              ))}
            </div>
          )}
          <blockquote className="text-lg leading-relaxed text-gray-800 md:text-xl">
            {current.quote}
          </blockquote>
          <figcaption className="mt-6 flex items-center gap-3">
            {current.authorPhotoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={current.authorPhotoUrl}
                alt=""
                className="h-12 w-12 rounded-full object-cover"
              />
            )}
            <div>
              <p className="font-bold text-gray-900">{current.authorName}</p>
              {current.authorRole && (
                <p className="text-sm text-gray-500">{current.authorRole}</p>
              )}
            </div>
          </figcaption>
        </figure>
        <div className="mt-6 flex items-center justify-center gap-2">
          {props.testimonials.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to testimonial ${i + 1}`}
              aria-current={i === active}
              onClick={() => setActive(i)}
              className={cn(
                'h-2 rounded-full transition-all',
                i === active ? 'w-8 bg-[rgb(var(--color-primary))]' : 'w-2 bg-gray-300',
              )}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
