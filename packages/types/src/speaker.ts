import type { MediaFile } from './media'

/**
 * A speaker featured in a summit's Speakers section.
 * Scoped to a single summit.
 */
export interface Speaker {
  id: string
  name: string
  /** Short bio displayed on the speakers section. Supports basic HTML. */
  bio?: string | null
  /** Professional title / credential, e.g. "PhD, Child Psychologist". */
  title?: string | null
  photo?: MediaFile | null
  /** ID of the parent SummitSite. */
  summitSiteId: string
  /** Display order — lower numbers appear first. */
  order?: number
  createdAt: string
  updatedAt: string
}
