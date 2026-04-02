/**
 * ActiveCampaign API integration — server-side only.
 *
 * This module is NEVER imported from client-side code (React islands or
 * browser <script> tags). The AC API key must never be exposed to the client.
 * All calls go through Astro API routes.
 *
 * Implements:
 * - Contact create or update (upsert via /contact/sync)
 * - Tag application (optin tag, product purchase tag)
 * - UTM parameter storage as contact custom fields
 */

import type { UTMParams } from './utm'

const AC_API_URL = import.meta.env.AC_API_URL
const AC_API_KEY = import.meta.env.AC_API_KEY

interface ACContact {
  email: string
  firstName?: string
  lastName?: string
  fieldValues?: Array<{ field: string; value: string }>
}

interface ACContactSyncResponse {
  contact: { id: string }
}

interface ACTagResponse {
  contactTag: { id: string }
}

/**
 * Base fetch wrapper for the ActiveCampaign v3 API.
 */
async function acFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!AC_API_URL || !AC_API_KEY) {
    throw new Error('[activecampaign.ts] AC_API_URL or AC_API_KEY is not configured')
  }

  const url = `${AC_API_URL}/api/3${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      'Api-Token': AC_API_KEY,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`[activecampaign.ts] AC API error ${res.status}: ${body}`)
  }

  return res.json() as Promise<T>
}

/**
 * Create or update an ActiveCampaign contact.
 * Uses the /contact/sync endpoint which upserts by email address.
 *
 * @returns The ActiveCampaign contact ID (string)
 */
export async function createOrUpdateContact(params: {
  email: string
  name?: string
  utmParams?: UTMParams
}): Promise<string> {
  const [firstName, ...lastParts] = (params.name ?? '').split(' ')
  const lastName = lastParts.join(' ')

  const fieldValues: Array<{ field: string; value: string }> = []

  if (params.utmParams) {
    const utmFieldMap: Record<string, string> = {
      utm_source: '%UTM_SOURCE%',   // Replace with your AC custom field IDs
      utm_medium: '%UTM_MEDIUM%',
      utm_campaign: '%UTM_CAMPAIGN%',
      utm_content: '%UTM_CONTENT%',
      utm_term: '%UTM_TERM%',
    }
    for (const [key, fieldId] of Object.entries(utmFieldMap)) {
      const value = params.utmParams[key as keyof UTMParams]
      if (value) {
        fieldValues.push({ field: fieldId, value })
      }
    }
  }

  const contact: ACContact = {
    email: params.email,
    firstName: firstName ?? '',
    lastName: lastName ?? '',
    ...(fieldValues.length > 0 ? { fieldValues } : {}),
  }

  const data = await acFetch<ACContactSyncResponse>('/contact/sync', {
    method: 'POST',
    body: JSON.stringify({ contact }),
  })

  return data.contact.id
}

/**
 * Apply one or more tags to an ActiveCampaign contact.
 * Tags are referenced by tag name (string). If a tag does not exist in AC,
 * this will throw — ensure all tag names are created in AC first.
 *
 * @param contactId - AC contact ID returned by createOrUpdateContact
 * @param tagNames - Array of tag names to apply (e.g. ['summit-optin', 'summit-buyer'])
 */
export async function applyTagsToContact(
  contactId: string,
  tagNames: string[]
): Promise<void> {
  // Fetch tag IDs by name
  const tagIds = await Promise.all(tagNames.map((name) => resolveTagId(name)))

  // Apply each tag
  await Promise.all(
    tagIds.map((tagId) =>
      acFetch<ACTagResponse>('/contactTags', {
        method: 'POST',
        body: JSON.stringify({
          contactTag: {
            contact: contactId,
            tag: tagId,
          },
        }),
      })
    )
  )
}

/**
 * Resolve an ActiveCampaign tag name to its numeric ID.
 * Creates the tag if it does not exist.
 */
async function resolveTagId(tagName: string): Promise<string> {
  interface TagListResponse {
    tags: Array<{ id: string; tag: string }>
  }

  const encodedName = encodeURIComponent(tagName)
  const list = await acFetch<TagListResponse>(`/tags?search=${encodedName}`)
  const existing = list.tags.find((t) => t.tag === tagName)
  if (existing) return existing.id

  // Create tag if not found
  interface TagCreateResponse {
    tag: { id: string }
  }
  const created = await acFetch<TagCreateResponse>('/tags', {
    method: 'POST',
    body: JSON.stringify({ tag: { tag: tagName, tagType: 'contact', description: '' } }),
  })
  return created.tag.id
}

/**
 * High-level helper: create/update contact AND apply tags in one call.
 * This is the primary function called from API routes.
 *
 * @example
 * // On optin form submission:
 * await tagContact({ email: 'user@example.com', name: 'Jane', tags: ['summit-optin'], utmParams })
 *
 * // On purchase:
 * await tagContact({ email: 'user@example.com', tags: ['summit-buyer'] })
 */
export async function tagContact(params: {
  email: string
  name?: string
  tags: string[]
  utmParams?: UTMParams
}): Promise<void> {
  const contactId = await createOrUpdateContact({
    email: params.email,
    name: params.name,
    utmParams: params.utmParams,
  })

  if (params.tags.length > 0) {
    await applyTagsToContact(contactId, params.tags)
  }
}
