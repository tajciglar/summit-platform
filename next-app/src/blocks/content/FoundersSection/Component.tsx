'use client'
import { Suspense } from 'react'
import { cn } from '@/lib/cn'
import { useCheckoutUrl } from '@/hooks/useCheckoutUrl'
import type { Props } from './schema'

function Inner(props: Props) {
  const dynamicUrl = useCheckoutUrl()
  const href = dynamicUrl !== '#' ? dynamicUrl : (props.ctaUrl || '#')
  return <View {...props} href={href} />
}

export function FoundersSection(props: Props) {
  return (
    <Suspense fallback={<View {...props} href={props.ctaUrl || '#'} />}>
      <Inner {...props} />
    </Suspense>
  )
}

function View(props: Props & { href: string }) {
  const paragraphs = props.bodyRich.split(/\n{2,}/).filter(Boolean)
  const multiple = props.founders.length > 1

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-10 px-6 md:grid-cols-5 md:gap-14">
        <div className="md:col-span-2">
          <div
            className={cn(
              'grid gap-4',
              multiple ? 'grid-cols-2' : 'grid-cols-1',
            )}
          >
            {props.founders.map((f, i) => (
              <figure key={i} className="text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={f.photoUrl}
                  alt={f.name}
                  className="mx-auto aspect-square w-full rounded-2xl object-cover shadow-md"
                />
                <figcaption className="mt-3">
                  <p className="text-sm font-bold text-gray-900">{f.name}</p>
                  {f.title && <p className="mt-0.5 text-xs text-gray-500">{f.title}</p>}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
        <div className="md:col-span-3">
          {props.eyebrow && (
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[rgb(var(--color-primary))]">
              {props.eyebrow}
            </p>
          )}
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">{props.headline}</h2>
          <div className="mt-5 space-y-4 text-lg leading-relaxed text-gray-700">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {props.ctaLabel && (
            <div className="mt-8">
              <a
                href={props.href}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-[rgb(var(--color-accent))] px-6 text-sm font-medium text-white transition hover:bg-[rgb(var(--color-accent))]/90"
              >
                {props.ctaLabel}
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
