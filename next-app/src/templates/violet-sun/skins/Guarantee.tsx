import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { VS_SALES } from './shared';

type Props = {
  content: SectionContentMap['guarantee'];
};

export function Guarantee({ content }: Props) {
  const g = content;
  return (
    <section style={{ padding: '4rem 1.25rem', background: VS_SALES.MIST_50 }}>
      <div style={{ maxWidth: 740, margin: '0 auto' }}>
        <div
          style={{
            background: VS_SALES.SUN_100,
            border: `2px dashed ${VS_SALES.SUN_500}`,
            borderRadius: 22,
            padding: '1.9rem',
            display: 'flex',
            gap: '1.35rem',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: '3rem', flexShrink: 0 }}>🛡️</div>
          <div>
            <h3
              className="violet-sun-display"
              style={{ fontWeight: 700, fontSize: '1.15rem', color: VS_SALES.INK_900, marginBottom: '0.5rem' }}
            >
              <Node id="guarantee.heading" role="heading">{g.heading}</Node>
            </h3>
            <p
              style={{
                fontSize: '0.95rem',
                color: VS_SALES.INK_700,
                lineHeight: 1.65,
                margin: 0,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <Node id="guarantee.body" role="body">{g.body}</Node>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
