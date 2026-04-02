import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import node from '@astrojs/node'
import sitemap from '@astrojs/sitemap'

/**
 * Astro configuration for the Summit Platform web app.
 *
 * SSR mode is required because:
 * 1. Multi-domain routing reads the Host header at request time
 * 2. CMS content changes must reflect without a rebuild
 * 3. Stripe API routes must run server-side
 * 4. Per-page SEO from CMS must be server-rendered for crawlers
 */
export default defineConfig({
  output: 'server',

  adapter: node({
    /** Standalone mode produces a self-contained Node.js server (no framework lock-in). */
    mode: 'standalone',
  }),

  integrations: [
    react(),
    sitemap(),
  ],

  vite: {
    ssr: {
      /**
       * Prevent Stripe.js from being bundled for SSR — it is browser-only.
       * It is loaded client-side via loadStripe() in React islands only.
       */
      noExternal: ['@stripe/stripe-js', '@stripe/react-stripe-js'],
    },
    optimizeDeps: {
      exclude: ['@summit/types'],
    },
  },

  /** Used by the sitemap integration. Each summit overrides this via virtual host. */
  site: process.env.PUBLIC_SITE_URL ?? 'http://localhost:4321',

  image: {
    /** Use Astro's built-in sharp image service for WebP optimisation. */
    service: { entrypoint: 'astro/assets/services/sharp' },
    remotePatterns: [
      { hostname: '**.b-cdn.net' },
      { hostname: 'localhost' },
    ],
  },
})
