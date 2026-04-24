import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { VS_SALES } from './shared';

type Props = {
  content: SectionContentMap['upgrade-section'];
};

export function UpgradeSection({ content }: Props) {
  const u = content;
  return (
    <section style={{ padding: '4rem 1.25rem', background: VS_SALES.MIST_50 }}>
      <div style={{ maxWidth: 1152, margin: '0 auto' }}>
        <div style={{ textAlign: 'center' }}>
          <p
            className="violet-sun-italic-serif"
            style={{ color: VS_SALES.VIO_700, fontSize: '1.35rem', marginBottom: '0.35rem' }}
          >
            <Node id="upgradeSection.eyebrow" role="label">{u.eyebrow}</Node>
          </p>
          <h2
            className="violet-sun-display"
            style={{
              fontWeight: 700,
              fontSize: 'clamp(1.85rem, 3.2vw, 2.6rem)',
              color: VS_SALES.INK_900,
              lineHeight: 1.14,
              marginBottom: '1.75rem',
            }}
          >
            <Node id="upgradeSection.headline" role="heading">{u.headline}</Node>
          </h2>
          {u.paragraphs.map((p, i) => (
            <p
              key={i}
              style={{
                color: VS_SALES.INK_700,
                fontSize: '1rem',
                lineHeight: 1.72,
                maxWidth: 700,
                margin: '0 auto 0.85rem',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
