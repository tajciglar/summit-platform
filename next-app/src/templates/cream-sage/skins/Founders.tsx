import type { CreamSageContent } from '../../cream-sage.schema';
import { Node } from '../../shared/Node';
import { FOUNDER_GRADIENTS } from './shared';

type Props = { content: CreamSageContent };

export function Founders({ content }: Props) {
  const f = content.founders;
  return (
    <section className="py-20 md:py-28" style={{ background: 'var(--cs-paper, #FAF7F2)' }}>
      <div className="max-w-5xl mx-auto px-6">
        <h2
          className="font-black text-4xl md:text-5xl text-center mb-14 leading-tight"
          style={{ fontFamily: "'Fraunces', serif", color: '#2A2419' }}
        >
          <Node id="founders.headline">{f.headline}</Node>
        </h2>
        <div className="grid md:grid-cols-2 gap-12 md:gap-16">
          {f.items.map((founder, idx) => (
            <div
              key={`founder-${idx}`}
              className="text-center md:text-left"
            >
              <div
                className="w-32 h-32 rounded-full flex items-center justify-center font-black text-3xl mx-auto md:mx-0 mb-5 shadow-xl"
                style={{
                  background: FOUNDER_GRADIENTS[idx % FOUNDER_GRADIENTS.length],
                  color: '#FAF7F2',
                  fontFamily: "'Fraunces', serif",
                }}
              >
                <Node id={`founders.items.${idx}.initials`}>{founder.initials}</Node>
              </div>
              <h3
                className="font-bold text-2xl"
                style={{ fontFamily: "'Fraunces', serif", color: '#2A2419' }}
              >
                <Node id={`founders.items.${idx}.name`}>{founder.name}</Node>
              </h3>
              <p
                className="text-base mb-5 font-semibold"
                style={{ color: '#3D5A4E' }}
              >
                <Node id={`founders.items.${idx}.role`}>{founder.role}</Node>
              </p>
              <blockquote
                className="cream-sage-dropcap text-xl md:text-2xl leading-relaxed"
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontStyle: 'italic',
                  color: '#3A3221',
                }}
              >
                <Node id={`founders.items.${idx}.quote`}>{founder.quote}</Node>
              </blockquote>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
