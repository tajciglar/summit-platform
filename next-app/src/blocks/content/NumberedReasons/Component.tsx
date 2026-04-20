'use client'
import { Suspense } from 'react'
import { useCheckoutUrl } from '@/hooks/useCheckoutUrl'
import type { Props } from './schema'

function Inner(props: Props) {
  const dynamicUrl = useCheckoutUrl()
  const href = dynamicUrl !== '#' ? dynamicUrl : (props.ctaUrl || '#')
  return <View {...props} href={href} />
}

export function NumberedReasons(props: Props) {
  return (
    <Suspense fallback={<View {...props} href={props.ctaUrl || '#'} />}>
      <Inner {...props} />
    </Suspense>
  )
}

function View(props: Props & { href: string }) {
  return (
    <section className="bg-gray-50 py-16 md:py-20">
      <div className="mx-auto max-w-[900px] px-6">
        <header className="text-center">
          {props.eyebrow && (
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[rgb(var(--color-accent))]">
              {props.eyebrow}
            </p>
          )}
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">{props.headline}</h2>
        </header>
        <ol className="mt-12 space-y-8">
          {props.reasons.map((reason, i) => (
            <li key={i} className="flex gap-5">
              <span
                className="shrink-0 font-bold leading-none text-[rgb(var(--color-primary))]/30"
                style={{ fontSize: '4rem' }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex-1 pt-1">
                <h3 className="text-xl font-bold text-gray-900 md:text-2xl">{reason.title}</h3>
                {reason.description && (
                  <p className="mt-2 text-base leading-relaxed text-gray-600">{reason.description}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
        {props.ctaLabel && (
          <div className="mt-12 text-center">
            <a
              href={props.href}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-[rgb(var(--color-accent))] px-6 text-sm font-medium text-white transition hover:bg-[rgb(var(--color-accent))]/90"
            >
              {props.ctaLabel}
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
