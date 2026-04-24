import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { BC_SALES } from './shared';

type Props = {
  content: SectionContentMap['guarantee'];
};

export function Guarantee({ content }: Props) {
  if (!content) return null;
  const g = content;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: BC_SALES.SKY50 }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ background: BC_SALES.CREAM, border: `2px dashed ${BC_SALES.CORAL300}`, borderRadius: 22, padding: '1.85rem', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
          <div aria-hidden="true" style={{ flexShrink: 0, width: 64, height: 64, borderRadius: '50%', background: '#fff', border: `2px solid ${BC_SALES.CORAL300}`, display: 'grid', placeItems: 'center' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={BC_SALES.CORAL600} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <h3 className="blue-coral-heading" style={{ fontWeight: 700, fontSize: '1.15rem', color: BC_SALES.NAVY900, marginBottom: '0.5rem' }}><Node id="guarantee.heading" role="heading">{g.heading}</Node></h3>
            <p style={{ fontSize: '0.95rem', color: BC_SALES.INK700, lineHeight: 1.65, margin: 0 }}><Node id="guarantee.body" role="body">{g.body}</Node></p>
          </div>
        </div>
      </div>
    </section>);

}
