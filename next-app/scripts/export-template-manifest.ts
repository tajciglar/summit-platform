import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { templates, templateKeys } from '../src/templates/registry';

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

const manifest = {
  templates: templateKeys.map((key) => {
    const t = templates[key];
    return {
      key: t.key,
      label: t.label,
      thumbnail: t.thumbnail,
      tags: t.tags,
      jsonSchema: z.toJSONSchema(t.schema),
    };
  }),
};

const outPath = resolve(__dirname, '../public/template-manifest.json');
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(manifest, null, 2));
console.log(`\u2713 Wrote ${manifest.templates.length} templates to ${outPath}`);
