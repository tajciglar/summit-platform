import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { LAV_SALES } from './shared';

type Props = { content: SectionContentMap['upgrade-section'] };

export function UpgradeSection({ content }: Props) {
  const u = content;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: LAV_SALES.LAV50 }}>
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: '"Cormorant Garamond",Georgia,serif', fontStyle: 'italic', color: LAV_SALES.INK700, fontWeight: 500, fontSize: '1.35rem', marginBottom: '0.25rem' }}><Node id="upgradeSection.eyebrow" role="label">{u.eyebrow}</Node></p>
          <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: LAV_SALES.INK900, lineHeight: 1.15, marginBottom: '1.5rem' }}><Node id="upgradeSection.headline" role="heading">{u.headline}</Node></h2>
          {u.paragraphs.map((p, i) => (
            <p key={i} style={{ color: LAV_SALES.INK800, fontSize: '1rem', lineHeight: 1.7, marginBottom: '0.75rem', maxWidth: 680, margin: '0 auto 0.75rem' }}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
