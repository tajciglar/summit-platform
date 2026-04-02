/**
 * Payload CMS Configuration — Summit Platform
 *
 * Bootstraps the Payload instance with all collections, the Lexical rich-text
 * editor, and a database adapter that is selected at runtime based on the
 * `DATABASE_URI` environment variable prefix:
 * - `mongodb://` or `mongodb+srv://` → MongoDB via Mongoose adapter
 * - anything else → PostgreSQL via the postgres adapter
 *
 * Admin UI is served at `/admin` under the Next.js app router.
 * TypeScript types are generated to `src/payload-types.ts`.
 */
import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { SummitSites } from './collections/SummitSites'
import { Funnels } from './collections/Funnels'
import { FunnelSteps } from './collections/FunnelSteps'
import { Products } from './collections/Products'
import { Orders } from './collections/Orders'
import { Speakers } from './collections/Speakers'
import { Media } from './collections/Media'
import { Users } from './collections/Users'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/** Resolve the database adapter from DATABASE_URI at startup. */
const databaseUri = process.env.DATABASE_URI ?? 'mongodb://localhost/summit-payload'
const isMongo = databaseUri.startsWith('mongodb')

export default buildConfig({
  // ── Admin UI ───────────────────────────────────────────────────────────────
  admin: {
    /** The `users` collection provides authentication for the admin panel. */
    user: 'users',
    meta: {
      titleSuffix: '— Summit Platform',
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },

  // ── Collections ────────────────────────────────────────────────────────────
  collections: [
    Users,
    SummitSites,
    Funnels,
    FunnelSteps,
    Products,
    Orders,
    Speakers,
    Media,
  ],

  // ── Rich text editor ───────────────────────────────────────────────────────
  editor: lexicalEditor({}),

  // ── Security ───────────────────────────────────────────────────────────────
  secret: process.env.PAYLOAD_SECRET ?? 'change-me-to-a-long-random-secret-min-32-chars',

  // ── TypeScript codegen ─────────────────────────────────────────────────────
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  // ── Database ───────────────────────────────────────────────────────────────
  db: isMongo
    ? mongooseAdapter({ url: databaseUri })
    : postgresAdapter({ pool: { connectionString: databaseUri } }),

  // ── File uploads ───────────────────────────────────────────────────────────
  upload: {
    limits: {
      /** Maximum upload size: 50 MB */
      fileSize: 50_000_000,
    },
  },
})
