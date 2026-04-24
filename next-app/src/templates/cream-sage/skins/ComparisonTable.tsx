import type { CreamSageContent } from '../../cream-sage.schema';
import { Node } from '../../shared/Node';
import { CS_SALES, CsSalesCheckIcon, CsSalesXIcon } from './shared';

type Props = { content: CreamSageContent };

export function ComparisonTable({ content }: Props) {
  if (!content.comparisonTable) return null;
  const c = content.comparisonTable;
  return (
    <section className="py-20 md:py-24" style={{ background: CS_SALES.CREAM_DEEP }}>
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span
            className="cream-sage-eyebrow mb-3 inline-block"
            style={{ color: CS_SALES.CLAY }}
          >
            <Node id="comparisonTable.eyebrow">{c.eyebrow}</Node>
          </span>
          <h2
            className="font-black text-4xl md:text-5xl leading-tight"
            style={{ fontFamily: "'Fraunces', serif", color: CS_SALES.INK }}
          >
            <Node id="comparisonTable.headline">{c.headline}</Node>
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
              background: CS_SALES.CREAM,
              border: `1px solid ${CS_SALES.SAGE_LINE}`,
              fontFamily: "'Nunito', 'DM Sans', sans-serif",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    background: CS_SALES.SAGE_SOFT,
                    color: CS_SALES.SAGE_DEEP,
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    padding: '1rem 1.1rem',
                    textAlign: 'left',
                  }}
                >
                  Feature
                </th>
                <th
                  style={{
                    background: CS_SALES.SAGE_SOFT,
                    color: CS_SALES.SAGE_DEEP,
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    padding: '1rem 1.1rem',
                    textAlign: 'center',
                  }}
                >
                  Free Pass
                </th>
                <th
                  style={{
                    background: CS_SALES.SAGE_SOFT,
                    color: CS_SALES.SAGE_DEEP,
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    padding: '1rem 1.1rem',
                    textAlign: 'center',
                  }}
                >
                  VIP Pass
                </th>
              </tr>
            </thead>
            <tbody>
              {c.rows.map((row, i) => (
                <tr key={`cmp-row-${i}`}>
                  <td
                    style={{
                      padding: '1rem 1.1rem',
                      borderTop: `1px solid ${CS_SALES.SAGE_LINE}`,
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      color: CS_SALES.INK,
                      lineHeight: 1.4,
                    }}
                  >
                    <Node id={`comparisonTable.rows.${i}.label`}>{row.label}</Node>
                  </td>
                  <td
                    style={{
                      padding: '1rem 1.1rem',
                      borderTop: `1px solid ${CS_SALES.SAGE_LINE}`,
                      textAlign: 'center',
                    }}
                  >
                    {row.freePass ? (
                      <span
                        style={{
                          display: 'inline-grid',
                          placeItems: 'center',
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: CS_SALES.SAGE_SOFT,
                        }}
                      >
                        <CsSalesCheckIcon />
                      </span>
                    ) : (
                      <span
                        style={{
                          display: 'inline-grid',
                          placeItems: 'center',
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: 'rgba(168,84,48,0.12)',
                        }}
                      >
                        <CsSalesXIcon />
                      </span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: '1rem 1.1rem',
                      borderTop: `1px solid ${CS_SALES.SAGE_LINE}`,
                      textAlign: 'center',
                    }}
                  >
                    {row.vipPass ? (
                      <span
                        style={{
                          display: 'inline-grid',
                          placeItems: 'center',
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: CS_SALES.SAGE_SOFT,
                        }}
                      >
                        <CsSalesCheckIcon />
                      </span>
                    ) : (
                      <span
                        style={{
                          display: 'inline-grid',
                          placeItems: 'center',
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: 'rgba(168,84,48,0.12)',
                        }}
                      >
                        <CsSalesXIcon />
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
