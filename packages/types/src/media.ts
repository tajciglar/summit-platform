/**
 * Normalised media/file object returned by both Strapi and Payload.
 * The CMS abstraction layer (`lib/cms.ts`) maps CMS-specific formats to this shape.
 */
export interface MediaFile {
  id: string
  /** Fully-qualified URL (absolute). */
  url: string
  alternativeText?: string | null
  caption?: string | null
  width?: number | null
  height?: number | null
  /** MIME type, e.g. "image/webp", "application/pdf" */
  mime?: string | null
  /** File size in bytes. */
  size?: number | null
  name: string
}
