import type { CSSProperties, ReactElement } from 'react';
import { OptinModal } from '@/components/OptinModal';
import type { Speaker } from '../types';
import type { CreamSageContent } from '../cream-sage.schema';
import type { Palette } from '@/lib/palette';
import { sectionStyle } from '../shared/design-tokens';
import type { DesignTokens } from '../shared/design-tokens';
import { creamSageContentToSections, type SectionContentMap } from './bridge';
import {
  creamSageSections,
  creamSageDefaultEnabledSections,
} from './sections';
import type { TemplateContext } from './skins/shared';

/** CreamSage's CSS-var prefix. */
const sectionStyleFor = (t?: DesignTokens) => sectionStyle(t, 'cs');

/**
 * Optin section keys whose render in the monolith was wrapped by
 * `sectionWrap(camelCaseKey, …)` so per-section design-token overrides
 * could be scoped via CSS custom properties on `[data-cs-section="…"]`.
 * Sales-page sections + `speakers` + `footer` were intentionally NOT
 * wrapped in the monolith; we preserve that exactly.
 */
const SECTION_WRAP_KEYS: Record<string, string> = {
  'top-bar': 'topBar',
  hero: 'hero',
  press: 'press',
  stats: 'stats',
  overview: 'overview',
  outcomes: 'outcomes',
  'free-gift': 'freeGift',
  bonuses: 'bonuses',
  founders: 'founders',
  testimonials: 'testimonials',
  'pull-quote': 'pullQuote',
  figures: 'figures',
  shifts: 'shifts',
  faq: 'faqSection',
  'closing-cta': 'closing',
};

export type CreamSageLayoutProps = {
  content: CreamSageContent;
  enabledSections?: string[];
  speakers: Record<string, Speaker>;
  funnelId: string;
  palette?: Palette | null;
  tokens?: DesignTokens;
  sections?: Record<string, DesignTokens>;
  wpCheckoutRedirectUrl?: string | null;
  wpThankyouRedirectUrl?: string | null;
};

export function CreamSageLayout({
  content,
  enabledSections,
  speakers,
  funnelId,
  tokens,
  sections,
  wpCheckoutRedirectUrl,
  wpThankyouRedirectUrl,
}: CreamSageLayoutProps) {
  const enabled = new Set(enabledSections ?? creamSageDefaultEnabledSections);
  const sectionsContent = creamSageContentToSections(content);

  // Sales pages share this template family but only carry sales-section
  // content, so `content.topBar` / `content.hero` may not be the source of
  // brand context. Fall back to safe defaults so the page still renders.
  const context: TemplateContext = {
    summitName: content.summit?.name ?? '',
    heroCtaLabel: content.hero?.primaryCtaLabel ?? 'Reserve seat',
    wpCheckoutRedirectUrl,
    wpThankyouRedirectUrl,
  };

  const rootStyle: CSSProperties | undefined = (() => {
    if (!tokens) return undefined;
    const s: Record<string, string> = {};
    const p = tokens.palette;
    if (p?.primary) s['--cs-primary'] = p.primary;
    if (p?.primary) s['--cs-primary-hover'] = p.primary;
    if (p?.accent) s['--cs-accent'] = p.accent;
    if (p?.ink) s['--cs-ink'] = p.ink;
    if (p?.paper) s['--cs-paper'] = p.paper;
    if (tokens.headingFont) s['--heading-font'] = `'${tokens.headingFont}', serif`;
    if (tokens.bodyFont) s['--body-font'] = `'${tokens.bodyFont}', system-ui, sans-serif`;
    return Object.keys(s).length ? (s as CSSProperties) : undefined;
  })();

  const renderSection = (key: keyof typeof creamSageSections): ReactElement | null => {
    if (!enabled.has(key)) return null;
    const Skin = creamSageSections[key] as React.FC<{
      content: CreamSageContent;
      speakers: Record<string, Speaker>;
      funnelId: string;
      context: TemplateContext;
    }>;
    const sectionContent = sectionsContent[key];
    if (!Skin || !sectionContent) return null;
    const node = (
      <Skin
        content={sectionContent}
        speakers={speakers}
        funnelId={funnelId}
        context={context}
      />
    );
    const wrapKey = SECTION_WRAP_KEYS[key];
    if (!wrapKey) return node;
    const style = sectionStyleFor(sections?.[wrapKey]);
    return (
      <div data-cs-section={wrapKey} style={style} key={key}>
        {node}
      </div>
    );
  };

  return (
    <div className="cream-sage-root cream-sage-body antialiased" style={rootStyle}>
      <a href="#main" className="cream-sage-skip-nav">
        Skip to content
      </a>

      {renderSection('top-bar')}

      <main id="main">
        {renderSection('hero')}
        {renderSection('press')}
        {renderSection('stats')}
        {renderSection('overview')}
        {renderSection('speakers')}
        {renderSection('outcomes')}
        {renderSection('free-gift')}
        {renderSection('bonuses')}
        {renderSection('founders')}
        {renderSection('testimonials')}
        {renderSection('pull-quote')}
        {renderSection('figures')}
        {renderSection('shifts')}
        {renderSection('faq')}
        {renderSection('closing-cta')}

        {renderSection('sales-hero')}
        {renderSection('intro')}
        {renderSection('vip-bonuses')}
        {renderSection('free-gifts')}
        {renderSection('upgrade-section')}
        {renderSection('price-card')}
        {renderSection('sales-speakers')}
        {renderSection('comparison-table')}
        {renderSection('guarantee')}
        {renderSection('why-section')}
      </main>

      {renderSection('footer')}

      {enabled.has('hero') && content.hero && (
        <OptinModal funnelId={funnelId} ctaLabel={content.hero.primaryCtaLabel} />
      )}
    </div>
  );
}
