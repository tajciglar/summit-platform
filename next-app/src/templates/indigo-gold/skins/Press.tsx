import type { SectionContentMap } from '../bridge';
import { LAV } from './shared';

type Props = { content: SectionContentMap['press'] };

export function Press({ content }: Props) {
  const outlets = content.outlets;
  const full = [...outlets, ...outlets];
  return (
    <section className="py-10 bg-white">
      <p className="text-center text-xs font-semibold mb-5" style={{ color: LAV.c700, letterSpacing: '0.25em' }}>
        {content.eyebrow.toUpperCase()}
      </p>
      <div className="indigo-gold-marquee-wrap">
        <div className="indigo-gold-marquee-track">
          {full.map((name, idx) => (
            <span className="indigo-gold-logo-wordmark" key={`logo-${idx}`}>
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
