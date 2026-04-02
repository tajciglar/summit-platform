/**
 * Access control utilities for Payload CMS.
 *
 * Provides reusable access functions to restrict write operations to
 * authenticated admin users while allowing public read access where needed.
 */
import type { Access } from 'payload'

/**
 * Grants access only to authenticated admin users.
 *
 * A user is considered admin if:
 * - Their `role` field equals `'admin'`, or
 * - They belong to the `users` collection (i.e. any authenticated user).
 *
 * @example
 * // In a collection config:
 * access: {
 *   create: isAdmin,
 *   update: isAdmin,
 *   delete: isAdmin,
 * }
 */
export const isAdmin: Access = ({ req: { user } }) => {
  return Boolean(user?.role === 'admin' || user?.collection === 'users')
}

/**
 * Grants access to authenticated users OR to documents with a `_status`
 * of `'published'` for unauthenticated requests.
 *
 * Useful for collections that have draft/publish workflows where public
 * visitors should only see published content.
 *
 * @example
 * // In a collection config:
 * access: {
 *   read: isAdminOrPublished,
 * }
 */
export const isAdminOrPublished: Access = ({ req: { user } }) => {
  if (user) return true
  return { _status: { equals: 'published' } }
}

/**
 * Allows unrestricted public read access to all records in a collection.
 * Write operations should still be guarded by `isAdmin`.
 */
export const publicRead: Access = () => true
