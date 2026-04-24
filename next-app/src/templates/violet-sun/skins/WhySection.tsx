import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { VS_SALES } from './shared';

type Props = {
  content: SectionContentMap['why-section'];
};

export function WhySection({ content }: Props) {
  const w = content;
  return (
    <section style={{ padding: '4rem 1.25rem', background: '#FFFFFF' }}>
      <div style={{ maxWidth: 740, margin: '0 auto', textAlign: 'center' }}>
        <h2
          className="violet-sun-display"
          style={{
            fontWeight: 700,
            fontSize: 'clamp(1.85rem, 3.2vw, 2.6rem)',
            color: VS_SALES.INK_900,
            lineHeight: 1.14,
            marginBottom: '0.6rem',
          }}
        >
          <Node id="whySection.headline" role="heading">{w.headline}</Node>
        </h2>
        <p
          className="violet-sun-italic-serif"
          style={{ fontSize: '1.4rem', color: VS_SALES.VIO_700, marginBottom: '1.75rem' }}
        >
          <Node id="whySection.subheadline" role="heading">{w.subheadline}</Node>
        </p>
        {w.paragraphs.map((p, i) => (
          <p
            key={i}
            style={{
              color: VS_SALES.INK_700,
              fontSize: '1rem',
              lineHeight: 1.78,
              marginBottom: '1rem',
              fontFamily: "'Inter', sans-serif",
            }}
          >
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}
