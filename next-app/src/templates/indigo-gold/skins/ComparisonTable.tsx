import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { LAV_SALES, SalesCheckIcon, SalesXIcon } from './shared';

type Props = { content: SectionContentMap['comparison-table'] };

export function ComparisonTable({ content }: Props) {
  const c = content;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: LAV_SALES.LAV50 }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p style={{ fontFamily: '"Cormorant Garamond",Georgia,serif', fontStyle: 'italic', color: LAV_SALES.INK700, fontWeight: 500, fontSize: '1.35rem', marginBottom: '0.25rem' }}><Node id="comparisonTable.eyebrow" role="label">{c.eyebrow}</Node></p>
          <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: LAV_SALES.INK900, lineHeight: 1.15 }}><Node id="comparisonTable.headline" role="heading">{c.headline}</Node></h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, borderRadius: 16, overflow: 'hidden', border: `1px solid ${LAV_SALES.LAV200}`, background: '#fff' }}>
            <thead>
              <tr>
                <th style={{ background: LAV_SALES.LAV100, color: LAV_SALES.LAV700, fontWeight: 700, fontSize: '.8rem', letterSpacing: '.15em', textTransform: 'uppercase', padding: '1rem', textAlign: 'left' }}>Feature</th>
                <th style={{ background: LAV_SALES.LAV200, color: LAV_SALES.LAV700, fontWeight: 700, fontSize: '.8rem', letterSpacing: '.15em', textTransform: 'uppercase', padding: '1rem', textAlign: 'center' }}>Free Pass</th>
                <th style={{ background: LAV_SALES.LAV200, color: LAV_SALES.LAV700, fontWeight: 700, fontSize: '.8rem', letterSpacing: '.15em', textTransform: 'uppercase', padding: '1rem', textAlign: 'center' }}>VIP Pass</th>
              </tr>
            </thead>
            <tbody>
              {c.rows.map((row, i) => (
                <tr key={i}>
                  <td style={{ padding: '1rem', borderTop: `1px solid ${LAV_SALES.LAV100}`, fontWeight: 600, color: LAV_SALES.INK900, fontSize: '0.95rem', lineHeight: 1.4 }}>{row.label}</td>
                  <td style={{ padding: '1rem', borderTop: `1px solid ${LAV_SALES.LAV100}`, textAlign: 'center' }}>
                    {row.freePass ? (
                      <span style={{ display: 'inline-grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: '#DCFCE7', color: '#16A34A' }}><SalesCheckIcon /></span>
                    ) : (
                      <span style={{ display: 'inline-grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: '#FEE2E2', color: '#DC2626' }}><SalesXIcon /></span>
                    )}
                  </td>
                  <td style={{ padding: '1rem', borderTop: `1px solid ${LAV_SALES.LAV100}`, textAlign: 'center' }}>
                    {row.vipPass ? (
                      <span style={{ display: 'inline-grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: '#DCFCE7', color: '#16A34A' }}><SalesCheckIcon /></span>
                    ) : (
                      <span style={{ display: 'inline-grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: '#FEE2E2', color: '#DC2626' }}><SalesXIcon /></span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
