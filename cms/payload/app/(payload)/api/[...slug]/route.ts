/**
 * Payload REST API Route Handler
 *
 * Mounts the Payload REST API at `/api/[...slug]` under the `(payload)`
 * route group. All standard HTTP methods are forwarded to the corresponding
 * Payload REST handler so the API is fully functional without a separate
 * Express server.
 *
 * Endpoints exposed:
 * - GET    /api/:collection
 * - GET    /api/:collection/:id
 * - POST   /api/:collection
 * - PATCH  /api/:collection/:id
 * - PUT    /api/:collection/:id
 * - DELETE /api/:collection/:id
 * - OPTIONS — CORS preflight
 */
import {
  REST_DELETE,
  REST_GET,
  REST_OPTIONS,
  REST_PATCH,
  REST_POST,
  REST_PUT,
} from '@payloadcms/next/routes'

export {
  REST_DELETE as DELETE,
  REST_GET as GET,
  REST_OPTIONS as OPTIONS,
  REST_PATCH as PATCH,
  REST_POST as POST,
  REST_PUT as PUT,
}
