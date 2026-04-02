/**
 * @summit/types
 *
 * Single source of truth for all shared TypeScript types across the
 * summit-platform monorepo. Both the CMS implementations (Strapi, Payload)
 * and the Astro frontend must conform to these interfaces.
 */

export type { SEO, GlobalSEO } from './seo'
export type { MediaFile } from './media'
export type { BrandSettings, MenuItem, SummitSite } from './summit-site'
export type { ProductType, BillingInterval, ProductFile, Product } from './product'
export type { Speaker } from './speaker'
export type {
  HeroSection,
  FeatureItem,
  FeaturesSection,
  TestimonialItem,
  TestimonialsSection,
  VideoSection,
  CTASection,
  SpeakersSection,
  CustomSection,
  Section,
  SectionType,
} from './sections'
export type { FunnelStatus, FunnelStepType, FunnelStep, Funnel } from './funnel'
export type { OrderStatus, OrderItemType, OrderItem, Order } from './order'
export type {
  CMSProvider,
  CMSListResponse,
  CMSPagination,
  CMSResponse,
  CMSError,
  CMSQueryOptions,
} from './cms'
