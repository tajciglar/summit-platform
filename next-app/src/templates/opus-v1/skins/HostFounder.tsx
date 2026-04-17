import type { HostFounderContent } from '../../../sections/host-founder.schema';
import { FOUNDER_GRADIENTS } from './shared';

type Props = {
  content: HostFounderContent;
};

export function HostFounder({ content }: Props) {
  return (
    <section className="bg-paper-100 py-20 md:py-28 border-b border-paper-300">
      <div className="max-w-5xl mx-auto px-6">
        <p className="roman text-center mb-2">{content.roman}</p>
        <h2 className="font-display font-black text-4xl md:text-5xl text-ink-700 text-center mb-14 leading-tight">
          {content.headline}
        </h2>
        <div className="grid md:grid-cols-2 gap-12 md:gap-16">
          {content.items.map((founder, idx) => (
            <div key={`founder-${idx}`} className="text-center md:text-left">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center font-display font-black text-2xl text-paper-50 mx-auto md:mx-0 mb-5"
                style={{ background: FOUNDER_GRADIENTS[idx % FOUNDER_GRADIENTS.length] }}
              >
                {founder.initials}
              </div>
              <h3 className="font-display font-bold text-xl text-ink-700 mb-1">{founder.name}</h3>
              <p className="figure-label mb-5">{founder.role}</p>
              <blockquote className="font-opus-serif italic text-taupe-700 text-lg leading-relaxed border-l-2 border-ochre-600 pl-5">
                {`\u201C${founder.quote}\u201D`}
              </blockquote>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
