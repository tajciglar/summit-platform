import type { Speaker } from '../../types';

// Deterministic sparkline heights keyed by trend label. Keeps the AI-fillable
// schema simple (one enum per figure item) while preserving visual intent.
export const TREND_HEIGHTS: Record<'rising' | 'plateau' | 'falling' | 'volatile', number[]> = {
  rising: [40, 55, 72, 88, 100],
  plateau: [88, 90, 92, 94, 96],
  falling: [100, 85, 68, 50, 35],
  volatile: [55, 92, 40, 78, 62],
};

// Visual gradients for speaker placeholders — deterministic, cycled by index.
// Drawn from the lime-ink HTML palette (ink + lime + indigo tints).
export const SPEAKER_GRADIENTS = [
  'linear-gradient(160deg,#0A0A0B,#27272A)',
  'linear-gradient(160deg,#27272A,#0A0A0B)',
  'linear-gradient(160deg,#0A0A0B,#18181B)',
  'linear-gradient(160deg,#18181B,#27272A)',
  'linear-gradient(160deg,#27272A,#52525B)',
  'linear-gradient(160deg,#0A0A0B,#27272A)',
  'linear-gradient(160deg,#27272A,#0A0A0B)',
  'linear-gradient(160deg,#18181B,#0A0A0B)',
];

export const SPEAKER_ACCENTS = [
  '#C4F245',
  '#FFFFFF',
  '#C4F245',
  '#FFFFFF',
  '#C4F245',
  '#FFFFFF',
  '#C4F245',
  '#FFFFFF',
];

export const HERO_CARD_GRADIENTS = [
  'linear-gradient(135deg,#18181B,#27272A)',
  'linear-gradient(135deg,#27272A,#18181B)',
  'linear-gradient(135deg,#18181B,#27272A)',
  'linear-gradient(135deg,#27272A,#18181B)',
];

export const HERO_CARD_ACCENTS = ['#C4F245', '#6366F1', '#FFFFFF', '#C4F245'];
export const HERO_CARD_BORDERS = [
  '1px solid rgba(196,242,69,0.2)',
  '1px solid rgba(99,102,241,0.2)',
  '1px solid rgba(255,255,255,0.08)',
  '1px solid rgba(196,242,69,0.2)',
];

export const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#C4F245,#AEE02B)',
  'linear-gradient(135deg,#6366F1,#4F46E5)',
  'linear-gradient(135deg,#52525B,#27272A)',
  'linear-gradient(135deg,#DCFF6B,#C4F245)',
];

export const AVATAR_TEXT_COLORS = ['#0A0A0B', '#FFFFFF', '#FFFFFF', '#0A0A0B'];

export const FOUNDER_GRADIENTS = [
  'linear-gradient(135deg,#C4F245,#AEE02B)',
  'linear-gradient(135deg,#6366F1,#4F46E5)',
];

export const FOUNDER_TEXT_COLORS = ['#0A0A0B', '#FFFFFF'];

export const TESTIMONIAL_GRADIENTS = [
  'linear-gradient(135deg,#C4F245,#AEE02B)',
  'linear-gradient(135deg,#6366F1,#4F46E5)',
  'linear-gradient(135deg,#DCFF6B,#C4F245)',
];

export const TESTIMONIAL_TEXT_COLORS = ['#0A0A0B', '#FFFFFF', '#0A0A0B'];

export const SALES_INK = {
  INK900: '#0A0A0B',
  INK800: '#18181B',
  INK700: '#27272A',
  INK600: '#3F3F46',
  INK500: '#52525B',
  INK400: '#71717A',
  INK300: '#A1A1AA',
  SURFACE: '#F4F4F5',
  SURFACE_BORDER: '#E4E4E7',
  LIME: '#C4F245',
  LIME_SOFT: '#DCFF6B',
  LIME_DARK: '#AEE02B',
};

export type TemplateContext = {
  topBarName: string;
  heroCtaLabel: string;
  wpCheckoutRedirectUrl?: string | null;
  wpThankyouRedirectUrl?: string | null;
};

export function initialsFromSpeaker(s: Speaker): string {
  const a = s.firstName?.trim()?.[0] ?? '';
  const b = s.lastName?.trim()?.[0] ?? '';
  return (a + b).toUpperCase() || '??';
}

export function displayName(s: Speaker): string {
  return `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim() || '—';
}

const salesIconLabels: Record<string, string> = {
  'infinity': 'Unlimited Access',
  'clipboard': 'Action Blueprints',
  'headphones': 'Audio Edition',
  'captions': 'Subtitles',
  'file-text': 'Transcripts',
  'book': 'Workbook',
};

export function SalesBonusIcon({ icon }: { icon: string }) {
  const label = salesIconLabels[icon] ?? icon;
  const color = SALES_INK.LIME;
  if (icon === 'infinity') {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label={label}>
        <path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z" />
      </svg>);

  }
  if (icon === 'clipboard') {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label={label}>
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      </svg>);

  }
  if (icon === 'headphones') {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label={label}>
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
      </svg>);

  }
  if (icon === 'captions') {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label={label}>
        <rect x="3" y="5" width="18" height="14" rx="2" ry="2" />
        <path d="M7 15h4" /><path d="M15 15h2" /><path d="M7 11h2" /><path d="M13 11h4" />
      </svg>);

  }
  if (icon === 'file-text') {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label={label}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>);

  }
  if (icon === 'book') {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label={label}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>);

  }
  return null;
}

export function SalesCheckIcon({ color = SALES_INK.LIME }: { color?: string } = {}) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 3 }}>
      <polyline points="20 6 9 17 4 12" />
    </svg>);

}

export function SalesXIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>);

}

export function SalesArrowRight({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>);

}

export function SalesGiftIcon({ size = 18, color = SALES_INK.LIME }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>);

}
