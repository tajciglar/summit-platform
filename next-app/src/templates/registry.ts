import type { TemplateDefinition } from './types';
import { OpusV1 } from './OpusV1';
import { OpusV1Schema } from './opus-v1.schema';
import { OpusV2 } from './OpusV2';
import { OpusV2Schema } from './opus-v2.schema';
import { OpusV3 } from './OpusV3';
import { OpusV3Schema } from './opus-v3.schema';
import { OpusV4 } from './OpusV4';
import { OpusV4Schema } from './opus-v4.schema';
import { Variant1 } from './Variant1';
import { Variant1Schema } from './variant-1.schema';
import { Variant2 } from './Variant2';
import { Variant2Schema } from './variant-2.schema';
import { Variant3 } from './Variant3';
import { Variant3Schema } from './variant-3.schema';
import { AdhdSummit } from './AdhdSummit';
import { AdhdSummitSchema } from './adhd-summit.schema';

export const templates = {
  'opus-v1': {
    key: 'opus-v1',
    label: 'Editorial (Ochre / Ink)',
    thumbnail: '/template-thumbs/opus-v1.jpg',
    schema: OpusV1Schema,
    Component: OpusV1,
    tags: ['editorial', 'serif', 'warm'] as const,
  },
  'opus-v2': {
    key: 'opus-v2',
    label: 'System (Lime / Ink)',
    thumbnail: '/template-thumbs/opus-v2.jpg',
    schema: OpusV2Schema,
    Component: OpusV2,
    tags: ['modern', 'mono', 'dark'] as const,
  },
  'opus-v3': {
    key: 'opus-v3',
    label: 'Cozy (Cream / Sage)',
    thumbnail: '/template-thumbs/opus-v3.jpg',
    schema: OpusV3Schema,
    Component: OpusV3,
    tags: ['editorial', 'serif', 'warm'] as const,
  },
  'opus-v4': {
    key: 'opus-v4',
    label: 'Violet & Sun',
    thumbnail: '/template-thumbs/opus-v4.jpg',
    schema: OpusV4Schema,
    Component: OpusV4,
    tags: ['editorial', 'warm', 'modern', 'serif'] as const,
  },
  'variant-1': {
    key: 'variant-1',
    label: 'Warm Editorial Summit',
    thumbnail: '/template-thumbs/variant-1.jpg',
    schema: Variant1Schema,
    Component: Variant1,
    tags: ['warm', 'editorial', 'modern'] as const,
  },
  'variant-2': {
    key: 'variant-2',
    label: 'Friendly (Blue / Coral)',
    thumbnail: '/template-thumbs/variant-2.jpg',
    schema: Variant2Schema,
    Component: Variant2,
    tags: ['modern', 'warm'] as const,
  },
  'variant-3': {
    key: 'variant-3',
    label: 'Heartland (Green / Gold)',
    thumbnail: '/template-thumbs/variant-3.jpg',
    schema: Variant3Schema,
    Component: Variant3,
    tags: ['warm', 'modern', 'editorial'] as const,
  },
  'adhd-summit': {
    key: 'adhd-summit',
    label: 'Trusted Family',
    thumbnail: '/template-thumbs/adhd-summit.jpg',
    schema: AdhdSummitSchema,
    Component: AdhdSummit,
    tags: ['warm', 'modern'] as const,
  },
  // Each entry is a TemplateDefinition parameterized on its own content shape.
  // Using `TemplateDefinition<any>` in the satisfies constraint lets each entry
  // preserve its concrete TContent while still enforcing the shape (key, label,
  // thumbnail, schema, Component, tags). The strict `TemplateDefinition<unknown>`
  // constraint would reject concrete components because ComponentType is
  // contravariant in its props and ZodType is invariant in TContent.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} satisfies Record<string, TemplateDefinition<any>>;

export type TemplateKey = keyof typeof templates;
export const templateKeys = Object.keys(templates) as TemplateKey[];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getTemplate(key: string): TemplateDefinition<any> | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (templates as Record<string, TemplateDefinition<any>>)[key] ?? null;
}
