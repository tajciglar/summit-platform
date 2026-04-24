import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { Icon } from './shared';

type Props = { content: SectionContentMap['sticky-mobile-cta'] };

export function StickyMobileCta({ content }: Props) {
  if (!content) return null;
  return (
    <a href="#optin" className="indigo-gold-stick-mobile">
      <span className="indigo-gold-btn-cta" style={{ padding: '.7rem 1.25rem' }}>
        <Node id="mobileCta.ctaLabel" role="button">{content.ctaLabel}</Node>
        <span className="indigo-gold-btn-arrow">
          <Icon id="arrow-right" className="w-3.5 h-3.5" />
        </span>
      </span>
    </a>
  );
}
