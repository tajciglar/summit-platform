import { describe, it, expect } from 'vitest';
import { HeroSchema } from '../hero.schema';
import { MastheadSchema } from '../masthead.schema';
import { MarqueeSchema } from '../marquee.schema';
import { SummitOverviewSchema } from '../summit-overview.schema';
import { ValuePropSchema } from '../value-prop.schema';
import { SpeakersByDaySchema } from '../speakers-by-day.schema';
import { BonusStackSchema } from '../bonus-stack.schema';
import { SupplementSchema } from '../supplement.schema';
import { HostFounderSchema } from '../host-founder.schema';
import { TestimonialsAttendeesSchema } from '../testimonials-attendees.schema';
import { PullQuoteSchema } from '../pull-quote.schema';
import { FactsStatsSchema } from '../facts-stats.schema';
import { ReasonsToAttendSchema } from '../reasons-to-attend.schema';
import { StatsHeroSchema } from '../stats-hero.schema';
import { FaqSchema } from '../faq.schema';
import { ClosingCtaSchema } from '../closing-cta.schema';
import { FooterSchema } from '../footer.schema';

describe('section schemas', () => {
  it('HeroSchema rejects empty headline', () => {
    const res = HeroSchema.safeParse({
      issueLabel: 'I', dateRangeLabel: 'D', metaLabel: 'M', readerCount: '1',
      eyebrow: 'E', headline: '', subheadline: 'sub', ctaLabel: 'cta',
      ratingText: 'r', figCaption: 'f',
      heroSpeakerIds: ['00000000-0000-4000-8000-000000000000'],
    });
    expect(res.success).toBe(false);
  });

  it('MarqueeSchema enforces min 3 items', () => {
    const res = MarqueeSchema.safeParse({ items: ['a', 'b'] });
    expect(res.success).toBe(false);
  });

  it('SummitOverviewSchema requires exactly 2 paragraphs', () => {
    const base = {
      roman: 'II.', headline: 'H', ctaLabel: 'go',
      featureBand: { eyebrow: 'e', headline: 'h', body: 'b', bullets: ['1', '2', '3'] },
    };
    expect(SummitOverviewSchema.safeParse({ ...base, bodyParagraphs: ['one'] }).success).toBe(false);
    expect(SummitOverviewSchema.safeParse({ ...base, bodyParagraphs: ['one', 'two'] }).success).toBe(true);
  });

  it('ValuePropSchema requires exactly 6 items', () => {
    const mk = (n: number) => ({
      roman: 'IV.', headline: 'H', subhead: 'S',
      items: Array.from({ length: n }, (_, i) => ({ title: `t${i}`, description: `d${i}` })),
    });
    expect(ValuePropSchema.safeParse(mk(5)).success).toBe(false);
    expect(ValuePropSchema.safeParse(mk(6)).success).toBe(true);
  });

  it('SpeakersByDaySchema rejects non-uuid speakerIds', () => {
    const res = SpeakersByDaySchema.safeParse({
      days: [{ dayLabel: 'Day 1', dayDate: '2026-04-22', speakerIds: ['not-uuid'] }],
    });
    expect(res.success).toBe(false);
  });

  it('FaqSchema requires min 3 items', () => {
    const res = FaqSchema.safeParse({
      items: [{ question: 'q', answer: 'a' }, { question: 'q', answer: 'a' }],
    });
    expect(res.success).toBe(false);
  });

  it('StatsHeroSchema accepts 3 stat pairs', () => {
    const res = StatsHeroSchema.safeParse({
      statLabel1: 'a', statValue1: '1',
      statLabel2: 'b', statValue2: '2',
      statLabel3: 'c', statValue3: '3',
    });
    expect(res.success).toBe(true);
  });

  it('FooterSchema rejects missing tagline', () => {
    const res = FooterSchema.safeParse({ volume: 'v', copyright: 'c' });
    expect(res.success).toBe(false);
  });

  // Sanity: the rest parse successfully with minimal valid input
  it('all other schemas round-trip valid fixtures', () => {
    expect(MastheadSchema.safeParse({ volume: 'v', eyebrow: 'e' }).success).toBe(true);
    expect(BonusStackSchema.safeParse({
      roman: 'V.', headline: 'H', subhead: 'S', ctaLabel: 'cta',
      items: [{ title: 't', description: 'd', valueLabel: 'v' }],
    }).success).toBe(true);
    expect(SupplementSchema.safeParse({
      cardLabel: 'l', cardTitle: 't', cardFooter: 'f', cardVolume: 'v',
      badgeLabel: 'b', eyebrow: 'e', headline: 'h', body: 'body',
      bullets: ['a', 'b'], ctaLabel: 'cta',
    }).success).toBe(true);
    expect(HostFounderSchema.safeParse({
      roman: 'VI.', headline: 'H',
      items: [
        { name: 'n', role: 'r', quote: 'q', initials: 'NN' },
        { name: 'n', role: 'r', quote: 'q', initials: 'NN' },
      ],
    }).success).toBe(true);
    expect(TestimonialsAttendeesSchema.safeParse({
      roman: 'VII.', headline: 'H', subhead: 'S',
      items: [
        { quote: 'q', name: 'n', location: 'l', initials: 'AB' },
        { quote: 'q', name: 'n', location: 'l', initials: 'AB' },
        { quote: 'q', name: 'n', location: 'l', initials: 'AB' },
      ],
    }).success).toBe(true);
    expect(PullQuoteSchema.safeParse({ quote: 'q', attribution: 'a' }).success).toBe(true);
    expect(FactsStatsSchema.safeParse({
      roman: 'VIII.', headline: 'H', subhead: 'S',
      items: Array.from({ length: 6 }, () => ({ label: 'l', value: 'v', description: 'd' })),
    }).success).toBe(true);
    expect(ReasonsToAttendSchema.safeParse({
      roman: 'IX.', headline: 'H',
      items: Array.from({ length: 5 }, () => ({ title: 't', description: 'd' })),
    }).success).toBe(true);
    expect(ClosingCtaSchema.safeParse({
      headline: 'H', subheadline: 'S', ctaLabel: 'cta',
    }).success).toBe(true);
  });
});

import { catalog, catalogKeys } from '../catalog';

describe('catalog', () => {
  it('every entry has a schema', () => {
    for (const key of catalogKeys) {
      expect(catalog[key].schema).toBeDefined();
    }
  });

  it('no duplicate defaultOrder within a page type', () => {
    const byPageType: Record<string, number[]> = {};
    for (const key of catalogKeys) {
      const entry = catalog[key];
      for (const pt of entry.pageTypes) {
        byPageType[pt] ??= [];
        byPageType[pt].push(entry.defaultOrder);
      }
    }
    for (const [pt, orders] of Object.entries(byPageType)) {
      const unique = new Set(orders);
      expect(unique.size, `page-type ${pt} has duplicate defaultOrder`).toBe(orders.length);
    }
  });
});
