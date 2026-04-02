/**
 * SEO metadata embedded in pages and funnel steps.
 * Maps to the `shared.seo` Strapi component and the `seo` Payload field group.
 */
export interface SEO {
  /** Override page <title>. Falls back to summit globalSEO.defaultTitle. */
  title?: string | null
  /** Override meta description. Falls back to summit globalSEO.defaultDescription. */
  description?: string | null
  /** If true, renders <meta name="robots" content="noindex">. */
  noindex?: boolean
}

/**
 * Global SEO settings stored on the SummitSite record.
 * Per-page SEO fields override these.
 */
export interface GlobalSEO {
  defaultTitle?: string | null
  defaultDescription?: string | null
  /** If true, ALL pages on this summit are noindexed regardless of per-page setting. */
  globalNoindex?: boolean
}
