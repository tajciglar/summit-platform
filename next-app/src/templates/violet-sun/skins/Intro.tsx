import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { VS_SALES } from './shared';

type Props = {
  content: SectionContentMap['intro'];
};

export function Intro({ content }: Props) {
  const i = content;
  return (
    <section style={{ padding: '4rem 1.25rem', background: '#FFFFFF' }}>
      <div style={{ maxWidth: 740, margin: '0 auto', textAlign: 'center' }}>
        <p
          className="violet-sun-italic-serif"
          style={{ color: VS_SALES.VIO_700, fontSize: '1.4rem', marginBottom: '0.6rem' }}
        >
          <Node id="intro.eyebrow" role="label">{i.eyebrow}</Node>
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
          <Node id="intro.headline" role="heading">{i.headline}</Node>
        </h2>
        {i.paragraphs.map((p, idx) => (
          <p
            key={idx}
            style={{
              color: VS_SALES.INK_700,
              fontSize: '1.1rem',
              lineHeight: 1.72,
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
