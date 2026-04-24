import { Node } from '../../shared/Node';
import type { GreenGoldContent } from '../../green-gold.schema';
import { GG_SALES, salesEyebrow, salesHeadline } from './shared';

type Props = { content: GreenGoldContent };

export function Intro({ content }: Props) {
  if (!content.intro) return null;
  const i = content.intro;
  return (
    <section style={{ padding: '3.5rem 1.25rem', background: '#fff' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <p className="green-gold-heading" style={salesEyebrow}><Node id="intro.eyebrow" role="label">{i.eyebrow}</Node></p>
        <h2 className="green-gold-heading" style={{ ...salesHeadline, marginBottom: '1.5rem' }}><Node id="intro.headline" role="heading">{i.headline}</Node></h2>
        {i.paragraphs.map((p, idx) =>
        <p key={idx} style={{ color: GG_SALES.INK700, fontSize: '1.1rem', lineHeight: 1.75, marginBottom: '1rem' }}>{p}</p>
        )}
      </div>
    </section>);

}
