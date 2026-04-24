import { Node } from '../../shared/Node';
import type { GreenGoldContent } from '../../green-gold.schema';
import { GG_SALES, salesEyebrow, salesHeadline } from './shared';
import { SalesCheckIcon, SalesXIcon } from './sales-icons';

type Props = { content: GreenGoldContent };

export function ComparisonTable({ content }: Props) {
  if (!content.comparisonTable) return null;
  const c = content.comparisonTable;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: GG_SALES.GREEN50 }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <p className="green-gold-heading" style={salesEyebrow}><Node id="comparisonTable.eyebrow" role="label">{c.eyebrow}</Node></p>
          <h2 className="green-gold-heading" style={salesHeadline}><Node id="comparisonTable.headline" role="heading">{c.headline}</Node></h2>
        </div>
        <div style={{ overflowX: 'auto', borderRadius: 16, boxShadow: '0 14px 32px -18px rgba(20,83,45,.35)' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, borderRadius: 16, overflow: 'hidden', border: `1px solid ${GG_SALES.GREEN200}`, background: '#fff' }}>
            <thead>
              <tr>
                <th className="green-gold-heading" style={{ background: GG_SALES.GREEN100, color: GG_SALES.GREEN800, fontWeight: 800, fontSize: '.78rem', letterSpacing: '.16em', textTransform: 'uppercase', padding: '1rem', textAlign: 'left' }}>Feature</th>
                <th className="green-gold-heading" style={{ background: GG_SALES.GREEN200, color: GG_SALES.GREEN800, fontWeight: 800, fontSize: '.78rem', letterSpacing: '.16em', textTransform: 'uppercase', padding: '1rem', textAlign: 'center' }}>Free Pass</th>
                <th className="green-gold-heading" style={{ background: GG_SALES.GOLD300, color: GG_SALES.GOLD700, fontWeight: 800, fontSize: '.78rem', letterSpacing: '.16em', textTransform: 'uppercase', padding: '1rem', textAlign: 'center' }}>VIP Pass</th>
              </tr>
            </thead>
            <tbody>
              {c.rows.map((row, i) =>
              <tr key={i}>
                  <td style={{ padding: '1rem', borderTop: `1px solid ${GG_SALES.GREEN100}`, fontWeight: 600, color: GG_SALES.INK900, fontSize: '0.95rem', lineHeight: 1.45 }}>{row.label}</td>
                  <td style={{ padding: '1rem', borderTop: `1px solid ${GG_SALES.GREEN100}`, textAlign: 'center' }}>
                    {row.freePass ?
                  <span style={{ display: 'inline-grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: GG_SALES.GREEN100, color: GG_SALES.GREEN600 }}><SalesCheckIcon /></span> :
                  <span style={{ display: 'inline-grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: '#FEE2E2', color: '#DC2626' }}><SalesXIcon /></span>
                  }
                  </td>
                  <td style={{ padding: '1rem', borderTop: `1px solid ${GG_SALES.GREEN100}`, background: 'rgba(253,230,138,0.22)', textAlign: 'center' }}>
                    {row.vipPass ?
                  <span style={{ display: 'inline-grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: GG_SALES.GREEN100, color: GG_SALES.GREEN600 }}><SalesCheckIcon /></span> :
                  <span style={{ display: 'inline-grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: '#FEE2E2', color: '#DC2626' }}><SalesXIcon /></span>
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
