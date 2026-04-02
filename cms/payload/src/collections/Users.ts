/**
 * Users Collection
 *
 * Powers authentication for the Payload admin panel.
 * Only admins can create, update, or delete user accounts.
 *
 * Slug: `users`
 */
import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'createdAt'],
    description: 'Admin panel users. Only users with the "admin" role can manage content.',
  },
  access: {
    /** Anyone can read their own user record (needed for session). */
    read: ({ req: { user } }) => Boolean(user),
    /** Only existing admins can create new users. */
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Admin role has full access. Editor can manage content but not users.',
      },
    },
  ],
  timestamps: true,
}
