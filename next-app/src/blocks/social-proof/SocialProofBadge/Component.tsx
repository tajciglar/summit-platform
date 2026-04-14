import Image from 'next/image'
import { cn } from '@/lib/cn'
import type { Props } from './schema'

export function SocialProofBadge(props: Props) {
  const bg = {
    light: 'bg-gray-50',
    accent: 'bg-[rgb(var(--color-accent))]/10',
    transparent: '',
  }[props.backgroundColor]

  return (
    <section className={cn('py-10 text-center', bg)}>
      <div className="mx-auto flex max-w-[900px] flex-col items-center gap-3 px-6">
        {props.badgeIconUrl && (
          <Image
            src={props.badgeIconUrl}
            alt=""
            width={64}
            height={64}
            unoptimized
            className="h-16 w-auto"
          />
        )}
        {props.badgeText && (
          <div className="text-4xl font-bold text-[rgb(var(--color-primary))] md:text-5xl">
            {props.badgeText}
          </div>
        )}
        <p className="text-lg text-gray-700">{props.headline}</p>
      </div>
    </section>
  )
}
