import type { CSSProperties } from 'react';

/**
 * Universal 8-token palette vocabulary shared by every palette-aware template.
 * Hex values are resolved by Laravel's `AudiencePalettes` map and threaded
 * through the API response into React as inline CSS custom properties.
 */
export type Palette = {
  primary: string;
  'primary-contrast': string;
  ink: string;
  paper: string;
  'paper-alt': string;
  muted: string;
  accent: string;
  border: string;
};

/**
 * Produce inline CSS custom properties for a palette.
 * Returns undefined if palette is null/undefined so React omits the style attr
 * and the template's CSS fallback palette takes over.
 */
export function paletteStyle(
  palette: Palette | null | undefined,
): CSSProperties | undefined {
  if (!palette) return undefined;
  return {
    '--primary': palette.primary,
    '--primary-contrast': palette['primary-contrast'],
    '--ink': palette.ink,
    '--paper': palette.paper,
    '--paper-alt': palette['paper-alt'],
    '--muted': palette.muted,
    '--accent': palette.accent,
    '--border': palette.border,
  } as CSSProperties;
}
