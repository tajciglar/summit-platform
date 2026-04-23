'use client'
import { useState } from 'react'
import { useSpeakersByDay, useSpeakersByIds, type Speaker } from '@/lib/speakers-context'
import type { Props } from './schema'

export function SpeakerGridDay(props: Props) {
  const byDay = useSpeakersByDay(props.day)
  const byIds = useSpeakersByIds(props.speakerIds ?? [])
  const speakers = props.speakerIds && props.speakerIds.length > 0 ? byIds : byDay

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-[1200px] px-6">
        <header className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[rgb(var(--color-accent))]">
            {props.dayLabel}
          </p>
          <h2 className="mt-2 text-3xl font-bold text-gray-900 md:text-4xl">
            {props.theme}
          </h2>
          {props.subtitle && (
            <p className="mt-3 text-lg text-gray-600">{props.subtitle}</p>
          )}
        </header>
        {speakers.length === 0 ? (
          <p className="mt-10 text-center text-gray-500">
            Speakers for day {props.day} coming soon.
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {speakers.map((s) => (
              <SpeakerCard key={s.id} speaker={s} expandable={props.expandable} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function SpeakerCard({
  speaker,
  expandable,
}: {
  speaker: Speaker
  expandable: boolean
}) {
  const [open, setOpen] = useState(false)
  const description = open ? speaker.longBio : speaker.shortBio

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="aspect-square bg-gray-100">
        {speaker.photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={speaker.photoUrl}
            alt={speaker.fullName}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-bold text-gray-900">{speaker.fullName}</h3>
        {speaker.title && (
          <p className="mt-1 text-xs font-medium text-gray-600">{speaker.title}</p>
        )}
        {speaker.masterclassTitle && (
          <p className="mt-2 text-sm font-semibold text-[rgb(var(--color-primary))]">
            {speaker.masterclassTitle}
          </p>
        )}
        {description && (
          <p className="mt-2 line-clamp-4 text-sm text-gray-700">{description}</p>
        )}
        {expandable && speaker.longBio && speaker.longBio !== speaker.shortBio && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="mt-3 self-start text-xs font-semibold text-[rgb(var(--color-primary))] underline-offset-2 hover:underline"
          >
            {open ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>
    </article>
  )
}
