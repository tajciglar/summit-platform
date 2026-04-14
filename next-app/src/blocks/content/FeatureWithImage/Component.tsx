import { Button } from '@/components/ui/button'
import { cn } from '@/lib/cn'
import type { Props } from './schema'

export function FeatureWithImage(props: Props) {
  const imageFirst = props.imagePosition === 'left'
  const paragraphs = props.bodyRich.split(/\n{2,}/).filter(Boolean)

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-10 px-6 md:grid-cols-2 md:gap-16">
        <div className={cn('order-2', imageFirst ? 'md:order-2' : 'md:order-1')}>
          {props.eyebrow && (
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[rgb(var(--color-primary))]">
              {props.eyebrow}
            </p>
          )}
          <h2 className="text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
            {props.headline}
          </h2>
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-gray-700">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {props.ctaLabel && (
            <div className="mt-8">
              {props.ctaUrl ? (
                <a
                  href={props.ctaUrl}
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-[rgb(var(--color-accent))] px-6 text-sm font-medium text-white transition hover:bg-[rgb(var(--color-accent))]/90"
                >
                  {props.ctaLabel}
                </a>
              ) : (
                <Button
                  size="lg"
                  className="bg-[rgb(var(--color-accent))] text-white hover:bg-[rgb(var(--color-accent))]/90"
                >
                  {props.ctaLabel}
                </Button>
              )}
            </div>
          )}
        </div>
        <div className={cn('order-1', imageFirst ? 'md:order-1' : 'md:order-2')}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={props.imageUrl}
            alt=""
            className="h-auto w-full rounded-xl object-cover shadow-lg"
          />
        </div>
      </div>
    </section>
  )
}
