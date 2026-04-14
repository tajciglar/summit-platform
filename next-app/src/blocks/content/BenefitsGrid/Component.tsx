import {
  Star,
  Globe,
  Clock,
  TrendingUp,
  CheckCircle,
  Sparkles,
  Award,
  type LucideIcon,
} from 'lucide-react'
import type { Props } from './schema'

const ICON_MAP: Record<Props['benefits'][number]['iconName'], LucideIcon> = {
  star: Star,
  globe: Globe,
  clock: Clock,
  'trending-up': TrendingUp,
  'check-circle': CheckCircle,
  sparkles: Sparkles,
  award: Award,
}

export function BenefitsGrid(props: Props) {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-[1200px] px-6">
        <header className="mx-auto max-w-2xl text-center">
          {props.eyebrow && (
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[rgb(var(--color-accent))]">
              {props.eyebrow}
            </p>
          )}
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">{props.headline}</h2>
        </header>
        <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {props.benefits.map((benefit, i) => {
            const Icon = ICON_MAP[benefit.iconName]
            return (
              <div key={i} className="flex flex-col items-start">
                <Icon className="h-8 w-8 text-[rgb(var(--color-accent))]" aria-hidden />
                <h3 className="mt-4 text-lg font-bold text-gray-900">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{benefit.description}</p>
              </div>
            )
          })}
        </div>
        {props.ctaLabel && (
          <div className="mt-12 text-center">
            {props.ctaUrl ? (
              <a
                href={props.ctaUrl}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-[rgb(var(--color-accent))] px-6 text-sm font-medium text-white transition hover:bg-[rgb(var(--color-accent))]/90"
              >
                {props.ctaLabel}
              </a>
            ) : (
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-[rgb(var(--color-accent))] px-6 text-sm font-medium text-white transition hover:bg-[rgb(var(--color-accent))]/90"
              >
                {props.ctaLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
