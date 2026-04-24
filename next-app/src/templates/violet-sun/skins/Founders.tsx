import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { FOUNDER_GRADIENTS, FOUNDER_TEXT_COLORS } from './shared';

type Props = {
  content: SectionContentMap['founders'];
};

export function Founders({ content }: Props) {
  const f = content;
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-6">
        <h2
          className="violet-sun-display font-bold text-4xl md:text-5xl text-center mb-14 tracking-[-0.03em] leading-tight"
          style={{ color: '#110833' }}
        >
          <Node id="founders.headlineLead" role="heading">{f.headlineLead}</Node>
          <span
            className="violet-sun-italic-serif"
            style={{ color: '#6F4EE6' }}
          >
            <Node id="founders.headlineAccent" role="heading">{f.headlineAccent}</Node>
          </span>
        </h2>
        <div className="grid md:grid-cols-2 gap-12">
          {f.items.map((founder, idx) => (
            <div
              key={`founder-${idx}`}
              className="violet-sun-card-mist p-8 md:p-10"
            >
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center violet-sun-display font-bold text-xl shadow-lg"
                  style={{
                    background: FOUNDER_GRADIENTS[idx % FOUNDER_GRADIENTS.length],
                    color: FOUNDER_TEXT_COLORS[idx % FOUNDER_TEXT_COLORS.length],
                  }}
                >
                  {founder.initials}
                </div>
                <div>
                  <p
                    className="violet-sun-display font-bold text-lg"
                    style={{ color: '#110833' }}
                  >
                    {founder.name}
                  </p>
                  <p className="text-sm" style={{ color: '#6B638A' }}>
                    {founder.role}
                  </p>
                </div>
              </div>
              <blockquote
                className="violet-sun-italic-serif text-xl leading-relaxed pl-6"
                style={{
                  color: 'rgba(35,19,95,0.9)',
                  borderLeft: '4px solid #FFC300',
                }}
              >
                &ldquo;{founder.quote}&rdquo;
              </blockquote>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
