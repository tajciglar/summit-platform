import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { BC_SALES } from './shared';

type Props = {
  content: SectionContentMap['intro'];
};

export function Intro({ content }: Props) {
  if (!content) return null;
  const i = content;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: '#fff' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ color: BC_SALES.CORAL600, fontWeight: 700, fontSize: '0.8rem', letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: '0.75rem' }}><Node id="intro.eyebrow" role="label">{i.eyebrow}</Node></p>
        <h2 className="blue-coral-heading" style={{ fontWeight: 700, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: BC_SALES.NAVY900, lineHeight: 1.15, marginBottom: '1.5rem' }}><Node id="intro.headline" role="heading">{i.headline}</Node></h2>
        {i.paragraphs.map((p, idx) =>
        <p key={idx} style={{ color: BC_SALES.INK700, fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '1rem' }}>{p}</p>
        )}
      </div>
    </section>);

}
