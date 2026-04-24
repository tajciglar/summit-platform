import type { Speaker } from '../../types';

/* Hero portrait card gradients — violet/sun/mist rotation per v4 HTML. */
export const HERO_CARD_GRADIENTS = [
  'linear-gradient(160deg,#4A2FB8,#23135F)',
  'linear-gradient(160deg,#FFC300,#B88C00)',
  'linear-gradient(160deg,#C6C1DB,#7E7399)',
  'linear-gradient(160deg,#8A6EEB,#5C3BDF)',
];

export const HERO_CARD_NAME_COLORS = ['#FFFFFF', '#23135F', '#23135F', '#FFFFFF'];
export const HERO_CARD_TITLE_COLORS = ['#C5B8F7', '#381F8E', '#381F8E', '#C5B8F7'];

/* Hero bottom avatar strip gradients (mini 4-up). */
export const HERO_AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#FFC300,#FFD347)',
  'linear-gradient(135deg,#8A6EEB,#4A2FB8)',
  'linear-gradient(135deg,#C6C1DB,#A59DC2)',
  'linear-gradient(135deg,#FFD347,#FFC300)',
];

export const HERO_AVATAR_TEXT_COLORS = ['#4A2FB8', '#FFFFFF', '#4A2FB8', '#4A2FB8'];

/* Speaker-day grid avatar gradients (8-up cycle). */
export const SPEAKER_GRADIENTS = [
  'linear-gradient(135deg,#6F4EE6,#4A2FB8)',
  'linear-gradient(135deg,#FFC300,#B88C00)',
  'linear-gradient(135deg,#8A6EEB,#5C3BDF)',
  'linear-gradient(135deg,#23135F,#4A2FB8)',
  'linear-gradient(135deg,#C6C1DB,#7E7399)',
  'linear-gradient(135deg,#4A2FB8,#23135F)',
  'linear-gradient(135deg,#FFD347,#FFC300)',
  'linear-gradient(135deg,#6F4EE6,#8A6EEB)',
];

export const SPEAKER_INITIAL_COLORS = [
  '#FFFFFF',
  '#23135F',
  '#FFFFFF',
  '#FFC300',
  '#23135F',
  '#FFFFFF',
  '#23135F',
  '#FFFFFF',
];

/* Founders avatars. */
export const FOUNDER_GRADIENTS = [
  'linear-gradient(135deg,#6F4EE6,#4A2FB8)',
  'linear-gradient(135deg,#FFC300,#FFD347)',
];

export const FOUNDER_TEXT_COLORS = ['#FFFFFF', '#23135F'];

/* Testimonial avatars. */
export const TESTIMONIAL_GRADIENTS = [
  'linear-gradient(135deg,#6F4EE6,#4A2FB8)',
  'linear-gradient(135deg,#FFC300,#FFD347)',
  'linear-gradient(135deg,#8A6EEB,#5C3BDF)',
];

export const TESTIMONIAL_TEXT_COLORS = ['#FFFFFF', '#23135F', '#FFFFFF'];

/* Outcome card icon bg toggle (white vs sun-400). */
export const OUTCOME_ICON_BGS = ['#FFFFFF', '#FFC300'];

/* Figure value color (violet default; accent indexes get warm tones per HTML). */
export const FIGURE_VALUE_COLORS: Record<number, string> = {
  1: '#C4663D',
  4: '#B88C00',
};

/* Deterministic sparkline heights keyed by trend label. */
export const TREND_HEIGHTS: Record<'rising' | 'plateau' | 'falling' | 'volatile', number[]> = {
  rising: [40, 55, 72, 88, 100],
  plateau: [88, 90, 92, 94, 96],
  falling: [100, 85, 68, 50, 35],
  volatile: [55, 92, 40, 78, 62],
};

/* Sales-section palette tokens. */
export const VS_SALES = {
  VIO_DARK: '#23135F',
  VIO_900: '#110833',
  VIO_700: '#4A2FB8',
  VIO_600: '#5C3BDF',
  VIO_500: '#6F4EE6',
  VIO_400: '#8A6EEB',
  VIO_300: '#A08CEF',
  VIO_200: '#C5B8F7',
  VIO_100: '#E6E0FD',
  VIO_50: '#F3F0FE',
  MIST_300: '#C6C1DB',
  MIST_200: '#DCD7E6',
  MIST_100: '#EBE8F0',
  MIST_50: '#F5F3F8',
  SUN_500: '#FFC300',
  SUN_400: '#FFD347',
  SUN_300: '#FFE07A',
  SUN_100: '#FFF6D6',
  INK_900: '#110833',
  INK_700: '#3C2E54',
  INK_600: '#544B75',
};

export const vsSalesIconLabels: Record<string, string> = {
  infinity: 'Unlimited Access',
  clipboard: 'Action Blueprints',
  headphones: 'Audio Edition',
  captions: 'Subtitles',
  'file-text': 'Transcripts',
  book: 'Workbook',
};

export type TemplateContext = {
  brandName: string;
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

/* ============== BRAND MARK ============== */
export function BrandMark() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="28" height="28" rx="10" fill="#FFC300" />
      <path
        d="M10 21 L 14 13 L 18 19 L 22 11"
        stroke="#110833"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/* ============== SHARED SALES ICONS ============== */
export function VsSalesBonusIcon({ icon }: { icon: string }) {
  const label = vsSalesIconLabels[icon] ?? icon;
  const color = VS_SALES.VIO_700;
  if (icon === 'infinity') {
    return (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label={label}>
        <path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z" />
      </svg>
    );
  }
  if (icon === 'clipboard') {
    return (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label={label}>
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      </svg>
    );
  }
  if (icon === 'headphones') {
    return (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label={label}>
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
      </svg>
    );
  }
  if (icon === 'captions') {
    return (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label={label}>
        <rect x="3" y="5" width="18" height="14" rx="2" ry="2" />
        <path d="M7 15h4" />
        <path d="M15 15h2" />
        <path d="M7 11h2" />
        <path d="M13 11h4" />
      </svg>
    );
  }
  if (icon === 'file-text') {
    return (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label={label}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    );
  }
  if (icon === 'book') {
    return (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label={label}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    );
  }
  return null;
}

export function VsCheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 3 }}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function VsXIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function VsArrowRight({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export function VsGiftIcon({ size = 20, color = VS_SALES.VIO_700 }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  );
}

/* Placeholder day used by Speakers skin when no speakers are assigned. */
export function VioletSunPlaceholderDay({ dayNumber, count }: { dayNumber: number; count: number }) {
  return (
    <div className="mb-12" style={{ opacity: 0.45 }} aria-hidden="true">
      <span
        className="inline-block violet-sun-eyebrow px-4 py-2 rounded-full mb-6"
        style={{ background: '#6F4EE6', color: '#FFFFFF' }}
      >
        DAY {String(dayNumber).padStart(2, '0')}
      </span>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
        {Array.from({ length: count }).map((_, idx) => (
          <figure key={`placeholder-${idx}`} className="violet-sun-card-light p-6 text-center">
            <div className="w-28 h-28 rounded-full mx-auto mb-4" style={{ background: '#E2DDF2' }} />
            <div className="h-4 rounded w-24 mx-auto mb-2" style={{ background: '#E2DDF2' }} />
            <div className="h-3 rounded w-16 mx-auto" style={{ background: '#EEE9F9' }} />
          </figure>
        ))}
      </div>
      <p className="text-center mt-6 text-sm" style={{ color: '#6B638A' }}>
        Speakers coming soon — assign them a day in the admin to see them here.
      </p>
    </div>
  );
}
