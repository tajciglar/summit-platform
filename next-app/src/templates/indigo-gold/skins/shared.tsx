import type { CSSProperties } from 'react';
import type { Speaker } from '../../types';

/* =======================================================================
 * Palette tokens — preserved from the monolithic IndigoGold.tsx so the
 * extracted skins render identical HTML/CSS. Kept here so every skin
 * imports from a single source of truth.
 * ======================================================================= */
export const LAV = {
  c50: '#F4F0FB',
  c100: '#ECE6F7',
  c200: '#DDD2F0',
  c300: '#C5B5E4',
  c400: '#A891D1',
  c500: '#8C72BF',
  c600: '#6E57A3',
  c700: '#5A4589',
};

export const SUN = {
  c300: '#FFE066',
  c400: '#FFD93D',
  c500: '#FFCE29',
  c600: '#E9B60C',
};

export const INK = {
  c900: '#1B132C',
  c800: '#2A1F3F',
  c700: '#3C2E54',
  c600: '#5A4989',
};

export const LAV_SALES = {
  LAV50: '#F4F0FB',
  LAV100: '#ECE6F7',
  LAV200: '#DDD2F0',
  LAV300: '#C5B5E4',
  LAV400: '#A891D1',
  LAV500: '#8C72BF',
  LAV700: '#5A4589',
  SUN400: '#FFD93D',
  SUN300: '#FFE066',
  INK900: '#1B132C',
  INK800: '#2A1F3F',
  INK700: '#3C2E54',
};

/* Speaker photo fallback: deterministic pravatar avatars so the visual
 * never collapses to monograms when a summit was seeded without photos. */
export const FALLBACK_AVATAR_SLOTS = [
  12, 5, 47, 68, 33, 59, 45, 16, 49, 20, 60, 23, 44, 10, 28, 30, 26, 58, 41, 65, 24, 36, 52, 19, 9, 67, 48, 18, 31, 13,
];

export function hashToIndex(id: string | number, modulo: number): number {
  const s = String(id);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % modulo;
}

export function speakerPhoto(s: Speaker, size: number = 200): string {
  if (s.photoUrl) return s.photoUrl;
  const slot = FALLBACK_AVATAR_SLOTS[hashToIndex(s.id, FALLBACK_AVATAR_SLOTS.length)];
  return `https://i.pravatar.cc/${size}?img=${slot}`;
}

export function displayName(s: Speaker): string {
  return `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim() || '—';
}

/* =======================================================================
 * Icon sprite — rendered once at the top of the layout, then referenced
 * by `<use href="#ig-*" />` from the Icon component below.
 * ======================================================================= */
export function IconSprite() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <symbol id="ig-arrow-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </symbol>
        <symbol id="ig-arrow-up-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <line x1="7" y1="17" x2="17" y2="7" />
          <polyline points="7 7 17 7 17 17" />
        </symbol>
        <symbol id="ig-star" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </symbol>
        <symbol id="ig-gift" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 12 20 22 4 22 4 12" />
          <rect x="2" y="7" width="20" height="5" />
          <line x1="12" y1="22" x2="12" y2="7" />
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
        </symbol>
        <symbol id="ig-clock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </symbol>
        <symbol id="ig-users" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </symbol>
        <symbol id="ig-trending" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
          <polyline points="16 7 22 7 22 13" />
        </symbol>
        <symbol id="ig-heart" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </symbol>
        <symbol id="ig-brain" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2z" />
          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2z" />
        </symbol>
        <symbol id="ig-message" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </symbol>
        <symbol id="ig-book" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </symbol>
        <symbol id="ig-chevron-down" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </symbol>
        <symbol id="ig-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </symbol>
        <symbol id="ig-shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </symbol>
        <symbol id="ig-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </symbol>
        <symbol id="ig-info" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </symbol>
        <symbol id="ig-target" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </symbol>
        <symbol id="ig-school" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10L12 3 2 10l10 7 10-7z" />
          <path d="M6 12v5a6 6 0 0 0 12 0v-5" />
        </symbol>
      </defs>
    </svg>
  );
}

export type IconId =
  | 'arrow-right'
  | 'arrow-up-right'
  | 'star'
  | 'gift'
  | 'clock'
  | 'users'
  | 'trending'
  | 'heart'
  | 'brain'
  | 'message'
  | 'book'
  | 'chevron-down'
  | 'check'
  | 'shield'
  | 'lock'
  | 'info'
  | 'target'
  | 'school';

export function Icon({ id, className, style }: { id: IconId; className?: string; style?: CSSProperties }) {
  return (
    <svg className={className} style={style} aria-hidden="true">
      <use href={`#ig-${id}`} />
    </svg>
  );
}

/* Map schema outcome icons → sprite symbols. */
export const OUTCOME_ICON: Record<string, IconId> = {
  brain: 'brain',
  chat: 'message',
  clock: 'clock',
  heart: 'heart',
  school: 'school',
  users: 'users',
};

export const TRUST_ICON: Record<string, IconId> = {
  shield: 'shield',
  lock: 'lock',
  info: 'info',
  star: 'star',
};

/* Sales sub-icon labels + helpers (used by VipBonuses + sundry sales sections). */
export const salesIconLabels: Record<string, string> = {
  infinity: 'Unlimited Access',
  clipboard: 'Action Blueprints',
  headphones: 'Audio Edition',
  captions: 'Subtitles',
  'file-text': 'Transcripts',
  book: 'Workbook',
};

export function SalesBonusIcon({ icon }: { icon: string }) {
  const label = salesIconLabels[icon] ?? icon;
  const color = LAV_SALES.LAV700;
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
        <path d="M7 15h4" /><path d="M15 15h2" /><path d="M7 11h2" /><path d="M13 11h4" />
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

export function SalesCheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 3 }}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function SalesXIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function SalesArrowRight({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export function SalesGiftIcon({ size = 20, color = '#8a6b00' }: { size?: number; color?: string }) {
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

export const salesBtnCta: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '1rem 2rem',
  background: LAV_SALES.SUN400,
  color: LAV_SALES.INK900,
  fontWeight: 700,
  fontSize: '1.05rem',
  borderRadius: '9999px',
  boxShadow: '0 6px 18px -4px rgba(233,182,12,.55), inset 0 -3px 0 rgba(0,0,0,.06)',
  letterSpacing: '.02em',
  textTransform: 'uppercase',
  textDecoration: 'none',
  border: 'none',
  cursor: 'pointer',
};

export const salesBtnCtaLg: CSSProperties = { ...salesBtnCta, padding: '1.15rem 2.4rem', fontSize: '1.15rem' };

/* TemplateContext — passed to every skin by the layout so cross-section
 * data (summit name for sales hero, checkout URLs, etc.) doesn't leak
 * back into per-section content schemas. */
export type TemplateContext = {
  summitName: string;
  topBarName: string;
  heroCtaLabel: string;
  wpCheckoutRedirectUrl?: string | null;
  wpThankyouRedirectUrl?: string | null;
};
