import type { CSSProperties } from 'react';
import type { Palette } from '@/lib/palette';

/**
 * Step-level design-token override bundle. Stored as `page_overrides.tokens`
 * in the canonical JSON. All fields are optional — the template's fallback
 * CSS keeps working when no overrides are set.
 *
 * Scope is intentionally small for v1:
 *   - palette: partial override of the existing 8-token audience Palette
 *   - headingFont / bodyFont: CSS font-family strings (no @font-face yet)
 *
 * Future expansion slots (not yet rendered): spacingScale, radiusScale,
 * per-role overrides, per-element overrides.
 */
export type DesignTokens = {
  palette?: Partial<Palette>;
  headingFont?: string;
  bodyFont?: string;
};

/**
 * Shape of the whole `page_overrides` JSON. Wrapped under a `tokens` key so
 * we can add unrelated overrides (e.g. `sections`, `elements`) later without
 * breaking consumers.
 */
export type PageOverrides = {
  tokens?: DesignTokens;
};

const FONT_FALLBACKS = ', system-ui, -apple-system, Segoe UI, sans-serif';

/**
 * Produce the inline `style` object for a template root that merges optional
 * DesignTokens overrides onto an audience palette. Templates that already use
 * `--primary`, `--accent`, etc. pick up color overrides automatically. Font
 * tokens are exposed as `--heading-font` / `--body-font`.
 */
export function tokensStyle(
  basePalette: Palette | null | undefined,
  tokens: DesignTokens | undefined,
): CSSProperties | undefined {
  const hasPalette = !!basePalette;
  const hasOverrides = !!tokens && (
    !!tokens.palette ||
    !!tokens.headingFont ||
    !!tokens.bodyFont
  );
  if (!hasPalette && !hasOverrides) return undefined;

  const style: Record<string, string> = {};
  if (basePalette) {
    style['--primary'] = basePalette.primary;
    style['--primary-contrast'] = basePalette['primary-contrast'];
    style['--ink'] = basePalette.ink;
    style['--paper'] = basePalette.paper;
    style['--paper-alt'] = basePalette['paper-alt'];
    style['--muted'] = basePalette.muted;
    style['--accent'] = basePalette.accent;
    style['--border'] = basePalette.border;
  }

  if (tokens?.palette) {
    for (const [key, value] of Object.entries(tokens.palette)) {
      if (value) style[`--${key}`] = value;
    }
  }

  if (tokens?.headingFont) {
    style['--heading-font'] = `'${tokens.headingFont}'${FONT_FALLBACKS}`;
  }
  if (tokens?.bodyFont) {
    style['--body-font'] = `'${tokens.bodyFont}'${FONT_FALLBACKS}`;
  }

  return style as CSSProperties;
}

/**
 * Fonts offered in the Filament picker. Strings are literal CSS font-family
 * names — the loading of webfonts happens in the Next.js layout when the
 * template page renders (Next's `next/font` or <link>). For v1 we rely on
 * fonts already loaded by the template layout (Fraunces, Inter, DM Sans,
 * Poppins, Cormorant Garamond); adding a new choice means adding the <link>
 * alongside.
 */
export const DESIGN_FONT_CHOICES: Array<{ value: string; label: string }> = [
  { value: 'Fraunces', label: 'Fraunces' },
  { value: 'Cormorant Garamond', label: 'Cormorant Garamond' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Inter', label: 'Inter' },
  { value: 'DM Sans', label: 'DM Sans' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Nunito', label: 'Nunito' },
];
