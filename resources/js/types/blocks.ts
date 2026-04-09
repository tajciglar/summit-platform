export interface BlockData {
  type: string
  data: Record<string, unknown>
}

export interface HeroBlockData {
  headline?: string
  subheadline?: string
  body?: string
  cta_text?: string
  cta_url?: string
  background_image?: string
  style?: 'gradient' | 'image_overlay' | 'solid'
}

export interface SpeakerGridBlockData {
  heading?: string
  subheading?: string
  columns?: '2' | '3' | '4'
  show_featured_only?: boolean
}

export interface VideoBlockData {
  video_url: string
  heading?: string
  caption?: string
}

export interface TextBlockData {
  body: string
  width?: 'narrow' | 'medium' | 'wide'
}

export interface ImageBlockData {
  image_url: string
  alt_text?: string
  caption?: string
  width?: 'small' | 'medium' | 'full'
}

export interface CtaBlockData {
  heading?: string
  subheading?: string
  button_text: string
  button_url?: string
  style?: 'primary' | 'accent' | 'dark'
}

export interface TestimonialsBlockData {
  heading?: string
  items: Array<{
    quote: string
    name: string
    title?: string
    photo_url?: string
  }>
}

export interface FaqBlockData {
  heading?: string
  items: Array<{
    question: string
    answer: string
  }>
}

export interface CountdownBlockData {
  heading?: string
  minutes: number
  expired_text?: string
}

export interface PricingCardBlockData {
  heading?: string
  subheading?: string
  features: Array<{ text: string; included: boolean }>
  cta_text?: string
}

export interface DividerBlockData {
  style?: 'line' | 'space' | 'dots'
  size?: 'sm' | 'md' | 'lg'
}

export interface CheckoutFormBlockData {
  heading?: string
  subheading?: string
  button_text?: string
  show_express_checkout?: boolean
}

export interface OrderBumpsBlockData {
  heading?: string
}

export interface UpsellOfferBlockData {
  heading?: string
  subheading?: string
  body?: string
  accept_text?: string
  decline_text?: string
}
