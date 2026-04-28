import type { IndigoGoldContent } from '../indigo-gold.schema';

/**
 * Render-time media sidecars injected by the Laravel API alongside the
 * `*MediaId` fields. Optional everywhere — when missing, skins fall back
 * to gradients/initials.
 */
type MediaSidecar = {
  id: string;
  url: string | null;
  alt: string | null;
  width: number | null;
  height: number | null;
};

/**
 * Section content map. Each key matches an IndigoGold section key and
 * resolves to the slice of `IndigoGoldContent` (plus any cross-section
 * data — e.g. the hero collage IDs needed by FreeGift) that the matching
 * skin renders.
 */
export type SectionContentMap = {
  'top-bar': IndigoGoldContent['topBar'];
  hero: IndigoGoldContent['hero'] & { backgroundImage?: MediaSidecar };
  press: IndigoGoldContent['press'];
  'trust-badges': IndigoGoldContent['trustBadges'];
  stats: IndigoGoldContent['stats'];
  overview: IndigoGoldContent['overview'];
  speakers: Record<string, never>; // speaker grid is fully derived from the speakers prop
  outcomes: IndigoGoldContent['outcomes'];
  'free-gift': IndigoGoldContent['freeGift'] & { collageSpeakerIds: IndigoGoldContent['hero']['collageSpeakerIds'] };
  founders: IndigoGoldContent['founders'];
  testimonials: IndigoGoldContent['testimonials'];
  bonuses: IndigoGoldContent['bonuses'];
  'pull-quote': IndigoGoldContent['pullQuote'];
  figures: IndigoGoldContent['figures'];
  shifts: IndigoGoldContent['shifts'];
  'closing-cta': IndigoGoldContent['closing'];
  faq: { section: IndigoGoldContent['faqSection']; items: IndigoGoldContent['faqs'] };
  footer: IndigoGoldContent['footer'] & { logo?: MediaSidecar };
  'sticky-mobile-cta': IndigoGoldContent['mobileCta'];
  'sales-hero': NonNullable<IndigoGoldContent['salesHero']>;
  intro: NonNullable<IndigoGoldContent['intro']>;
  'vip-bonuses': NonNullable<IndigoGoldContent['vipBonuses']>;
  'free-gifts': NonNullable<IndigoGoldContent['freeGifts']>;
  'upgrade-section': NonNullable<IndigoGoldContent['upgradeSection']>;
  'price-card': NonNullable<IndigoGoldContent['priceCard']>;
  'sales-speakers': NonNullable<IndigoGoldContent['salesSpeakers']>;
  'comparison-table': NonNullable<IndigoGoldContent['comparisonTable']>;
  guarantee: NonNullable<IndigoGoldContent['guarantee']>;
  'why-section': NonNullable<IndigoGoldContent['whySection']>;
};

/**
 * Render-time content shape (same as the monolithic file's RenderContent).
 * The Laravel API adds sidecars after Zod parse, so these slots may carry
 * resolved media URLs.
 */
export type IndigoGoldRenderContent = IndigoGoldContent & {
  hero: IndigoGoldContent['hero'] & { backgroundImage?: MediaSidecar };
  footer: IndigoGoldContent['footer'] & { logo?: MediaSidecar };
};

/**
 * Slice the full IndigoGold content tree into per-section payloads. Sales
 * sections are optional — only emitted when the operator authored content
 * for them, so optin pages skip them entirely.
 */
export function indigoGoldContentToSections(
  c: Partial<IndigoGoldRenderContent>,
): Partial<SectionContentMap> {
  return {
    ...(c.topBar && { 'top-bar': c.topBar }),
    ...(c.hero && {
      hero: {
        ...c.hero,
        // Prefer the backend-computed label over the hand-typed legacy field.
        eventStatusLabel: c.summit?.eventStatusLabel ?? c.hero.eventStatusLabel,
      },
    }),
    ...(c.press && { press: c.press }),
    ...(c.trustBadges && { 'trust-badges': c.trustBadges }),
    ...(c.stats && { stats: c.stats }),
    ...(c.overview && { overview: c.overview }),
    ...{ speakers: {} as Record<string, never> },
    ...(c.outcomes && { outcomes: c.outcomes }),
    ...(c.freeGift &&
      c.hero && {
        'free-gift': { ...c.freeGift, collageSpeakerIds: c.hero.collageSpeakerIds },
      }),
    ...(c.founders && { founders: c.founders }),
    ...(c.testimonials && { testimonials: c.testimonials }),
    ...(c.bonuses && { bonuses: c.bonuses }),
    ...(c.pullQuote && { 'pull-quote': c.pullQuote }),
    ...(c.figures && { figures: c.figures }),
    ...(c.shifts && { shifts: c.shifts }),
    ...(c.closing && { 'closing-cta': c.closing }),
    ...(c.faqSection &&
      c.faqs && { faq: { section: c.faqSection, items: c.faqs } }),
    ...(c.footer && { footer: c.footer }),
    ...(c.mobileCta && { 'sticky-mobile-cta': c.mobileCta }),
    ...(c.salesHero && { 'sales-hero': c.salesHero }),
    ...(c.intro && { intro: c.intro }),
    ...(c.vipBonuses && { 'vip-bonuses': c.vipBonuses }),
    ...(c.freeGifts && { 'free-gifts': c.freeGifts }),
    ...(c.upgradeSection && { 'upgrade-section': c.upgradeSection }),
    ...(c.priceCard && { 'price-card': c.priceCard }),
    ...(c.salesSpeakers && { 'sales-speakers': c.salesSpeakers }),
    ...(c.comparisonTable && { 'comparison-table': c.comparisonTable }),
    ...(c.guarantee && { guarantee: c.guarantee }),
    ...(c.whySection && { 'why-section': c.whySection }),
  };
}
