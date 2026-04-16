interface SkeletonDef {
  skeleton: string;
  slots: string[];
}

const registry = new Map<string, () => Promise<SkeletonDef>>();

registry.set('HeroWithCountdown', () => import('./HeroWithCountdown'));
registry.set('StickyCountdownBar', () => import('./StickyCountdownBar'));
registry.set('SocialProofBadge', () => import('./SocialProofBadge'));
registry.set('LogoStripCarousel', () => import('./LogoStripCarousel'));
registry.set('StatsBar3Item', () => import('./StatsBar3Item'));
registry.set('FeatureWithImage', () => import('./FeatureWithImage'));
registry.set('SpeakerGridDay', () => import('./SpeakerGridDay'));
registry.set('BonusStack', () => import('./BonusStack'));
registry.set('FAQAccordion', () => import('./FAQAccordion'));
registry.set('Footer', () => import('./Footer'));

export async function loadSkeleton(type: string): Promise<SkeletonDef | null> {
  const loader = registry.get(type);
  if (!loader) return null;
  return loader();
}

export function hasSkeleton(type: string): boolean {
  return registry.has(type);
}
