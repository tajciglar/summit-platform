import { Node } from '../../shared/Node';
import type { GreenGoldContent } from '../../green-gold.schema';
import { GG_SALES, salesHeadline } from './shared';

type Props = { content: GreenGoldContent };

export function WhySection({ content }: Props) {
  if (!content.whySection) return null;
  const w = content.whySection;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: '#fff' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <h2 className="green-gold-heading" style={{ ...salesHeadline, marginBottom: '0.6rem' }}><Node id="whySection.headline" role="heading">{w.headline}</Node></h2>
        <p className="green-gold-heading" style={{ fontSize: '1.2rem', fontWeight: 700, color: GG_SALES.GREEN700, marginBottom: '1.5rem', letterSpacing: '.01em' }}><Node id="whySection.subheadline" role="heading">{w.subheadline}</Node></p>
        {w.paragraphs.map((p, i) =>
        <p key={i} style={{ color: GG_SALES.INK700, fontSize: '1.05rem', lineHeight: 1.75, marginBottom: '1rem' }}>{p}</p>
        )}
      </div>
    </section>);

}
