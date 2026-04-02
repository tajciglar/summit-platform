/**
 * CMS abstraction layer types.
 *
 * The Astro frontend imports only these shapes — never raw Strapi or Payload
 * response formats. The `lib/cms.ts` client maps CMS-specific payloads into
 * these normalised interfaces.
 */

/** Which CMS backend is active. Controlled by the CMS_PROVIDER env variable. */
export type CMSProvider = 'strapi' | 'payload'

/**
 * Paginated list response returned by the CMS abstraction layer.
 * Matches the normalised output of both Strapi and Payload list endpoints.
 */
export interface CMSListResponse<T> {
  data: T[]
  pagination?: CMSPagination
}

export interface CMSPagination {
  page: number
  pageSize: number
  pageCount: number
  total: number
}

/** Single-item response wrapper. */
export interface CMSResponse<T> {
  data: T
}

/** Normalised error returned by the CMS abstraction layer. */
export interface CMSError {
  status: number
  message: string
  details?: unknown
}

/**
 * Query options passed to CMS list methods.
 */
export interface CMSQueryOptions {
  page?: number
  pageSize?: number
  /** Field-based filters, e.g. { summitSiteId: 'abc123' } */
  filters?: Record<string, unknown>
  /** Fields to populate (relations). Abstraction layer maps these per-CMS. */
  populate?: string[]
  sort?: string
}
