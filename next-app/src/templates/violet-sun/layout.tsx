import { OptinModal } from '@/components/OptinModal';
import { paletteStyle, type Palette } from '@/lib/palette';
import type { Speaker } from '../types';
import type { VioletSunContent } from '../violet-sun.schema';
import { violetSunContentToSections, type SectionContentMap } from './bridge';
import {
  violetSunSections,
  violetSunSectionOrder,
  violetSunDefaultEnabledSections,
} from './sections';
import type { TemplateContext } from './skins/shared';

export type VioletSunLayoutProps = {
  content: VioletSunContent;
  enabledSections?: readonly string[];
  speakers: Record<string, Speaker>;
  funnelId: string;
  palette?: Palette | null;
  wpCheckoutRedirectUrl?: string | null;
  wpThankyouRedirectUrl?: string | null;
};

export function VioletSunLayout({
  content,
  enabledSections,
  speakers,
  funnelId,
  palette,
  wpCheckoutRedirectUrl,
  wpThankyouRedirectUrl,
}: VioletSunLayoutProps) {
  const enabled = enabledSections ?? violetSunDefaultEnabledSections;
  const enabledArr = [...enabled];
  const sections = violetSunContentToSections(content);
  const ordered = violetSunSectionOrder.filter((k) => enabledArr.includes(k));

  // Sales pages share this template family but only carry sales-section
  // content, so `content.topBar` / `content.hero` may be absent. Fall back
  // to safe defaults so the page still renders.
  const context: TemplateContext = {
    brandName: content.topBar?.brandName ?? content.summit?.name ?? '',
    heroCtaLabel: content.hero?.primaryCtaLabel ?? 'Get Started',
    wpCheckoutRedirectUrl,
    wpThankyouRedirectUrl,
  };

  // The TopBar is rendered above <main> per the original monolith so that the
  // sticky header sits outside the page main landmark. The Footer is rendered
  // below <main> for the same reason.
  const topBarEnabled = enabledArr.includes('top-bar');
  const footerEnabled = enabledArr.includes('footer');
  const heroEnabled = enabledArr.includes('hero');

  return (
    <div
      className="violet-sun-root violet-sun-body antialiased"
      style={paletteStyle(palette)}
    >
      <a href="#main" className="violet-sun-skip-nav">
        Skip to content
      </a>

      {topBarEnabled && sections['top-bar'] && (
        <SectionRenderer
          sectionKey="top-bar"
          sections={sections}
          speakers={speakers}
          funnelId={funnelId}
          context={context}
        />
      )}

      <main id="main">
        {ordered
          .filter((k) => k !== 'top-bar' && k !== 'footer')
          .map((key) => (
            <SectionRenderer
              key={key}
              sectionKey={key}
              sections={sections}
              speakers={speakers}
              funnelId={funnelId}
              context={context}
            />
          ))}
      </main>

      {footerEnabled && sections.footer && (
        <SectionRenderer
          sectionKey="footer"
          sections={sections}
          speakers={speakers}
          funnelId={funnelId}
          context={context}
        />
      )}

      {heroEnabled && content.hero && (
        <OptinModal funnelId={funnelId} ctaLabel={content.hero.primaryCtaLabel} />
      )}
    </div>
  );
}

type SectionRendererProps = {
  sectionKey: string;
  sections: Partial<SectionContentMap>;
  speakers: Record<string, Speaker>;
  funnelId: string;
  context: TemplateContext;
};

function SectionRenderer({
  sectionKey,
  sections,
  speakers,
  funnelId,
  context,
}: SectionRendererProps) {
  const Skin = violetSunSections[sectionKey as keyof typeof violetSunSections] as
    | React.FC<{
        content: SectionContentMap[keyof SectionContentMap];
        speakers: Record<string, Speaker>;
        funnelId: string;
        context: TemplateContext;
      }>
    | undefined;
  const sectionContent = sections[sectionKey as keyof SectionContentMap];
  if (!Skin || sectionContent === undefined) return null;
  return (
    <Skin
      content={sectionContent}
      speakers={speakers}
      funnelId={funnelId}
      context={context}
    />
  );
}
