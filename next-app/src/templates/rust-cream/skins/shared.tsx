import type { CSSProperties } from 'react';
import type { Speaker } from '../../types';

/* Visual gradients for speaker avatars — deterministic, cycled by index.
 * Drawn from the rust-cream HTML palette (warm brown/tan/sage/gold). */
export const SPEAKER_GRADIENTS = [
  'linear-gradient(135deg,#8B4513,#6B3410)',
  'linear-gradient(135deg,#5B8C5A,#3A5C3A)',
  'linear-gradient(135deg,#D4A04A,#B8872E)',
  'linear-gradient(135deg,#3D2B1F,#6B3410)',
  'linear-gradient(135deg,#C2703E,#A85C2F)',
  'linear-gradient(135deg,#8B4513,#A85C2F)',
  'linear-gradient(135deg,#B8872E,#D4A04A)',
  'linear-gradient(135deg,#5B8C5A,#4A7349)',
];

export const AVATAR_SM_GRADIENTS = [
  'linear-gradient(135deg,#8B4513,#6B3410)',
  'linear-gradient(135deg,#D4A04A,#B8872E)',
  'linear-gradient(135deg,#C2703E,#A85C2F)',
  'linear-gradient(135deg,#5B8C5A,#4A7349)',
];

export const FOUNDER_GRADIENTS = [
  'linear-gradient(135deg,#8B4513,#6B3410)',
  'linear-gradient(135deg,#D4A04A,#B8872E)',
];

export const TESTIMONIAL_AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#8B4513,#6B3410)',
  'linear-gradient(135deg,#D4A04A,#B8872E)',
  'linear-gradient(135deg,#5B8C5A,#3A5C3A)',
];

export const STAT_CARD_GRADIENTS = [
  'linear-gradient(135deg,#8B4513,#6B3410)',
  'linear-gradient(135deg,#C2703E,#A85C2F)',
  'linear-gradient(135deg,#5B8C5A,#3A5C3A)',
];

export const STAT_CARD_LABEL_COLORS = ['#E8C4A8', '#E8C4A8', '#8BB889'];

export type TemplateContext = {
  topBarName: string;
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

/* Trust icon SVGs — keyed by enum in schema. */
export function TrustIcon({ name }: { name: 'shield' | 'lock' | 'info' | 'star' }) {
  const color = name === 'star' ? '#D4A04A' : '#5B8C5A';
  if (name === 'shield') {
    return (
      <svg className="w-4 h-4" style={{ color }} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    );
  }
  if (name === 'lock') {
    return (
      <svg className="w-4 h-4" style={{ color }} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
      </svg>
    );
  }
  if (name === 'info') {
    return (
      <svg className="w-4 h-4" style={{ color }} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4" style={{ color }} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#5B8C5A' }} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

/* =======================================================================
 * ============  SALES-PAGE TOKENS / ICONS / BUTTON STYLES  ==============
 * ======================================================================= */

export const SALES_TOKENS = {
  CREAM50: '#FDF8F3',
  CREAM100: '#F5EDE4',
  CREAM200: '#E8C4A8',
  CREAM300: '#D9AC88',
  RUST400: '#C2703E',
  RUST500: '#A85C2F',
  RUST600: '#8B4513',
  RUST700: '#6B3410',
  INK900: '#2A1D15',
  INK800: '#3D2B1F',
  INK700: '#5C422F',
  MUTE: '#8B7355',
  GOLD400: '#D4A04A',
  GOLD500: '#B8872E',
  GOLD50: '#FBF3DF',
  GOLD100: '#F5E4B8',
  SAGE: '#5B8C5A',
};

export const salesIconLabels: Record<string, string> = {
  'infinity': 'Unlimited Access',
  'clipboard': 'Action Blueprints',
  'headphones': 'Audio Edition',
  'captions': 'Subtitles',
  'file-text': 'Transcripts',
  'book': 'Workbook',
};

export function SalesBonusIcon({ icon }: { icon: string }) {
  const label = salesIconLabels[icon] ?? icon;
  const color = SALES_TOKENS.RUST600;
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={SALES_TOKENS.SAGE} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 3 }}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function SalesXIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={SALES_TOKENS.RUST500} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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

export function SalesGiftIcon({ size = 20, color = SALES_TOKENS.RUST600 }: { size?: number; color?: string }) {
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

/* Primary sales CTA button — warm rust pill. */
export const salesBtnCta: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '1rem 2rem',
  background: SALES_TOKENS.RUST600,
  color: '#fff',
  fontFamily: 'Poppins, sans-serif',
  fontWeight: 700,
  fontSize: '1.05rem',
  borderRadius: '9999px',
  boxShadow: '0 10px 24px -8px rgba(139,69,19,.45), inset 0 -3px 0 rgba(0,0,0,.1)',
  letterSpacing: '.02em',
  textTransform: 'uppercase',
  textDecoration: 'none',
  border: 'none',
  cursor: 'pointer',
};

export const salesBtnCtaLg: CSSProperties = { ...salesBtnCta, padding: '1.15rem 2.4rem', fontSize: '1.15rem' };
