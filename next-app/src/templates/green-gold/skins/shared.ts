import type { CSSProperties } from 'react';
import type { Speaker } from '../../types';

export type TemplateContext = {
  funnelId: string;
  wpCheckoutRedirectUrl?: string | null;
  wpThankyouRedirectUrl?: string | null;
};

// Deterministic gradient + accent cycles, drawn from the green-gold HTML palette
// (brand-green + gold + teal tints). Cycled by index to keep the AI-fillable
// schema simple while preserving visual intent.
export const SPEAKER_GRADIENTS = [
  'linear-gradient(135deg,#16A34A,#14532D)',
  'linear-gradient(135deg,#0D9488,#0F766E)',
  'linear-gradient(135deg,#EAB308,#CA8A04)',
  'linear-gradient(135deg,#14532D,#1A2E1A)',
  'linear-gradient(135deg,#4ADE80,#16A34A)',
  'linear-gradient(135deg,#15803D,#14532D)',
  'linear-gradient(135deg,#CA8A04,#EAB308)',
  'linear-gradient(135deg,#16A34A,#4ADE80)',
  'linear-gradient(135deg,#14532D,#16A34A)',
];

export const HERO_AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#16A34A,#14532D)',
  'linear-gradient(135deg,#14532D,#1A2E1A)',
  'linear-gradient(135deg,#4ADE80,#16A34A)',
  'linear-gradient(135deg,#EAB308,#CA8A04)',
  'linear-gradient(135deg,#15803D,#14532D)',
  'linear-gradient(135deg,#16A34A,#4ADE80)',
];

export const HERO_SOCIAL_AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#16A34A,#14532D)',
  'linear-gradient(135deg,#EAB308,#CA8A04)',
  'linear-gradient(135deg,#15803D,#14532D)',
  'linear-gradient(135deg,#4ADE80,#16A34A)',
];

export const FOUNDER_GRADIENTS = [
  'linear-gradient(135deg,#16A34A,#14532D)',
  'linear-gradient(135deg,#EAB308,#CA8A04)',
];

export const TESTIMONIAL_GRADIENTS = [
  'linear-gradient(135deg,#16A34A,#14532D)',
  'linear-gradient(135deg,#EAB308,#CA8A04)',
  'linear-gradient(135deg,#0F766E,#115E59)',
];

export const OUTCOME_ICON_BG = [
  '#16A34A',
  '#16A34A',
  '#16A34A',
  '#EAB308',
  '#EAB308',
  '#EAB308',
];

export function initialsFromSpeaker(s: Speaker): string {
  const a = s.firstName?.trim()?.[0] ?? '';
  const b = s.lastName?.trim()?.[0] ?? '';
  return (a + b).toUpperCase() || '??';
}

export function displayName(s: Speaker): string {
  return `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim() || '—';
}

/* =======================================================================
 * SALES SECTION SHARED CONSTANTS
 * ======================================================================= */

export const GG_SALES = {
  GREEN50: '#F0FDF4',
  GREEN100: '#DCFCE7',
  GREEN200: '#BBF7D0',
  GREEN300: '#86EFAC',
  GREEN400: '#4ADE80',
  GREEN500: '#22C55E',
  GREEN600: '#16A34A',
  GREEN700: '#15803D',
  GREEN800: '#166534',
  GREEN900: '#14532D',
  GOLD300: '#FDE68A',
  GOLD400: '#FACC15',
  GOLD500: '#EAB308',
  GOLD600: '#CA8A04',
  GOLD700: '#A16207',
  CREAM: '#FFF9E6',
  CREAM_BORDER: '#F0E1A8',
  INK900: '#1A2E1A',
  INK800: '#1F3520',
  INK700: '#2A3E2B',
  INK600: 'rgba(26,46,26,0.7)',
  INK500: 'rgba(26,46,26,0.55)',
};

export const salesIconLabels: Record<string, string> = {
  'infinity': 'Unlimited Access',
  'clipboard': 'Action Blueprints',
  'headphones': 'Audio Edition',
  'captions': 'Subtitles',
  'file-text': 'Transcripts',
  'book': 'Workbook',
};

/* Sales CTA button — warm-gold filled pill, matches the optin FreeGift CTA
 * so the visual rhyme between step types is preserved. */
export const salesBtnCta: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '1rem 2rem',
  background: GG_SALES.GOLD500,
  color: GG_SALES.INK900,
  fontFamily: 'Poppins, sans-serif',
  fontWeight: 800,
  fontSize: '1.05rem',
  borderRadius: '9999px',
  boxShadow: '0 10px 24px -8px rgba(234,179,8,.6), inset 0 -3px 0 rgba(0,0,0,.08)',
  letterSpacing: '.04em',
  textTransform: 'uppercase',
  textDecoration: 'none',
  border: 'none',
  cursor: 'pointer',
};

export const salesBtnCtaLg: CSSProperties = { ...salesBtnCta, padding: '1.15rem 2.4rem', fontSize: '1.15rem' };

export const salesEyebrow: CSSProperties = {
  fontFamily: 'Poppins, sans-serif',
  fontWeight: 700,
  fontSize: '0.8rem',
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
  color: GG_SALES.GREEN600,
  marginBottom: '0.6rem',
};

export const salesHeadline: CSSProperties = {
  fontFamily: 'Poppins, sans-serif',
  fontWeight: 900,
  fontSize: 'clamp(1.75rem,3vw,2.5rem)',
  color: GG_SALES.INK900,
  lineHeight: 1.15,
  letterSpacing: '-0.01em',
};
