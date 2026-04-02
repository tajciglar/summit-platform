/**
 * CMS Abstraction Layer
 *
 * Single import point for all CMS data fetching. Reads CMS_PROVIDER at
 * module load time and delegates all calls to either the Strapi v5 or
 * Payload v3 client implementation.
 *
 * Both clients return normalised types from @summit/types — no CMS-native
 * response shapes leak out of this module.
 *
 * Usage:
 *   import { getSummitByDomain, getFunnelBySlug } from '~/lib/cms'
 *   // Works identically regardless of CMS_PROVIDER
 *
 * Switching CMS:
 *   Set CMS_PROVIDER=strapi or CMS_PROVIDER=payload in .env and restart.
 */

import type {
  SummitSite,
  Funnel,
  FunnelStep,
  Product,
  Speaker,
  MediaFile,
  BrandSettings,
  MenuItem,
  GlobalSEO,
  SEO,
  Section,
  FunnelStepType,
  FunnelStatus,
  ProductType,
  BillingInterval,
} from '@summit/types'

// ─── Shared helpers ──────────────────────────────────────────────────────────

function normaliseMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.startsWith('http')) return url
  // Relative URL from Strapi — prepend base URL
  const strapiBase = import.meta.env.STRAPI_URL ?? 'http://localhost:1337'
  return `${strapiBase}${url}`
}

// ─── STRAPI V5 CLIENT ────────────────────────────────────────────────────────

/**
 * Strapi v5 REST API response shapes.
 * In v5, attributes are FLATTENED — no nested `attributes` object.
 */
interface StrapiMedia {
  id: number
  documentId: string
  url: string
  alternativeText?: string | null
  caption?: string | null
  width?: number | null
  height?: number | null
  mime?: string | null
  size?: number | null
  name: string
}

interface StrapiListResponse<T> {
  data: T[]
  meta: { pagination: { page: number; pageSize: number; pageCount: number; total: number } }
}

interface StrapiSingleResponse<T> {
  data: T
}

function createStrapiClient() {
  const baseUrl = import.meta.env.STRAPI_URL ?? 'http://localhost:1337'
  const token = import.meta.env.STRAPI_API_TOKEN ?? ''

  async function strapiFetch<T>(path: string): Promise<T> {
    const url = `${baseUrl}/api${path}`
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      // Avoid caching stale CMS data in SSR
      cache: 'no-store',
    })
    if (!res.ok) {
      throw new Error(`[cms/strapi] ${res.status} ${res.statusText} — ${url}`)
    }
    return res.json() as Promise<T>
  }

  // ── Normalisers ──────────────────────────────────────────────────────────

  function normaliseMedia(m: StrapiMedia | null | undefined): MediaFile | null {
    if (!m) return null
    return {
      id: String(m.documentId ?? m.id),
      url: normaliseMediaUrl(m.url) ?? m.url,
      alternativeText: m.alternativeText ?? null,
      caption: m.caption ?? null,
      width: m.width ?? null,
      height: m.height ?? null,
      mime: m.mime ?? null,
      size: m.size ?? null,
      name: m.name,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function normaliseSummitSite(raw: any): SummitSite {
    const brand: BrandSettings = {
      primaryColor: raw.brand?.primaryColor ?? '#3B82F6',
      secondaryColor: raw.brand?.secondaryColor ?? '#1E40AF',
      fontHeading: raw.brand?.fontHeading ?? 'Inter',
      fontBody: raw.brand?.fontBody ?? 'Inter',
    }

    const globalSEO: GlobalSEO | null = raw.globalSEO
      ? {
          defaultTitle: raw.globalSEO.defaultTitle ?? null,
          defaultDescription: raw.globalSEO.defaultDescription ?? null,
          globalNoindex: raw.globalSEO.globalNoindex ?? false,
        }
      : null

    const menus: MenuItem[] = Array.isArray(raw.menus)
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        raw.menus.map((m: any) => ({
          id: m.id ? String(m.id) : undefined,
          label: m.label ?? '',
          url: m.url ?? '/',
          openInNewTab: m.openInNewTab ?? false,
        }))
      : []

    return {
      id: String(raw.documentId ?? raw.id),
      name: raw.name,
      slug: raw.slug,
      domain: raw.domain,
      logo: normaliseMedia(raw.logo),
      favicon: normaliseMedia(raw.favicon),
      brand,
      globalSEO,
      menus,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function normaliseProduct(raw: any): Product {
    return {
      id: String(raw.documentId ?? raw.id),
      name: raw.name,
      slug: raw.slug,
      description: raw.description ?? null,
      summitSiteId: String(raw.summitSite?.documentId ?? raw.summitSite?.id ?? ''),
      type: raw.type as ProductType,
      price: raw.price,
      currency: raw.currency ?? 'eur',
      stripeProductId: raw.stripeProductId ?? null,
      stripePriceId: raw.stripePriceId ?? null,
      billingInterval: (raw.billingInterval as BillingInterval) ?? null,
      trialDays: raw.trialDays ?? null,
      files: Array.isArray(raw.files) ? raw.files : [],
      acTag: raw.acTag ?? null,
      acProductTag: raw.acProductTag ?? null,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function normaliseSpeaker(raw: any): Speaker {
    return {
      id: String(raw.documentId ?? raw.id),
      name: raw.name,
      bio: raw.bio ?? null,
      title: raw.title ?? null,
      photo: normaliseMedia(raw.photo),
      summitSiteId: String(raw.summitSite?.documentId ?? raw.summitSite?.id ?? ''),
      order: raw.order ?? 0,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function normaliseSEO(raw: any): SEO | null {
    if (!raw) return null
    return {
      title: raw.title ?? null,
      description: raw.description ?? null,
      noindex: raw.noindex ?? false,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function normaliseSection(raw: any): Section | null {
    const type = raw.__component?.split('.')[1] // e.g. 'sections.hero' → 'hero'
    if (!type) return null

    switch (type) {
      case 'hero':
        return {
          type: 'hero',
          heading: raw.heading ?? '',
          subheading: raw.subheading ?? null,
          image: normaliseMedia(raw.image),
          ctaText: raw.ctaText ?? null,
          ctaUrl: raw.ctaUrl ?? null,
          layout: raw.layout ?? 'centered',
        }
      case 'features':
        return {
          type: 'features',
          heading: raw.heading ?? null,
          items: Array.isArray(raw.items)
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              raw.items.map((item: any) => ({
                icon: item.icon ?? null,
                title: item.title ?? '',
                description: item.description ?? null,
              }))
            : [],
        }
      case 'testimonials':
        return {
          type: 'testimonials',
          heading: raw.heading ?? null,
          items: Array.isArray(raw.items)
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              raw.items.map((item: any) => ({
                quote: item.quote ?? '',
                author: item.author ?? '',
                role: item.role ?? null,
                avatar: normaliseMedia(item.avatar),
                rating: item.rating ?? null,
              }))
            : [],
        }
      case 'video':
        return {
          type: 'video',
          heading: raw.heading ?? null,
          videoUrl: raw.videoUrl ?? '',
          poster: normaliseMedia(raw.poster),
          caption: raw.caption ?? null,
        }
      case 'cta':
        return {
          type: 'cta',
          heading: raw.heading ?? '',
          subheading: raw.subheading ?? null,
          buttonText: raw.buttonText ?? null,
          buttonUrl: raw.buttonUrl ?? null,
          layout: raw.layout ?? 'centered',
        }
      case 'speakers-list':
        return {
          type: 'speakers',
          heading: raw.heading ?? null,
          subheading: raw.subheading ?? null,
          displayAll: raw.displayAll ?? true,
          speakers: [],
        }
      case 'custom':
        return {
          type: 'custom',
          html: raw.html ?? null,
          identifier: raw.identifier ?? null,
        }
      default:
        return null
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function normaliseFunnelStep(raw: any): FunnelStep {
    const sections = Array.isArray(raw.sections)
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        raw.sections.map((s: any) => normaliseSection(s)).filter((s): s is Section => s !== null)
      : []

    return {
      id: String(raw.documentId ?? raw.id),
      title: raw.title,
      slug: raw.slug,
      type: raw.type as FunnelStepType,
      order: raw.order ?? 0,
      template: raw.template ?? null,
      products: Array.isArray(raw.products) ? raw.products.map(normaliseProduct) : [],
      seo: normaliseSEO(raw.seo),
      sections,
      funnelId: String(raw.funnel?.documentId ?? raw.funnel?.id ?? ''),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function normaliseFunnel(raw: any): Funnel {
    const steps = Array.isArray(raw.steps)
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        raw.steps.map((s: any) => normaliseFunnelStep(s)).sort((a, b) => a.order - b.order)
      : []

    return {
      id: String(raw.documentId ?? raw.id),
      name: raw.name,
      slug: raw.slug,
      summitSiteId: String(raw.summitSite?.documentId ?? raw.summitSite?.id ?? ''),
      status: raw.status as FunnelStatus,
      steps,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    }
  }

  // ── Public methods ────────────────────────────────────────────────────────

  async function getSummitByDomain(domain: string): Promise<SummitSite | null> {
    const qs = new URLSearchParams({
      'filters[domain][$eq]': domain,
      'populate[logo]': '*',
      'populate[favicon]': '*',
      'populate[brand]': '*',
      'populate[globalSEO]': '*',
      'populate[menus]': '*',
    })
    const res = await strapiFetch<StrapiListResponse<unknown>>(`/summit-sites?${qs}`)
    const raw = res.data[0]
    return raw ? normaliseSummitSite(raw) : null
  }

  async function getFunnelBySlug(summitSiteId: string, funnelSlug: string): Promise<Funnel | null> {
    const qs = new URLSearchParams({
      'filters[slug][$eq]': funnelSlug,
      'filters[summitSite][documentId][$eq]': summitSiteId,
      'filters[status][$eq]': 'active',
      'populate[summitSite]': '*',
      'populate[steps][populate][products]': '*',
      'populate[steps][populate][seo]': '*',
      'populate[steps][populate][sections][populate]': '*',
    })
    const res = await strapiFetch<StrapiListResponse<unknown>>(`/funnels?${qs}`)
    const raw = res.data[0]
    return raw ? normaliseFunnel(raw) : null
  }

  async function getFunnelStep(funnelId: string, stepSlug: string): Promise<FunnelStep | null> {
    const qs = new URLSearchParams({
      'filters[slug][$eq]': stepSlug,
      'filters[funnel][documentId][$eq]': funnelId,
      'populate[funnel]': '*',
      'populate[products]': '*',
      'populate[seo]': '*',
      'populate[sections][populate]': '*',
    })
    const res = await strapiFetch<StrapiListResponse<unknown>>(`/funnel-steps?${qs}`)
    const raw = res.data[0]
    return raw ? normaliseFunnelStep(raw) : null
  }

  async function getDefaultFunnel(summitSiteId: string): Promise<Funnel | null> {
    const qs = new URLSearchParams({
      'filters[summitSite][documentId][$eq]': summitSiteId,
      'filters[status][$eq]': 'active',
      'sort': 'createdAt:asc',
      'pagination[limit]': '1',
      'populate[summitSite]': '*',
      'populate[steps][populate][products]': '*',
      'populate[steps][populate][seo]': '*',
      'populate[steps][populate][sections][populate]': '*',
    })
    const res = await strapiFetch<StrapiListResponse<unknown>>(`/funnels?${qs}`)
    const raw = res.data[0]
    return raw ? normaliseFunnel(raw) : null
  }

  async function getProducts(summitSiteId: string): Promise<Product[]> {
    const qs = new URLSearchParams({
      'filters[summitSite][documentId][$eq]': summitSiteId,
      'pagination[limit]': '100',
    })
    const res = await strapiFetch<StrapiListResponse<unknown>>(`/products?${qs}`)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return res.data.map((r: any) => normaliseProduct(r))
  }

  async function getSpeakers(summitSiteId: string): Promise<Speaker[]> {
    const qs = new URLSearchParams({
      'filters[summitSite][documentId][$eq]': summitSiteId,
      'populate[photo]': '*',
      'sort': 'order:asc',
      'pagination[limit]': '100',
    })
    const res = await strapiFetch<StrapiListResponse<unknown>>(`/speakers?${qs}`)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return res.data.map((r: any) => normaliseSpeaker(r))
  }

  return { getSummitByDomain, getFunnelBySlug, getFunnelStep, getDefaultFunnel, getProducts, getSpeakers }
}

// ─── PAYLOAD V3 CLIENT ───────────────────────────────────────────────────────

function createPayloadClient() {
  const baseUrl = import.meta.env.PAYLOAD_URL ?? 'http://localhost:3001'

  async function payloadFetch<T>(path: string): Promise<T> {
    const url = `${baseUrl}/api${path}`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) {
      throw new Error(`[cms/payload] ${res.status} ${res.statusText} — ${url}`)
    }
    return res.json() as Promise<T>
  }

  interface PayloadListResponse<T> {
    docs: T[]
    totalDocs: number
    page: number
    totalPages: number
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function normaliseMedia(m: any): MediaFile | null {
    if (!m) return null
    return {
      id: String(m.id),
      url: normaliseMediaUrl(m.url) ?? m.url,
      alternativeText: m.alt ?? null,
      caption: m.caption ?? null,
      width: m.width ?? null,
      height: m.height ?? null,
      mime: m.mimeType ?? null,
      size: m.filesize ?? null,
      name: m.filename ?? m.id,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function normaliseSummitSite(raw: any): SummitSite {
    const brand: BrandSettings = {
      primaryColor: raw.brand?.primaryColor ?? '#3B82F6',
      secondaryColor: raw.brand?.secondaryColor ?? '#1E40AF',
      fontHeading: raw.brand?.fontHeading ?? 'Inter',
      fontBody: raw.brand?.fontBody ?? 'Inter',
    }

    const globalSEO: GlobalSEO | null = raw.globalSEO
      ? {
          defaultTitle: raw.globalSEO.defaultTitle ?? null,
          defaultDescription: raw.globalSEO.defaultDescription ?? null,
          globalNoindex: raw.globalSEO.globalNoindex ?? false,
        }
      : null

    const menus: MenuItem[] = Array.isArray(raw.menus)
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        raw.menus.map((m: any, i: number) => ({
          id: String(m.id ?? i),
          label: m.label ?? '',
          url: m.url ?? '/',
          openInNewTab: m.openInNewTab ?? false,
        }))
      : []

    return {
      id: String(raw.id),
      name: raw.name,
      slug: raw.slug,
      domain: raw.domain,
      logo: normaliseMedia(raw.logo),
      favicon: normaliseMedia(raw.favicon),
      brand,
      globalSEO,
      menus,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function normaliseProduct(raw: any): Product {
    return {
      id: String(raw.id),
      name: raw.name,
      slug: raw.slug,
      description: raw.description ?? null,
      summitSiteId: String(raw.summitSite?.id ?? raw.summitSite ?? ''),
      type: raw.type as ProductType,
      price: raw.price,
      currency: raw.currency ?? 'eur',
      stripeProductId: raw.stripeProductId ?? null,
      stripePriceId: raw.stripePriceId ?? null,
      billingInterval: (raw.billingInterval as BillingInterval) ?? null,
      trialDays: raw.trialDays ?? null,
      files: Array.isArray(raw.files) ? raw.files : [],
      acTag: raw.acTag ?? null,
      acProductTag: raw.acProductTag ?? null,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function normaliseSpeaker(raw: any): Speaker {
    return {
      id: String(raw.id),
      name: raw.name,
      bio: raw.bio ?? null,
      title: raw.title ?? null,
      photo: normaliseMedia(raw.photo),
      summitSiteId: String(raw.summitSite?.id ?? raw.summitSite ?? ''),
      order: raw.order ?? 0,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function normaliseSEO(raw: any): SEO | null {
    if (!raw) return null
    return {
      title: raw.title ?? null,
      description: raw.description ?? null,
      noindex: raw.noindex ?? false,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function normaliseSection(raw: any): Section | null {
    const blockType = raw.blockType as string
    switch (blockType) {
      case 'hero':
        return {
          type: 'hero',
          heading: raw.heading ?? '',
          subheading: raw.subheading ?? null,
          image: normaliseMedia(raw.image),
          ctaText: raw.ctaText ?? null,
          ctaUrl: raw.ctaUrl ?? null,
          layout: raw.layout ?? 'centered',
        }
      case 'features':
        return {
          type: 'features',
          heading: raw.heading ?? null,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          items: Array.isArray(raw.items) ? raw.items.map((item: any) => ({
            icon: item.icon ?? null,
            title: item.title ?? '',
            description: item.description ?? null,
          })) : [],
        }
      case 'testimonials':
        return {
          type: 'testimonials',
          heading: raw.heading ?? null,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          items: Array.isArray(raw.items) ? raw.items.map((item: any) => ({
            quote: item.quote ?? '',
            author: item.author ?? '',
            role: item.role ?? null,
            avatar: normaliseMedia(item.avatar),
            rating: item.rating ?? null,
          })) : [],
        }
      case 'video':
        return {
          type: 'video',
          heading: raw.heading ?? null,
          videoUrl: raw.videoUrl ?? '',
          poster: normaliseMedia(raw.poster),
          caption: raw.caption ?? null,
        }
      case 'cta':
        return {
          type: 'cta',
          heading: raw.heading ?? '',
          subheading: raw.subheading ?? null,
          buttonText: raw.buttonText ?? null,
          buttonUrl: raw.buttonUrl ?? null,
          layout: raw.layout ?? 'centered',
        }
      case 'speakers':
        return {
          type: 'speakers',
          heading: raw.heading ?? null,
          subheading: raw.subheading ?? null,
          displayAll: raw.displayAll ?? true,
          speakers: [],
        }
      case 'custom':
        return {
          type: 'custom',
          html: raw.html ?? null,
          identifier: raw.identifier ?? null,
        }
      default:
        return null
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function normaliseFunnelStep(raw: any): FunnelStep {
    const sections = Array.isArray(raw.sections)
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        raw.sections.map((s: any) => normaliseSection(s)).filter((s): s is Section => s !== null)
      : []

    return {
      id: String(raw.id),
      title: raw.title,
      slug: raw.slug,
      type: raw.type as FunnelStepType,
      order: raw.order ?? 0,
      template: raw.template ?? null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      products: Array.isArray(raw.products) ? raw.products.map((p: any) => normaliseProduct(p)) : [],
      seo: normaliseSEO(raw.seo),
      sections,
      funnelId: String(raw.funnel?.id ?? raw.funnel ?? ''),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function normaliseFunnel(raw: any): Funnel {
    const steps = Array.isArray(raw.steps)
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        raw.steps.map((s: any) => {
          // steps may be populated objects or just IDs
          if (typeof s === 'object' && s.type) return normaliseFunnelStep(s)
          return null
        }).filter((s): s is FunnelStep => s !== null).sort((a, b) => a.order - b.order)
      : []

    return {
      id: String(raw.id),
      name: raw.name,
      slug: raw.slug,
      summitSiteId: String(raw.summitSite?.id ?? raw.summitSite ?? ''),
      status: raw.status as FunnelStatus,
      steps,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    }
  }

  async function getSummitByDomain(domain: string): Promise<SummitSite | null> {
    const qs = new URLSearchParams({
      'where[domain][equals]': domain,
      'depth': '2',
      'limit': '1',
    })
    const res = await payloadFetch<PayloadListResponse<unknown>>(`/summit-sites?${qs}`)
    const raw = res.docs[0]
    return raw ? normaliseSummitSite(raw) : null
  }

  async function getFunnelBySlug(summitSiteId: string, funnelSlug: string): Promise<Funnel | null> {
    const qs = new URLSearchParams({
      'where[slug][equals]': funnelSlug,
      'where[summitSite][equals]': summitSiteId,
      'where[status][equals]': 'active',
      'depth': '3',
      'limit': '1',
    })
    const res = await payloadFetch<PayloadListResponse<unknown>>(`/funnels?${qs}`)
    const raw = res.docs[0]
    return raw ? normaliseFunnel(raw) : null
  }

  async function getFunnelStep(funnelId: string, stepSlug: string): Promise<FunnelStep | null> {
    const qs = new URLSearchParams({
      'where[slug][equals]': stepSlug,
      'where[funnel][equals]': funnelId,
      'depth': '3',
      'limit': '1',
    })
    const res = await payloadFetch<PayloadListResponse<unknown>>(`/funnel-steps?${qs}`)
    const raw = res.docs[0]
    return raw ? normaliseFunnelStep(raw) : null
  }

  async function getDefaultFunnel(summitSiteId: string): Promise<Funnel | null> {
    const qs = new URLSearchParams({
      'where[summitSite][equals]': summitSiteId,
      'where[status][equals]': 'active',
      'sort': 'createdAt',
      'depth': '3',
      'limit': '1',
    })
    const res = await payloadFetch<PayloadListResponse<unknown>>(`/funnels?${qs}`)
    const raw = res.docs[0]
    return raw ? normaliseFunnel(raw) : null
  }

  async function getProducts(summitSiteId: string): Promise<Product[]> {
    const qs = new URLSearchParams({
      'where[summitSite][equals]': summitSiteId,
      'limit': '100',
    })
    const res = await payloadFetch<PayloadListResponse<unknown>>(`/products?${qs}`)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return res.docs.map((r: any) => normaliseProduct(r))
  }

  async function getSpeakers(summitSiteId: string): Promise<Speaker[]> {
    const qs = new URLSearchParams({
      'where[summitSite][equals]': summitSiteId,
      'sort': 'order',
      'depth': '1',
      'limit': '100',
    })
    const res = await payloadFetch<PayloadListResponse<unknown>>(`/speakers?${qs}`)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return res.docs.map((r: any) => normaliseSpeaker(r))
  }

  return { getSummitByDomain, getFunnelBySlug, getFunnelStep, getDefaultFunnel, getProducts, getSpeakers }
}

// ─── Factory — select client at module load time ─────────────────────────────

const provider = import.meta.env.CMS_PROVIDER ?? 'strapi'
const client = provider === 'payload' ? createPayloadClient() : createStrapiClient()

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Fetch a SummitSite by domain name (e.g. "adhdsummit.com").
 * Used for multi-domain routing — the domain comes from the HTTP Host header.
 */
export async function getSummitByDomain(domain: string): Promise<SummitSite | null> {
  return client.getSummitByDomain(domain)
}

/**
 * Fetch an active funnel by its slug, scoped to a summit.
 */
export async function getFunnelBySlug(
  summitSiteId: string,
  funnelSlug: string
): Promise<Funnel | null> {
  return client.getFunnelBySlug(summitSiteId, funnelSlug)
}

/**
 * Fetch a single funnel step by slug within a funnel.
 */
export async function getFunnelStep(
  funnelId: string,
  stepSlug: string
): Promise<FunnelStep | null> {
  return client.getFunnelStep(funnelId, stepSlug)
}

/**
 * Fetch the default (first active) funnel for a summit.
 * Used when visiting the root domain with no funnel slug in the URL.
 */
export async function getDefaultFunnel(summitSiteId: string): Promise<Funnel | null> {
  return client.getDefaultFunnel(summitSiteId)
}

/**
 * Fetch all products belonging to a summit.
 */
export async function getProducts(summitSiteId: string): Promise<Product[]> {
  return client.getProducts(summitSiteId)
}

/**
 * Fetch all speakers for a summit, ordered by their `order` field.
 */
export async function getSpeakers(summitSiteId: string): Promise<Speaker[]> {
  return client.getSpeakers(summitSiteId)
}
