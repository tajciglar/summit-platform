import { Heart, Target, BookOpen, Zap, MessageSquare, Users, type LucideIcon } from 'lucide-react'
import type { Props } from './schema'

const ICON_MAP: Record<Props['items'][number]['iconName'], LucideIcon> = {
  heart: Heart,
  target: Target,
  book: BookOpen,
  bolt: Zap,
  message: MessageSquare,
  users: Users,
}

export function LearningOutcomes(props: Props) {
  return (
    <section className="bg-gray-50 py-16 md:py-20">
      <div className="mx-auto max-w-[1200px] px-6">
        <header className="mx-auto max-w-2xl text-center">
          {props.eyebrow && (
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[rgb(var(--color-primary))]">
              {props.eyebrow}
            </p>
          )}
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">{props.headline}</h2>
        </header>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {props.items.map((item, i) => {
            const Icon = ICON_MAP[item.iconName]
            return (
              <div
                key={i}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))]">
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="mt-4 text-lg font-bold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
