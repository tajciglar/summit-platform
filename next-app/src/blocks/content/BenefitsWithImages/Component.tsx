import { cn } from '@/lib/cn'
import type { Props } from './schema'

export function BenefitsWithImages(props: Props) {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-6">
        <header className="mx-auto max-w-2xl text-center">
          {props.eyebrow && (
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[rgb(var(--color-primary))]">
              {props.eyebrow}
            </p>
          )}
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">{props.headline}</h2>
        </header>
        <div className="mt-14 space-y-16 md:space-y-24">
          {props.benefits.map((benefit, i) => {
            const imageLeft = i % 2 === 0
            return (
              <div
                key={i}
                className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-14"
              >
                <div className={cn('order-1', imageLeft ? 'md:order-1' : 'md:order-2')}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={benefit.imageUrl}
                    alt=""
                    className="h-auto w-full rounded-xl object-cover shadow-md"
                  />
                </div>
                <div className={cn('order-2', imageLeft ? 'md:order-2' : 'md:order-1')}>
                  <h3 className="text-2xl font-bold text-gray-900 md:text-3xl">{benefit.title}</h3>
                  <p className="mt-4 text-lg leading-relaxed text-gray-700">{benefit.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
