import type { BlockRow } from '@/types/block'
import type { Theme } from './theme-context'

const API_BASE = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8000'

export interface DraftPreview {
  blocks: BlockRow[]
  summit: {
    id: string
    title: string
    description: string
    starts_at: string
    ends_at: string
    current_phase: string
  }
  theme: Theme
  speakers: Array<{
    id: string
    firstName: string
    lastName: string
    fullName: string
    title: string
    photoUrl: string
    shortDescription: string
    longDescription: string
    dayNumber: number
    masterclassTitle: string
    sortOrder: number
  }>
  products: Array<{
    id: string
    name: string
    description: string
    amountCents: number
    compareAtCents: number | null
    stripePriceId: string | null
  }>
  draft: {
    id: string
    version_number: number
    status: string
  }
}

export async function fetchDraft(token: string): Promise<DraftPreview | null> {
  const url = `${API_BASE}/api/landing-page-drafts/${encodeURIComponent(token)}`

  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })

  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Draft fetch failed: ${res.status} ${res.statusText}`)
  return res.json()
}
