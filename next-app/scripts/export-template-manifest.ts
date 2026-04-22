import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import {
  templateMetadata,
  templateKeys,
  type TemplateMetadata,
} from '../src/templates/registry.metadata';
import { catalog, catalogKeys } from '../src/sections/catalog';

// Note on the JSON Schema conversion library choice:
//
// The plan originally specified `zod-to-json-schema`, but that package
// (3.25.x latest) was written against Zod v3's internal representation
// and silently emits an empty schema for Zod v4 objects (this project
// uses `zod@^4.3.6`). Rather than pinning an incompatible dep, we use
// Zod v4's built-in `z.toJSONSchema()` — the canonical approach for v4.
// Output target is JSON Schema 2020-12 (the v4 default); Laravel readers
// should accept that draft.

const __dirname = dirname(fileURLToPath(import.meta.url));

// Build catalog block (shared across templates). Keyed by section key so
// Laravel / the AI pipeline can look up schemas + metadata by catalog key.
const catalogOut: Record<string, unknown> = {};
for (const key of catalogKeys) {
  const entry = catalog[key];
  catalogOut[key] = {
    key: entry.key,
    label: entry.label,
    description: entry.description,
    tier: entry.tier,
    pageTypes: entry.pageTypes,
    defaultOrder: entry.defaultOrder,
    schema: z.toJSONSchema(entry.schema),
  };
}

const manifestTemplates = templateKeys.map((key) => {
  // Narrow to the shared TemplateMetadata interface so optional
  // section fields are visible. The metadata uses `satisfies` to preserve
  // each concrete TContent, which hides the optional fields from the union.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = templateMetadata[key] as TemplateMetadata<any>;
  // Base manifest entry — unchanged from Phase 1.
  const base: Record<string, unknown> = {
    key: t.key,
    label: t.label,
    thumbnail: t.thumbnail,
    tags: t.tags,
    jsonSchema: z.toJSONSchema(t.schema),
  };

  // Per-template section metadata — additive. Templates without
  // `supportedSections` continue to emit only `jsonSchema`.
  //
  // Two shapes are supported:
  //  1. Catalog-backed templates (ochre-ink): every section key resolves to a
  //     shared catalog entry, so we also emit `sectionSchemas` for per-section
  //     editing in Filament.
  //  2. Monolithic templates with section toggles (indigo-gold): keys are
  //     template-private. We emit the key list + ordering + default enabled set
  //     so Filament can render an enable/disable toggle UI, but no
  //     `sectionSchemas` block (per-section editing isn't available yet).
  if (t.supportedSections) {
    const sectionSchemas: Record<string, unknown> = {};
    for (const sectionKey of t.supportedSections) {
      const entry = catalog[sectionKey];
      if (!entry) continue;
      sectionSchemas[sectionKey] = z.toJSONSchema(entry.schema);
    }
    base.supportedSections = [...t.supportedSections];
    base.sectionOrder = t.sectionOrder ? [...t.sectionOrder] : [...t.supportedSections];
    base.defaultEnabledSections = t.defaultEnabledSections
      ? [...t.defaultEnabledSections]
      : [...t.supportedSections];
    if (t.defaultSalesSections) {
      base.defaultSalesSections = [...t.defaultSalesSections];
    }
    if (t.catalogBacked) {
      base.sectionSchemas = sectionSchemas;
    }
  }

  return base;
});

const manifest = {
  catalog: catalogOut,
  templates: manifestTemplates,
};

const outPath = resolve(__dirname, '../public/template-manifest.json');
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(manifest, null, 2));
console.log(
  `\u2713 Wrote ${manifest.templates.length} templates + ${
    Object.keys(manifest.catalog).length
  } catalog entries to ${outPath}`,
);
