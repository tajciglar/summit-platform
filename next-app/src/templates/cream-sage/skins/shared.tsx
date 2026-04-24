import type { Speaker } from '../../types';

/* ============== PALETTE CONSTANTS ============== */
// Deterministic rotation of warm hero-collage gradients.
export const HERO_COLLAGE_GRADIENTS = [
  'linear-gradient(160deg,#D89878,#C4835F)', // rose
  'linear-gradient(160deg,#7A9283,#4A6B5D)', // sage
  'linear-gradient(160deg,#E8B9A0,#D89878)', // rose-light
  'linear-gradient(160deg,#C4835F,#A85430)', // clay
  'linear-gradient(160deg,#4A6B5D,#2F4A40)', // sage-dark
  'linear-gradient(160deg,#B3C3B7,#7A9283)', // sage-soft
];

// Subtle vertical offset (px) per hero-collage item for the "scrapbook" feel.
export const HERO_COLLAGE_OFFSETS = [0, -32, 16, -16, 0, -40];
// Slight rotation (deg) on even items.
export const HERO_COLLAGE_ROTATIONS = [0, 2, 0, -1.5, 0, 1];

export const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#D89878,#C4835F)',
  'linear-gradient(135deg,#7A9283,#4A6B5D)',
  'linear-gradient(135deg,#E8B9A0,#D89878)',
  'linear-gradient(135deg,#4A6B5D,#3D5A4E)',
];

export const SPEAKER_GRADIENTS = [
  'linear-gradient(135deg,#D89878,#C4835F)',
  'linear-gradient(135deg,#7A9283,#4A6B5D)',
  'linear-gradient(135deg,#E8B9A0,#D89878)',
  'linear-gradient(135deg,#4A6B5D,#2F4A40)',
  'linear-gradient(135deg,#D17B4E,#C4663D)',
  'linear-gradient(135deg,#B3C3B7,#7A9283)',
  'linear-gradient(135deg,#DEA389,#C4835F)',
  'linear-gradient(135deg,#3D5A4E,#2F4A40)',
];

export const FOUNDER_GRADIENTS = [
  'linear-gradient(135deg,#D89878,#C4835F)',
  'linear-gradient(135deg,#7A9283,#4A6B5D)',
];

export const TESTIMONIAL_GRADIENTS = [
  'linear-gradient(135deg,#D89878,#C4835F)',
  'linear-gradient(135deg,#7A9283,#4A6B5D)',
  'linear-gradient(135deg,#E8B9A0,#D89878)',
];

// Figures alternate sage / clay for visual rhythm.
export const FIGURE_COLORS = ['#3D5A4E', '#A85430', '#3D5A4E', '#3D5A4E', '#A85430', '#3D5A4E'];

/* ============== SALES CONSTANTS ============== */
export const CS_SALES = {
  CREAM: '#FAF7F2',
  CREAM_DEEP: '#F4EDE2',
  SAGE: '#4A6B5D',
  SAGE_DEEP: '#2F4A40',
  SAGE_SOFT: '#E9EEEA',
  SAGE_LINE: 'rgba(74,107,93,0.15)',
  ROSE: '#E8B9A0',
  ROSE_DEEP: '#D89878',
  CLAY: '#A85430',
  CLAY_DEEP: '#C4663D',
  INK: '#2A2419',
  INK_SOFT: '#3A3221',
  INK_MUTED: '#6B5E4C',
};

export const csSalesIconLabels: Record<string, string> = {
  'infinity': 'Unlimited Access',
  'clipboard': 'Action Blueprints',
  'headphones': 'Audio Edition',
  'captions': 'Subtitles',
  'file-text': 'Transcripts',
  'book': 'Workbook',
};

export type TemplateContext = {
  summitName: string;
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

/* ============== SALES ICONS ============== */
export function CsSalesBonusIcon({ icon }: { icon: string }) {
  const label = csSalesIconLabels[icon] ?? icon;
  const color = CS_SALES.SAGE_DEEP;
  const common = {
    width: 40,
    height: 40,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-label': label,
  };
  if (icon === 'infinity') {
    return (
      <svg {...common}>
        <path d="M18.178 8c5.096 0 5.096 8 0 8-5.095 0-7.133-8-12.739-8-4.585 0-4.585 8 0 8 5.606 0 7.644-8 12.74-8z" />
      </svg>
    );
  }
  if (icon === 'clipboard') {
    return (
      <svg {...common}>
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      </svg>
    );
  }
  if (icon === 'headphones') {
    return (
      <svg {...common}>
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
      </svg>
    );
  }
  if (icon === 'captions') {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="2" ry="2" />
        <path d="M7 15h4" /><path d="M15 15h2" /><path d="M7 11h2" /><path d="M13 11h4" />
      </svg>
    );
  }
  if (icon === 'file-text') {
    return (
      <svg {...common}>
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
      <svg {...common}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    );
  }
  return null;
}

export function CsSalesCheckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke={CS_SALES.SAGE_DEEP}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, marginTop: 3 }}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function CsSalesXIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke={CS_SALES.CLAY}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function CsSalesGiftIcon({ size = 20, color = CS_SALES.CLAY }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  );
}
