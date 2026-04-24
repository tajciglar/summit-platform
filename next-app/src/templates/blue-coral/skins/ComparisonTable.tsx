import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { BC_SALES, BcSalesCheckIcon, BcSalesXIcon } from './shared';

type Props = {
  content: SectionContentMap['comparison-table'];
};

export function ComparisonTable({ content }: Props) {
  if (!content) return null;
  const c = content;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: BC_SALES.SKY50 }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p style={{ color: BC_SALES.BLUE600, fontWeight: 700, fontSize: '0.8rem', letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}><Node id="comparisonTable.eyebrow" role="label">{c.eyebrow}</Node></p>
          <h2 className="blue-coral-heading" style={{ fontWeight: 700, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: BC_SALES.NAVY900, lineHeight: 1.15 }}><Node id="comparisonTable.headline" role="heading">{c.headline}</Node></h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, borderRadius: 18, overflow: 'hidden', border: `1px solid ${BC_SALES.SKY200}`, background: '#fff' }}>
            <thead>
              <tr>
                <th className="blue-coral-heading" style={{ background: BC_SALES.SKY100, color: BC_SALES.BLUE700, fontWeight: 700, fontSize: '.8rem', letterSpacing: '.14em', textTransform: 'uppercase', padding: '1rem', textAlign: 'left' }}>Feature</th>
                <th className="blue-coral-heading" style={{ background: BC_SALES.SKY200, color: BC_SALES.BLUE700, fontWeight: 700, fontSize: '.8rem', letterSpacing: '.14em', textTransform: 'uppercase', padding: '1rem', textAlign: 'center' }}>Free Pass</th>
                <th className="blue-coral-heading" style={{ background: BC_SALES.SKY200, color: BC_SALES.BLUE700, fontWeight: 700, fontSize: '.8rem', letterSpacing: '.14em', textTransform: 'uppercase', padding: '1rem', textAlign: 'center' }}>VIP Pass</th>
              </tr>
            </thead>
            <tbody>
              {c.rows.map((row, i) =>
              <tr key={i}>
                  <td style={{ padding: '1rem', borderTop: `1px solid ${BC_SALES.SKY100}`, fontWeight: 600, color: BC_SALES.NAVY900, fontSize: '0.95rem', lineHeight: 1.4 }}>{row.label}</td>
                  <td style={{ padding: '1rem', borderTop: `1px solid ${BC_SALES.SKY100}`, textAlign: 'center' }}>
                    {row.freePass ?
                  <span style={{ display: 'inline-grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: '#DCFCE7', color: '#16A34A' }}><BcSalesCheckIcon /></span> :
                  <span style={{ display: 'inline-grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: '#FEE2E2', color: BC_SALES.CORAL600 }}><BcSalesXIcon /></span>
                  }
                  </td>
                  <td style={{ padding: '1rem', borderTop: `1px solid ${BC_SALES.SKY100}`, textAlign: 'center' }}>
                    {row.vipPass ?
                  <span style={{ display: 'inline-grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: '#DCFCE7', color: '#16A34A' }}><BcSalesCheckIcon /></span> :
                  <span style={{ display: 'inline-grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: '#FEE2E2', color: BC_SALES.CORAL600 }}><BcSalesXIcon /></span>
                  }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>);

}
