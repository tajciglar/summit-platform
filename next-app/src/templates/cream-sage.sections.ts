/**
 * Section keys for the CreamSage ("cozy editorial") template. Shared with
 * `registry.metadata.ts` so Filament can render a per-section enable/disable
 * control, and with `CreamSage.tsx` so the component honors the operator's
 * selection at render time.
 *
 * CreamSage is monolithic (no per-section skin components yet); this registry is
 * the lightweight way to honor `enabled_sections` without extracting every
 * block. A later pass can introduce the full catalog architecture once the
 * section set stabilizes.
 */
export const creamSageSupportedSections = [
  'top-bar',
  'hero',
  'press',
  'stats',
  'overview',
  'speakers',
  'outcomes',
  'free-gift',
  'bonuses',
  'founders',
  'testimonials',
  'pull-quote',
  'figures',
  'shifts',
  'faq',
  'closing-cta',
  'footer',
] as const;

export type CreamSageSectionKey = (typeof creamSageSupportedSections)[number];

export const creamSageSectionOrder: readonly CreamSageSectionKey[] =
  creamSageSupportedSections;

export const creamSageDefaultEnabledSections: readonly CreamSageSectionKey[] =
  creamSageSupportedSections;
