import { cn } from '@/lib/cn'
import type { Props } from './schema'

export function StatsBar3Item(props: Props) {
  const onPrimary = props.backgroundColor === 'primary'
  const bg = {
    white: 'bg-white',
    light: 'bg-gray-50',
    primary: 'bg-[rgb(var(--color-primary))] text-white',
  }[props.backgroundColor]

  return (
    <section className={cn('py-12 md:py-16', bg)}>
      <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-8 px-6 md:grid-cols-3 md:gap-4">
        {props.stats.map((stat, i) => (
          <div key={i} className="flex flex-col items-center text-center">
            {stat.iconUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={stat.iconUrl} alt="" className="mb-3 h-10 w-10 object-contain" />
            )}
            <div
              className={cn(
                'text-4xl font-bold md:text-5xl',
                onPrimary ? 'text-white' : 'text-[rgb(var(--color-primary))]',
              )}
            >
              {stat.value}
            </div>
            <div
              className={cn(
                'mt-2 text-sm md:text-base',
                onPrimary ? 'text-white/90' : 'text-gray-600',
              )}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
