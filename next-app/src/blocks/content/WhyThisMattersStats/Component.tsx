import {
  AlertTriangle,
  TrendingDown,
  Users,
  HeartPulse,
  BookX,
  Pill,
  type LucideIcon,
} from 'lucide-react'
import type { Props } from './schema'

const ICON_MAP: Record<Props['stats'][number]['iconName'], LucideIcon> = {
  alert: AlertTriangle,
  'trending-down': TrendingDown,
  users: Users,
  'heart-pulse': HeartPulse,
  'book-x': BookX,
  pill: Pill,
}

export function WhyThisMattersStats(props: Props) {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-[1200px] px-6">
        <header className="mx-auto max-w-3xl text-center">
          {props.eyebrow && (
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[rgb(var(--color-primary))]">
              {props.eyebrow}
            </p>
          )}
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">{props.headline}</h2>
          {props.introText && (
            <p className="mt-4 text-lg text-gray-600">{props.introText}</p>
          )}
        </header>
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {props.stats.map((stat, i) => {
            const Icon = ICON_MAP[stat.iconName]
            return (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <Icon className="h-7 w-7" aria-hidden />
                </div>
                <p className="mt-4 text-4xl font-bold text-[rgb(var(--color-primary))] md:text-5xl">
                  {stat.bigText}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{stat.label}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
