/**
 * Payload Admin Panel — Root Page
 *
 * Catch-all route that delegates rendering to Payload's built-in
 * `RootPage` component. Handles all admin UI sub-routes:
 * - `/admin` (dashboard)
 * - `/admin/collections/:slug`
 * - `/admin/collections/:slug/:id`
 * - `/admin/globals/:slug`
 * - etc.
 *
 * `generatePageMetadata` is re-exported as `generateMetadata` so Next.js
 * picks up dynamic `<title>` and `<meta>` tags per admin page.
 */
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import { importMap } from '../importMap'

export { generatePageMetadata as generateMetadata }

export default RootPage
