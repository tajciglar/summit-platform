export interface FunnelTheme {
  colors?: {
    primary?: string
    secondary?: string
    accent?: string
    background?: string
    text?: string
    surface?: string
    surface_alt?: string
    muted?: string
    border?: string
  }
  fonts?: {
    heading?: string
    body?: string
  }
  logo_url?: string | null
  logo_alt?: string | null
}

export interface StepContent {
  headline?: string
  subheadline?: string
  body?: string
  cta_text?: string
  hero_image?: string
  video_url?: string
  countdown_minutes?: number
  blocks?: Array<{ type: string; data: Record<string, unknown> }>
}

export interface Speaker {
  name: string
  title: string | null
  bio: string | null
  photo_url: string | null
  masterclass_title: string | null
  is_featured: boolean
}

export interface OrderBumpData {
  id: string
  product_id: string
  headline: string | null
  description: string | null
  bullets: string[]
  checkbox_label: string | null
  image_url: string | null
  price_cents: number
  compare_at_cents: number | null
}

export interface ProductData {
  id: string
  name: string
  price_cents: number
  compare_at_cents: number | null
  currency: string
}

export interface FunnelPageProps {
  summit: {
    id: string
    title: string
    slug: string
    current_phase: string
  }
  funnel: {
    id: string
    name: string
    slug: string
  }
  step: {
    id: string
    name: string
    slug: string
    step_type: string
    sort_order: number
  }
  template: string
  content: StepContent
  theme: FunnelTheme
  isPreview: boolean
}

export interface OptinPageProps extends FunnelPageProps {
  speakers: Speaker[]
}

export interface CheckoutPageProps extends FunnelPageProps {
  product: ProductData | null
  stripeKey: string
  nextStepSlug: string | null
  orderBumps: OrderBumpData[]
}

export interface UpsellPageProps extends FunnelPageProps {
  product: ProductData | null
  nextStepSlug: string | null
  paymentIntentId: string | null
}
