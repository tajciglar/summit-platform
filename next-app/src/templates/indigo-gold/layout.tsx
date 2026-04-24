import { OptinModal } from '@/components/OptinModal';
import { paletteStyle, type Palette } from '@/lib/palette';
import type { Speaker } from '../types';
import {
  indigoGoldContentToSections,
  type IndigoGoldRenderContent,
  type SectionContentMap,
} from './bridge';
import {
  indigoGoldSections,
  indigoGoldSectionOrder,
  indigoGoldDefaultEnabledSections,
} from './sections';
import { IconSprite, type TemplateContext } from './skins/shared';

export type IndigoGoldLayoutProps = {
  content: IndigoGoldRenderContent;
  enabledSections?: string[];
  speakers: Record<string, Speaker>;
  funnelId: string;
  palette?: Palette | null;
  wpCheckoutRedirectUrl?: string | null;
  wpThankyouRedirectUrl?: string | null;
};

/**
 * Skins outside this list render INSIDE `<main>`. The four below are
 * rendered as siblings around `<main>` to preserve the original
 * monolithic layout's HTML structure (skip-link, sprite, top bar,
 * footer, mobile sticky CTA, optin modal).
 */
const OUTSIDE_MAIN = new Set(['top-bar', 'footer', 'sticky-mobile-cta']);

export function IndigoGoldLayout({
  content,
  enabledSections,
  speakers,
  funnelId,
  palette,
  wpCheckoutRedirectUrl,
  wpThankyouRedirectUrl,
}: IndigoGoldLayoutProps) {
  const enabled = new Set(enabledSections ?? indigoGoldDefaultEnabledSections);
  const sections = indigoGoldContentToSections(content);

  const context: TemplateContext = {
    summitName: content.summit?.name ?? '',
    topBarName: content.topBar?.name ?? '',
    heroCtaLabel: content.hero?.ctaLabel ?? 'Get Started',
    wpCheckoutRedirectUrl,
    wpThankyouRedirectUrl,
  };

  const renderSkin = (key: string) => {
    const Skin = indigoGoldSections[key as keyof typeof indigoGoldSections] as
      | React.FC<{
          content: SectionContentMap[keyof SectionContentMap];
          speakers: Record<string, Speaker>;
          funnelId: string;
          context: TemplateContext;
        }>
      | undefined;
    const sectionContent = sections[key as keyof SectionContentMap];
    if (!Skin) return null;
    // SpeakersGrid is fully derived from `speakers` and has no content slice.
    if (!sectionContent && key !== 'speakers') return null;
    return (
      <Skin
        key={key}
        content={sectionContent as SectionContentMap[keyof SectionContentMap]}
        speakers={speakers}
        funnelId={funnelId}
        context={context}
      />
    );
  };

  const ordered = indigoGoldSectionOrder.filter((k) => enabled.has(k));
  const insideMain = ordered.filter((k) => !OUTSIDE_MAIN.has(k));

  return (
    <div className="indigo-gold-root indigo-gold-body" style={paletteStyle(palette)}>
      <a href="#main-content" className="indigo-gold-skip-nav">
        Skip to content
      </a>
      <IconSprite />
      {enabled.has('top-bar') && renderSkin('top-bar')}

      <main id="main-content">{insideMain.map((k) => renderSkin(k))}</main>

      {enabled.has('footer') && renderSkin('footer')}
      {enabled.has('sticky-mobile-cta') && renderSkin('sticky-mobile-cta')}

      {enabled.has('hero') && content.hero && (
        <OptinModal funnelId={funnelId} ctaLabel={content.hero.ctaLabel} />
      )}
    </div>
  );
}
