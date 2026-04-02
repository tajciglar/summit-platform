import type { MediaFile } from './media'
import type { Speaker } from './speaker'

// ─── Hero ──────────────────────────────────────────────────────────────────

export interface HeroSection {
  type: 'hero'
  heading: string
  subheading?: string | null
  image?: MediaFile | null
  ctaText?: string | null
  ctaUrl?: string | null
  /** Visual layout variant. */
  layout?: 'centered' | 'split-left' | 'split-right'
}

// ─── Features ──────────────────────────────────────────────────────────────

export interface FeatureItem {
  /** Emoji or icon identifier. */
  icon?: string | null
  title: string
  description?: string | null
}

export interface FeaturesSection {
  type: 'features'
  heading?: string | null
  items: FeatureItem[]
}

// ─── Testimonials ──────────────────────────────────────────────────────────

export interface TestimonialItem {
  quote: string
  author: string
  role?: string | null
  avatar?: MediaFile | null
  /** Star rating 1–5. */
  rating?: number | null
}

export interface TestimonialsSection {
  type: 'testimonials'
  heading?: string | null
  items: TestimonialItem[]
}

// ─── Video ─────────────────────────────────────────────────────────────────

export interface VideoSection {
  type: 'video'
  heading?: string | null
  /** Bunny CDN video URL or YouTube embed URL. */
  videoUrl: string
  /** Thumbnail image shown before playback. */
  poster?: MediaFile | null
  caption?: string | null
}

// ─── CTA ───────────────────────────────────────────────────────────────────

export interface CTASection {
  type: 'cta'
  heading: string
  subheading?: string | null
  buttonText?: string | null
  buttonUrl?: string | null
  layout?: 'centered' | 'left' | 'right'
}

// ─── Speakers ──────────────────────────────────────────────────────────────

export interface SpeakersSection {
  type: 'speakers'
  heading?: string | null
  subheading?: string | null
  /** If true, renders all speakers belonging to the summit. */
  displayAll?: boolean
  /** Explicit speaker list (used when displayAll is false). */
  speakers?: Speaker[]
}

// ─── Custom ────────────────────────────────────────────────────────────────

export interface CustomSection {
  type: 'custom'
  /** Raw HTML injected into the page. Sanitise server-side before rendering. */
  html?: string | null
  /** Identifier used to load a hard-coded Astro component by name. */
  identifier?: string | null
}

// ─── Union ─────────────────────────────────────────────────────────────────

export type Section =
  | HeroSection
  | FeaturesSection
  | TestimonialsSection
  | VideoSection
  | CTASection
  | SpeakersSection
  | CustomSection

export type SectionType = Section['type']
