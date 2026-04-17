import type { Speaker } from '../../types';

export const PORTRAIT_GRADIENTS = [
  'linear-gradient(160deg,#8A4E5D,#4A1F2D)',
  'linear-gradient(160deg,#C9812A,#A6691F)',
  'linear-gradient(160deg,#6B3340,#8A4E5D)',
  'linear-gradient(160deg,#4F4238,#6B5B4E)',
  'linear-gradient(160deg,#4A1F2D,#2A0F17)',
  'linear-gradient(160deg,#8A4E5D,#6B3340)',
  'linear-gradient(160deg,#D9963F,#C9812A)',
  'linear-gradient(160deg,#A6691F,#6B5B4E)',
];

export const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#4A1F2D,#8A4E5D)',
  'linear-gradient(135deg,#C9812A,#A6691F)',
  'linear-gradient(135deg,#6B3340,#4A1F2D)',
  'linear-gradient(135deg,#4F4238,#6B5B4E)',
];

export const FOUNDER_GRADIENTS = [
  'linear-gradient(135deg,#4A1F2D,#2A0F17)',
  'linear-gradient(135deg,#C9812A,#A6691F)',
];

export const TESTIMONIAL_GRADIENTS = [
  'linear-gradient(135deg,#4A1F2D,#8A4E5D)',
  'linear-gradient(135deg,#C9812A,#A6691F)',
  'linear-gradient(135deg,#6B3340,#4F4238)',
];

export type TemplateContext = {
  summitName: string;
  heroCtaLabel: string;
};

export function initialsFromSpeaker(s: Speaker): string {
  const a = s.firstName?.trim()?.[0] ?? '';
  const b = s.lastName?.trim()?.[0] ?? '';
  return (a + b).toUpperCase() || '??';
}

export function displayName(s: Speaker): string {
  return `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim() || '—';
}
