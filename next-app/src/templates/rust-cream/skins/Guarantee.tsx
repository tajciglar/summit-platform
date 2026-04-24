import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { SALES_TOKENS } from './shared';

type Props = {
  content: SectionContentMap['guarantee'];
};

export function Guarantee({ content: g }: Props) {
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: SALES_TOKENS.CREAM100 }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ background: SALES_TOKENS.GOLD50, border: `2px dashed ${SALES_TOKENS.GOLD400}`, borderRadius: 20, padding: '1.75rem', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <div style={{ fontSize: '3rem', flexShrink: 0 }} aria-hidden="true">🛡️</div>
          <div>
            <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '1.1rem', color: SALES_TOKENS.INK900, marginBottom: '0.5rem' }}><Node id="guarantee.heading" role="heading">{g.heading}</Node></h3>
            <p style={{ fontSize: '0.95rem', color: SALES_TOKENS.INK700, lineHeight: 1.65, margin: 0 }}><Node id="guarantee.body" role="body">{g.body}</Node></p>
          </div>
        </div>
      </div>
    </section>
  );
}
