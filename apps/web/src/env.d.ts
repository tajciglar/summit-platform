/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  // ─── CMS ────────────────────────────────────────────────
  readonly CMS_PROVIDER: 'strapi' | 'payload'
  readonly STRAPI_URL: string
  readonly STRAPI_API_TOKEN: string
  readonly PAYLOAD_URL: string

  // ─── Stripe ─────────────────────────────────────────────
  /** Exposed to client via import.meta.env (PUBLIC_ prefix). */
  readonly PUBLIC_STRIPE_KEY: string
  readonly STRIPE_SECRET_KEY: string
  readonly STRIPE_WEBHOOK_SECRET: string

  // ─── Brevo (transactional email) ──────────────────────
  readonly BREVO_API_KEY: string
  readonly BREVO_FROM_EMAIL: string
  readonly BREVO_FROM_NAME: string

  // ─── ClickMagic ────────────────────────────────────────
  readonly CLICKMAGIC_USER_ID: string
  readonly CLICKMAGIC_TRACK_ID: string

  // ─── ActiveCampaign ────────────────────────────────────
  readonly AC_API_URL: string
  readonly AC_API_KEY: string

  // ─── Bunny CDN ──────────────────────────────────────────
  readonly BUNNY_CDN_HOSTNAME: string
  readonly BUNNY_SIGNING_KEY: string

  // ─── Analytics ─────────────────────────────────────────
  readonly PUBLIC_GTM_CONTAINER_ID: string
  readonly PUBLIC_GA4_MEASUREMENT_ID: string
  readonly PUBLIC_FB_PIXEL_ID: string
  readonly PUBLIC_CLARITY_PROJECT_ID: string

  // ─── Supabase ───────────────────────────────────────────
  readonly SUPABASE_URL: string
  readonly SUPABASE_SERVICE_ROLE_KEY: string

  // ─── Site ───────────────────────────────────────────────
  readonly PUBLIC_SITE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/**
 * Extend the global Window interface for GTM dataLayer.
 * This allows typesafe pushes from analytics.ts.
 */
declare global {
  interface Window {
    dataLayer: Record<string, unknown>[]
  }
}
