import type { BlockRow, StepType } from '@/types/block'
import type { Theme } from './theme-context'

const API_BASE = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8000'
const API_TOKEN = process.env.INTERNAL_API_TOKEN || ''

export interface ResolvedFunnel {
  funnel: { id: string; slug: string; name: string }
  step: { id: string; type: StepType; slug: string }
  summit: { id: string; title: string; description: string; starts_at: string; ends_at: string; current_phase: string }
  theme: Theme
  blocks: BlockRow[]
  speakers: Array<{
    id: string
    firstName: string
    lastName: string
    fullName: string
    title: string | null
    photoUrl: string | null
    shortDescription: string | null
    longDescription: string | null
    dayNumber: number
    masterclassTitle: string | null
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
}

export async function resolveFunnel(params: {
  summitSlug: string
  funnelSlug: string
  stepSlug?: string
}): Promise<ResolvedFunnel | null> {
  const url = new URL('/api/funnels/resolve', API_BASE)
  url.searchParams.set('summit_slug', params.summitSlug)
  url.searchParams.set('funnel_slug', params.funnelSlug)
  if (params.stepSlug) url.searchParams.set('step_slug', params.stepSlug)

  const res = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      ...(API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {}),
    },
    next: { revalidate: 60, tags: [`funnel:${params.summitSlug}:${params.funnelSlug}`] },
  })

  if (res.status === 404) return null
  if (!res.ok) {
    throw new Error(`Funnel resolve failed: ${res.status} ${res.statusText}`)
  }
  return res.json()
}
