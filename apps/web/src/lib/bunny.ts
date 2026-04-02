/**
 * Bunny CDN helpers for URL construction and signed URL generation.
 *
 * Used for:
 * - Converting raw CDN paths to full URLs (public media)
 * - Generating token-authenticated signed URLs for gated post-purchase content
 * - Detecting Bunny stream URLs for proper video embed handling
 */

import { createHash } from 'crypto'

const CDN_HOSTNAME = import.meta.env.BUNNY_CDN_HOSTNAME ?? ''
const SIGNING_KEY = import.meta.env.BUNNY_SIGNING_KEY ?? ''

/**
 * Convert a raw CDN path to a fully-qualified Bunny CDN URL.
 * If the input is already a full URL (http/https), it is returned unchanged.
 *
 * @example
 * getBunnyCdnUrl('/files/summit-guide.pdf')
 * // → 'https://summit-platform.b-cdn.net/files/summit-guide.pdf'
 */
export function getBunnyCdnUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `https://${CDN_HOSTNAME}${cleanPath}`
}

/**
 * Generate a Bunny CDN signed URL for protected file delivery.
 * The URL is only valid for the specified duration and cannot be shared.
 *
 * Uses Bunny's official token-based URL authentication spec:
 * token = md5(signingKey + url_path + expiry_timestamp)
 *
 * @param path - CDN path or full CDN URL
 * @param expirySeconds - How long the signed URL is valid. Default: 3600 (1 hour)
 *
 * @example
 * getSignedBunnyCdnUrl('/files/all-access-recordings.pdf', 86400)
 * // → 'https://summit-platform.b-cdn.net/files/all-access-recordings.pdf?token=...&expires=...'
 */
export function getSignedBunnyCdnUrl(path: string, expirySeconds = 3600): string {
  if (!SIGNING_KEY) {
    // In development without a signing key, fall back to unsigned URL
    console.warn('[bunny.ts] BUNNY_SIGNING_KEY not set — returning unsigned URL')
    return getBunnyCdnUrl(path)
  }

  const expires = Math.floor(Date.now() / 1000) + expirySeconds
  const baseUrl = getBunnyCdnUrl(path)
  const urlObj = new URL(baseUrl)
  const urlPath = urlObj.pathname

  // Bunny token = md5(signingKey + urlPath + expiry)
  const tokenInput = `${SIGNING_KEY}${urlPath}${expires}`
  const token = createHash('md5').update(tokenInput).digest('base64url')

  urlObj.searchParams.set('token', token)
  urlObj.searchParams.set('expires', String(expires))

  return urlObj.toString()
}

/**
 * Determine whether a URL is a Bunny CDN stream URL.
 * Used by VideoSection to choose between Bunny Stream embed and YouTube embed.
 */
export function isBunnyCdnUrl(url: string): boolean {
  if (!CDN_HOSTNAME) return false
  return url.includes(CDN_HOSTNAME) || url.includes('.b-cdn.net')
}

/**
 * Determine whether a URL is a YouTube URL.
 */
export function isYouTubeUrl(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be')
}

/**
 * Extract the YouTube video ID from a YouTube URL.
 * Supports both youtube.com/watch?v= and youtu.be/ formats.
 */
export function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    let videoId: string | null = null

    if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.slice(1)
    } else if (urlObj.hostname.includes('youtube.com')) {
      videoId = urlObj.searchParams.get('v')
    }

    if (!videoId) return null
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`
  } catch {
    return null
  }
}
