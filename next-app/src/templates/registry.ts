import type { TemplateDefinition } from './types';
import { OpusV1 } from './OpusV1';
import { OpusV1Schema } from './opus-v1.schema';
import { OpusV2 } from './OpusV2';
import { OpusV2Schema } from './opus-v2.schema';

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
