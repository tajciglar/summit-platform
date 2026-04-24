import { Node } from '../../shared/Node';
import type { GreenGoldContent } from '../../green-gold.schema';
import { GG_SALES } from './shared';

type Props = { content: GreenGoldContent };

export function Guarantee({ content }: Props) {
  if (!content.guarantee) return null;
  const g = content.guarantee;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: GG_SALES.GREEN50 }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ background: GG_SALES.CREAM, border: `2px dashed ${GG_SALES.CREAM_BORDER}`, borderRadius: 22, padding: '1.85rem', display: 'flex', gap: '1.25rem', alignItems: 'center', boxShadow: '0 10px 26px -16px rgba(234,179,8,.35)' }}>
          <div style={{ fontSize: '3rem', flexShrink: 0 }}>🛡️</div>
          <div>
            <h3 className="green-gold-heading" style={{ fontWeight: 800, fontSize: '1.15rem', color: GG_SALES.INK900, marginBottom: '0.5rem' }}><Node id="guarantee.heading" role="heading">{g.heading}</Node></h3>
            <p style={{ fontSize: '0.95rem', color: GG_SALES.INK700, lineHeight: 1.65, margin: 0 }}><Node id="guarantee.body" role="body">{g.body}</Node></p>
          </div>
        </div>
      </div>
    </section>);

}
