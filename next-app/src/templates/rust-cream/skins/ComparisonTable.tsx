import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { SALES_TOKENS, SalesCheckIcon, SalesXIcon } from './shared';

type Props = {
  content: SectionContentMap['comparison-table'];
};

export function ComparisonTable({ content: c }: Props) {
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: SALES_TOKENS.CREAM100 }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p style={{ fontFamily: '"Playfair Display",Georgia,serif', fontStyle: 'italic', color: SALES_TOKENS.RUST400, fontWeight: 500, fontSize: '1.35rem', marginBottom: '0.25rem' }}><Node id="comparisonTable.eyebrow" role="label">{c.eyebrow}</Node></p>
          <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: SALES_TOKENS.INK900, lineHeight: 1.15 }}><Node id="comparisonTable.headline" role="heading">{c.headline}</Node></h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, borderRadius: 16, overflow: 'hidden', border: `1px solid ${SALES_TOKENS.CREAM200}`, background: '#fff' }}>
            <thead>
              <tr>
                <th style={{ background: SALES_TOKENS.CREAM50, color: SALES_TOKENS.RUST500, fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '.8rem', letterSpacing: '.15em', textTransform: 'uppercase', padding: '1rem', textAlign: 'left' }}>Feature</th>
                <th style={{ background: SALES_TOKENS.CREAM200, color: SALES_TOKENS.RUST600, fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '.8rem', letterSpacing: '.15em', textTransform: 'uppercase', padding: '1rem', textAlign: 'center' }}>Free Pass</th>
                <th style={{ background: SALES_TOKENS.CREAM200, color: SALES_TOKENS.RUST600, fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '.8rem', letterSpacing: '.15em', textTransform: 'uppercase', padding: '1rem', textAlign: 'center' }}>VIP Pass</th>
              </tr>
            </thead>
            <tbody>
              {c.rows.map((row, i) =>
                <tr key={i}>
                  <td style={{ padding: '1rem', borderTop: `1px solid ${SALES_TOKENS.CREAM200}`, fontWeight: 600, color: SALES_TOKENS.INK900, fontSize: '0.95rem', lineHeight: 1.4 }}>{row.label}</td>
                  <td style={{ padding: '1rem', borderTop: `1px solid ${SALES_TOKENS.CREAM200}`, textAlign: 'center' }}>
                    {row.freePass ?
                      <span style={{ display: 'inline-grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: '#E6F3E3', color: SALES_TOKENS.SAGE }}><SalesCheckIcon /></span> :
                      <span style={{ display: 'inline-grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: '#FDECE2', color: SALES_TOKENS.RUST500 }}><SalesXIcon /></span>
                    }
                  </td>
                  <td style={{ padding: '1rem', borderTop: `1px solid ${SALES_TOKENS.CREAM200}`, textAlign: 'center' }}>
                    {row.vipPass ?
                      <span style={{ display: 'inline-grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: '#E6F3E3', color: SALES_TOKENS.SAGE }}><SalesCheckIcon /></span> :
                      <span style={{ display: 'inline-grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: '#FDECE2', color: SALES_TOKENS.RUST500 }}><SalesXIcon /></span>
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
