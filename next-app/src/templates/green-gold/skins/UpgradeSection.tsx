import { Node } from '../../shared/Node';
import type { GreenGoldContent } from '../../green-gold.schema';
import { GG_SALES, salesEyebrow, salesHeadline } from './shared';

type Props = { content: GreenGoldContent };

export function UpgradeSection({ content }: Props) {
  if (!content.upgradeSection) return null;
  const u = content.upgradeSection;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: GG_SALES.GREEN50 }}>
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        <div style={{ textAlign: 'center' }}>
          <p className="green-gold-heading" style={salesEyebrow}><Node id="upgradeSection.eyebrow" role="label">{u.eyebrow}</Node></p>
          <h2 className="green-gold-heading" style={{ ...salesHeadline, marginBottom: '1.5rem' }}><Node id="upgradeSection.headline" role="heading">{u.headline}</Node></h2>
          {u.paragraphs.map((p, i) =>
          <p key={i} style={{ color: GG_SALES.INK700, fontSize: '1.05rem', lineHeight: 1.75, marginBottom: '0.85rem', maxWidth: 680, margin: '0 auto 0.85rem' }}>{p}</p>
          )}
        </div>
      </div>
    </section>);

}
