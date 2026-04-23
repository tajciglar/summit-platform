'use client'
import { createContext, useContext, type ReactNode } from 'react'

export interface Speaker {
  id: string
  firstName: string
  lastName: string
  fullName: string
  title: string | null
  photoUrl: string | null
  shortBio: string | null
  longBio: string | null
  dayNumber: number
  masterclassTitle: string | null
  sortOrder: number
}

const SpeakersContext = createContext<Speaker[]>([])

export function SpeakersProvider({
  speakers,
  children,
}: {
  speakers: Speaker[]
  children: ReactNode
}) {
  return <SpeakersContext.Provider value={speakers}>{children}</SpeakersContext.Provider>
}

export function useSpeakers(): Speaker[] {
  return useContext(SpeakersContext)
}

export function useSpeakersByIds(ids: string[]): Speaker[] {
  const all = useSpeakers()
  const map = new Map(all.map((s) => [s.id, s]))
  return ids.map((id) => map.get(id)).filter((s): s is Speaker => !!s)
}

export function useSpeakersByDay(day: number): Speaker[] {
  const all = useSpeakers()
  return all
    .filter((s) => s.dayNumber === day)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}
