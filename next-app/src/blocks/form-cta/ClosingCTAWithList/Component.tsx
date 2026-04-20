'use client'
import { Suspense } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useCheckoutUrl } from '@/hooks/useCheckoutUrl'
import type { Props } from './schema'

function Inner(props: Props) {
  const dynamicUrl = useCheckoutUrl()
  const href = dynamicUrl !== '#' ? dynamicUrl : (props.ctaUrl || '#')
  return <View {...props} href={href} />
}

function View(props: Props & { href: string }) {
  const bg = {
    light: 'bg-gray-50 text-gray-900',
    primary: 'bg-[rgb(var(--color-primary))] text-white',
    gradient:
      'bg-gradient-to-br from-[rgb(var(--color-primary))] via-[rgb(var(--color-primary))] to-[rgb(var(--color-accent))] text-white',
  }[props.background]

  const onDark = props.background !== 'light'

  return (
    <section className={cn('py-20 md:py-24', bg)}>
      <div className="mx-auto max-w-[820px] px-6 text-center">
        {props.eyebrow && (
          <p
            className={cn(
              'mb-3 text-sm font-semibold uppercase tracking-widest',
              onDark ? 'text-white/80' : 'text-[rgb(var(--color-primary))]',
            )}
          >
            {props.eyebrow}
          </p>
        )}
        <h2 className="text-3xl font-bold md:text-5xl">{props.headline}</h2>
        {props.bodyText && (
          <p className={cn('mt-4 text-lg', onDark ? 'text-white/90' : 'text-gray-700')}>
            {props.bodyText}
          </p>
        )}
        <ul
          className={cn(
            'mx-auto mt-10 grid max-w-[620px] grid-cols-1 gap-3 text-left sm:grid-cols-2',
          )}
        >
          {props.bullets.map((bullet, i) => (
            <li key={i} className="flex items-start gap-2">
              <Check
                className={cn(
                  'mt-0.5 h-5 w-5 shrink-0',
                  onDark ? 'text-[rgb(var(--color-accent))]' : 'text-[rgb(var(--color-accent))]',
                )}
                aria-hidden
              />
              <span className={cn('text-sm', onDark ? 'text-white/90' : 'text-gray-700')}>{bullet}</span>
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <a
            href={props.href}
            className="inline-flex h-14 items-center justify-center rounded-lg bg-[rgb(var(--color-accent))] px-10 text-base font-bold text-white shadow-lg transition hover:bg-[rgb(var(--color-accent))]/90"
          >
            {props.ctaLabel}
          </a>
        </div>
      </div>
    </section>
  )
}

export function ClosingCTAWithList(props: Props) {
  return (
    <Suspense fallback={<View {...props} href={props.ctaUrl || '#'} />}>
      <Inner {...props} />
    </Suspense>
  )
}
