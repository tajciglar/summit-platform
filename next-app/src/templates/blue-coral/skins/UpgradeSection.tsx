import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { BC_SALES } from './shared';

type Props = {
  content: SectionContentMap['upgrade-section'];
};

export function UpgradeSection({ content }: Props) {
  if (!content) return null;
  const u = content;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: BC_SALES.SKY50 }}>
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: BC_SALES.BLUE600, fontWeight: 700, fontSize: '0.8rem', letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}><Node id="upgradeSection.eyebrow" role="label">{u.eyebrow}</Node></p>
          <h2 className="blue-coral-heading" style={{ fontWeight: 700, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: BC_SALES.NAVY900, lineHeight: 1.15, marginBottom: '1.5rem' }}><Node id="upgradeSection.headline" role="heading">{u.headline}</Node></h2>
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            {u.paragraphs.map((p, i) =>
            <p key={i} style={{ color: BC_SALES.INK700, fontSize: '1rem', lineHeight: 1.7, marginBottom: '0.75rem' }}>{p}</p>
            )}
          </div>
        </div>
      </div>
    </section>);

}
