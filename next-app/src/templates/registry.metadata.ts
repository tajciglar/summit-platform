import type { ZodType } from 'zod';
import type { TemplateTag } from './types';
import { OchreInkSchema } from './ochre-ink.schema';
import { LimeInkSchema } from './lime-ink.schema';
import { CreamSageSchema } from './cream-sage.schema';
import { VioletSunSchema } from './violet-sun.schema';
import { RustCreamSchema } from './rust-cream.schema';
import { BlueCoralSchema } from './blue-coral.schema';
import { GreenGoldSchema } from './green-gold.schema';
import { IndigoGoldSchema } from './indigo-gold.schema';
import { LavenderGoldSchema } from './lavender-gold.schema';
import {
  opusV1SupportedSections,
  opusV1SectionOrder,
  opusV1DefaultEnabledSections,
} from './ochre-ink/sections';
import {
  indigoGoldSupportedSections,
  indigoGoldSectionOrder,
  indigoGoldDefaultEnabledSections,
} from './indigo-gold.sections';
import {
  limeInkSupportedSections,
  limeInkSectionOrder,
  limeInkDefaultEnabledSections,
} from './lime-ink.sections';
import {
  creamSageSupportedSections,
  creamSageSectionOrder,
  creamSageDefaultEnabledSections,
} from './cream-sage.sections';

/**
 * Component-free metadata. Used by the manifest-export script so it can
 * generate JSON schemas without loading React components (which transitively
 * import .css files that tsx cannot parse).
 */
export interface TemplateMetadata<TContent = unknown> {
  key: string;
  label: string;
  thumbnail: string;
  schema: ZodType<TContent>;
  tags: readonly TemplateTag[];
  supportedSections?: readonly string[];
  sectionOrder?: readonly string[];
  defaultEnabledSections?: readonly string[];
}

export const templateMetadata = {
  'ochre-ink': {
    key: 'ochre-ink',
    label: 'Editorial (Ochre / Ink)',
    thumbnail: '/template-thumbs/ochre-ink.jpg',
    schema: OchreInkSchema,
    tags: ['editorial', 'serif', 'warm'] as const,
    supportedSections: opusV1SupportedSections,
    sectionOrder: opusV1SectionOrder,
    defaultEnabledSections: opusV1DefaultEnabledSections,
  },
  'lime-ink': {
    key: 'lime-ink',
    label: 'System (Lime / Ink)',
    thumbnail: '/template-thumbs/lime-ink.jpg',
    schema: LimeInkSchema,
    tags: ['modern', 'mono', 'dark'] as const,
    supportedSections: limeInkSupportedSections,
    sectionOrder: limeInkSectionOrder,
    defaultEnabledSections: limeInkDefaultEnabledSections,
  },
  'cream-sage': {
    key: 'cream-sage',
    label: 'Cozy (Cream / Sage)',
    thumbnail: '/template-thumbs/cream-sage.jpg',
    schema: CreamSageSchema,
    tags: ['editorial', 'serif', 'warm'] as const,
    supportedSections: creamSageSupportedSections,
    sectionOrder: creamSageSectionOrder,
    defaultEnabledSections: creamSageDefaultEnabledSections,
  },
  'violet-sun': {
    key: 'violet-sun',
    label: 'Violet & Sun',
    thumbnail: '/template-thumbs/violet-sun.jpg',
    schema: VioletSunSchema,
    tags: ['editorial', 'warm', 'modern', 'serif'] as const,
  },
  'rust-cream': {
    key: 'rust-cream',
    label: 'Warm Editorial Summit',
    thumbnail: '/template-thumbs/rust-cream.jpg',
    schema: RustCreamSchema,
    tags: ['warm', 'editorial', 'modern'] as const,
  },
  'blue-coral': {
    key: 'blue-coral',
    label: 'Friendly (Blue / Coral)',
    thumbnail: '/template-thumbs/blue-coral.jpg',
    schema: BlueCoralSchema,
    tags: ['modern', 'warm'] as const,
  },
  'green-gold': {
    key: 'green-gold',
    label: 'Heartland (Green / Gold)',
    thumbnail: '/template-thumbs/green-gold.jpg',
    schema: GreenGoldSchema,
    tags: ['warm', 'modern', 'editorial'] as const,
  },
  'indigo-gold': {
    key: 'indigo-gold',
    label: 'Trusted Family',
    thumbnail: '/template-thumbs/indigo-gold.jpg',
    schema: IndigoGoldSchema,
    tags: ['warm', 'modern'] as const,
    supportedSections: indigoGoldSupportedSections,
    sectionOrder: indigoGoldSectionOrder,
    defaultEnabledSections: indigoGoldDefaultEnabledSections,
  },
  'lavender-gold': {
    key: 'lavender-gold',
    label: 'APS VIP Pass (Lavender / Gold)',
    thumbnail: '/template-thumbs/lavender-gold.jpg',
    schema: LavenderGoldSchema,
    tags: ['serif', 'warm'] as const,
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} satisfies Record<string, TemplateMetadata<any>>;

export type TemplateKey = keyof typeof templateMetadata;
export const templateKeys = Object.keys(templateMetadata) as TemplateKey[];
