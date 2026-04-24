import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { LAV_SALES } from './shared';

type Props = { content: SectionContentMap['intro'] };

export function Intro({ content }: Props) {
  const i = content;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: '#fff' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontFamily: '"Cormorant Garamond",Georgia,serif', fontStyle: 'italic', color: LAV_SALES.INK700, fontWeight: 500, fontSize: '1.35rem', marginBottom: '0.5rem' }}><Node id="intro.eyebrow" role="label">{i.eyebrow}</Node></p>
        <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: LAV_SALES.INK900, lineHeight: 1.15, marginBottom: '1.5rem' }}><Node id="intro.headline" role="heading">{i.headline}</Node></h2>
        {i.paragraphs.map((p, idx) => (
          <p key={idx} style={{ color: LAV_SALES.INK800, fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '1rem' }}>{p}</p>
        ))}
      </div>
    </section>
  );
}
