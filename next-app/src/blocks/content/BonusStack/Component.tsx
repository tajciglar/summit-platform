'use client'
import { Suspense } from 'react'
import { Gift } from 'lucide-react'
import { useCheckoutUrl } from '@/hooks/useCheckoutUrl'
import type { Props } from './schema'

function Inner(props: Props) {
  const dynamicUrl = useCheckoutUrl()
  const href = dynamicUrl !== '#' ? dynamicUrl : (props.ctaUrl || '#')
  return <View {...props} href={href} />
}

export function BonusStack(props: Props) {
  return (
    <Suspense fallback={<View {...props} href={props.ctaUrl || '#'} />}>
      <Inner {...props} />
    </Suspense>
  )
}

function View(props: Props & { href: string }) {
  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-16 md:py-20">
      <div className="mx-auto max-w-[1200px] px-6">
        <header className="mx-auto max-w-3xl text-center">
          {props.eyebrow && (
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[rgb(var(--color-accent))]">
              {props.eyebrow}
            </p>
          )}
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">{props.headline}</h2>
          {props.introText && (
            <p className="mt-4 text-lg text-gray-600">{props.introText}</p>
          )}
        </header>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {props.bonuses.map((bonus, i) => (
            <article
              key={i}
              className="flex gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="shrink-0">
                {bonus.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={bonus.imageUrl}
                    alt=""
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-[rgb(var(--color-accent))]/10 text-[rgb(var(--color-accent))]">
                    <Gift className="h-8 w-8" aria-hidden />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-lg font-bold leading-tight text-gray-900">{bonus.title}</h3>
                  {bonus.valueLabel && (
                    <span className="shrink-0 rounded-full bg-[rgb(var(--color-accent))]/10 px-2.5 py-0.5 text-xs font-semibold text-[rgb(var(--color-accent))]">
                      {bonus.valueLabel}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{bonus.description}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-10 text-center">
          <a
            href={props.href}
            className="inline-flex h-12 items-center justify-center rounded-lg bg-[rgb(var(--color-accent))] px-8 text-base font-bold text-white transition hover:bg-[rgb(var(--color-accent))]/90"
          >
            {props.ctaLabel}
          </a>
        </div>
      </div>
    </section>
  )
}
