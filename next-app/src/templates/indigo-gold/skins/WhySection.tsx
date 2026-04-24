import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { LAV_SALES } from './shared';

type Props = { content: SectionContentMap['why-section'] };

export function WhySection({ content }: Props) {
  const w = content;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: '#fff' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: LAV_SALES.INK900, lineHeight: 1.15, marginBottom: '0.5rem' }}><Node id="whySection.headline" role="heading">{w.headline}</Node></h2>
        <p style={{ fontFamily: '"Cormorant Garamond",Georgia,serif', fontStyle: 'italic', fontSize: '1.35rem', color: LAV_SALES.LAV700, marginBottom: '1.5rem' }}><Node id="whySection.subheadline" role="heading">{w.subheadline}</Node></p>
        {w.paragraphs.map((p, i) => (
          <p key={i} style={{ color: LAV_SALES.INK800, fontSize: '1rem', lineHeight: 1.75, marginBottom: '1rem' }}>{p}</p>
        ))}
      </div>
    </section>
  );
}
