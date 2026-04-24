import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { VS_SALES, VsCheckIcon, VsXIcon } from './shared';

type Props = {
  content: SectionContentMap['comparison-table'];
};

export function ComparisonTable({ content }: Props) {
  const c = content;
  return (
    <section style={{ padding: '4rem 1.25rem', background: VS_SALES.MIST_50 }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.75rem' }}>
          <p
            className="violet-sun-italic-serif"
            style={{ color: VS_SALES.VIO_700, fontSize: '1.35rem', marginBottom: '0.35rem' }}
          >
            <Node id="comparisonTable.eyebrow" role="label">{c.eyebrow}</Node>
          </p>
          <h2
            className="violet-sun-display"
            style={{
              fontWeight: 700,
              fontSize: 'clamp(1.85rem, 3.2vw, 2.6rem)',
              color: VS_SALES.INK_900,
              lineHeight: 1.14,
            }}
          >
            <Node id="comparisonTable.headline" role="heading">{c.headline}</Node>
          </h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: 0,
              borderRadius: 20,
              overflow: 'hidden',
              border: `1px solid ${VS_SALES.MIST_100}`,
              background: '#FFFFFF',
            }}
          >
            <thead>
              <tr>
                <th
                  className="violet-sun-eyebrow"
                  style={{
                    background: VS_SALES.MIST_100,
                    color: VS_SALES.VIO_700,
                    padding: '1.1rem',
                    textAlign: 'left',
                  }}
                >
                  Feature
                </th>
                <th
                  className="violet-sun-eyebrow"
                  style={{
                    background: VS_SALES.MIST_200,
                    color: VS_SALES.VIO_700,
                    padding: '1.1rem',
                    textAlign: 'center',
                  }}
                >
                  Free Pass
                </th>
                <th
                  className="violet-sun-eyebrow"
                  style={{
                    background: VS_SALES.MIST_200,
                    color: VS_SALES.VIO_700,
                    padding: '1.1rem',
                    textAlign: 'center',
                  }}
                >
                  VIP Pass
                </th>
              </tr>
            </thead>
            <tbody>
              {c.rows.map((row, i) => (
                <tr key={i}>
                  <td
                    style={{
                      padding: '1rem',
                      borderTop: `1px solid ${VS_SALES.MIST_100}`,
                      fontWeight: 600,
                      color: VS_SALES.INK_900,
                      fontSize: '0.95rem',
                      lineHeight: 1.4,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {row.label}
                  </td>
                  <td
                    style={{
                      padding: '1rem',
                      borderTop: `1px solid ${VS_SALES.MIST_100}`,
                      textAlign: 'center',
                    }}
                  >
                    {row.freePass ? (
                      <span style={{ display: 'inline-grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: '#DCFCE7', color: '#16A34A' }}>
                        <VsCheckIcon />
                      </span>
                    ) : (
                      <span style={{ display: 'inline-grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: '#FEE2E2', color: '#DC2626' }}>
                        <VsXIcon />
                      </span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: '1rem',
                      borderTop: `1px solid ${VS_SALES.MIST_100}`,
                      textAlign: 'center',
                    }}
                  >
                    {row.vipPass ? (
                      <span style={{ display: 'inline-grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: '#DCFCE7', color: '#16A34A' }}>
                        <VsCheckIcon />
                      </span>
                    ) : (
                      <span style={{ display: 'inline-grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: '#FEE2E2', color: '#DC2626' }}>
                        <VsXIcon />
                      </span>
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
