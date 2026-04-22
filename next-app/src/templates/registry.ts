import type { TemplateDefinition } from './types';
import { templateMetadata, templateKeys, type TemplateKey } from './registry.metadata';
import { OchreInk } from './OchreInk';
import { LimeInk } from './LimeInk';
import { CreamSage } from './CreamSage';
import { VioletSun } from './VioletSun';
import { RustCream } from './RustCream';
import { BlueCoral } from './BlueCoral';
import { GreenGold } from './GreenGold';
import { IndigoGold } from './IndigoGold';

export const templates = {
  'ochre-ink': { ...templateMetadata['ochre-ink'], Component: OchreInk },
  'lime-ink': { ...templateMetadata['lime-ink'], Component: LimeInk },
  'cream-sage': { ...templateMetadata['cream-sage'], Component: CreamSage },
  'violet-sun': { ...templateMetadata['violet-sun'], Component: VioletSun },
  'rust-cream': { ...templateMetadata['rust-cream'], Component: RustCream },
  'blue-coral': { ...templateMetadata['blue-coral'], Component: BlueCoral },
  'green-gold': { ...templateMetadata['green-gold'], Component: GreenGold },
  'indigo-gold': { ...templateMetadata['indigo-gold'], Component: IndigoGold },
  // Each entry is a TemplateDefinition parameterized on its own content shape.
  // Using `TemplateDefinition<any>` in the satisfies constraint lets each entry
  // preserve its concrete TContent while still enforcing the shape (key, label,
  // thumbnail, schema, Component, tags). The strict `TemplateDefinition<unknown>`
  // constraint would reject concrete components because ComponentType is
  // contravariant in its props and ZodType is invariant in TContent.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} satisfies Record<string, TemplateDefinition<any>>;

export { templateKeys, type TemplateKey };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getTemplate(key: string): TemplateDefinition<any> | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (templates as Record<string, TemplateDefinition<any>>)[key] ?? null;
}
