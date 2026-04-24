import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { SALES_TOKENS } from './shared';

type Props = {
  content: SectionContentMap['why-section'];
};

export function WhySection({ content: w }: Props) {
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: SALES_TOKENS.CREAM50 }}>
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: SALES_TOKENS.INK900, lineHeight: 1.15, marginBottom: '0.5rem' }}><Node id="whySection.headline" role="heading">{w.headline}</Node></h2>
        <p style={{ fontFamily: '"Playfair Display",Georgia,serif', fontStyle: 'italic', fontSize: '1.35rem', color: SALES_TOKENS.RUST400, marginBottom: '1.5rem' }}><Node id="whySection.subheadline" role="heading">{w.subheadline}</Node></p>
        {w.paragraphs.map((p, i) =>
          <p key={i} style={{ color: SALES_TOKENS.INK800, fontSize: '1rem', lineHeight: 1.75, marginBottom: '1rem' }}>{p}</p>
        )}
      </div>
    </section>
  );
}
