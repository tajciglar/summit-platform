import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { SALES_TOKENS } from './shared';

type Props = {
  content: SectionContentMap['intro'];
};

export function Intro({ content: i }: Props) {
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: SALES_TOKENS.CREAM50 }}>
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontFamily: '"Playfair Display",Georgia,serif', fontStyle: 'italic', color: SALES_TOKENS.RUST400, fontWeight: 500, fontSize: '1.35rem', marginBottom: '0.5rem' }}><Node id="intro.eyebrow" role="label">{i.eyebrow}</Node></p>
        <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: SALES_TOKENS.INK900, lineHeight: 1.15, marginBottom: '1.5rem' }}><Node id="intro.headline" role="heading">{i.headline}</Node></h2>
        {i.paragraphs.map((p, idx) =>
          <p key={idx} style={{ color: SALES_TOKENS.INK800, fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '1rem' }}>{p}</p>
        )}
      </div>
    </section>
  );
}
