import type { GlobalSEO } from './seo'
import type { MediaFile } from './media'

/**
 * Brand/theme settings stored per summit.
 * These are consumed by the Astro frontend as CSS custom properties.
 */
export interface BrandSettings {
  /** Hex or CSS colour string, e.g. "#E63946". Used as --color-primary. */
  primaryColor: string
  /** Hex or CSS colour string. Used as --color-secondary. */
  secondaryColor: string
  /** Font family name for headings, e.g. "Playfair Display". */
  fontHeading: string
  /** Font family name for body text, e.g. "Inter". */
  fontBody: string
}

/**
 * Single navigation link in the summit's global menu.
 */
export interface MenuItem {
  id?: string
  label: string
  url: string
  openInNewTab?: boolean
}

/**
 * Top-level summit configuration record.
 * One record per summit domain — scopes all funnels, products, and speakers.
 */
export interface SummitSite {
  id: string
  name: string
  /** URL-safe slug, unique across the platform. */
  slug: string
  /** Production domain, e.g. "adhdsummit.com". Used for multi-domain routing. */
  domain: string
  logo?: MediaFile | null
  favicon?: MediaFile | null
  brand: BrandSettings
  globalSEO?: GlobalSEO | null
  menus: MenuItem[]
  createdAt: string
  updatedAt: string
}
