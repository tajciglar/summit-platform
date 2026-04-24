import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { Icon, INK, LAV } from './shared';

type Props = { content: SectionContentMap['founders'] };

export function Founders({ content }: Props) {
  const f = content;
  return (
    <section className="py-16" style={{ background: '#F4EFFA' }}>
      <div className="max-w-6xl mx-auto px-5 md:px-8 text-center">
        <p className="indigo-gold-eyebrow-head mb-2">From the</p>
        <h2 className="indigo-gold-h2-head mb-12"><Node id="founders.headline" role="heading">{f.headline}</Node></h2>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-3xl mx-auto text-left">
          <div className="flex justify-center gap-8 mb-8 flex-wrap">
            {f.items.map((founder, idx) => (
              <div key={`fndr-${idx}`} className="text-center">
                <div
                  className="w-24 h-24 rounded-full mx-auto flex items-center justify-center indigo-gold-display font-bold text-2xl"
                  style={{
                    background: `linear-gradient(135deg,${LAV.c400},${LAV.c600})`,
                    color: '#fff',
                    border: `4px solid ${LAV.c300}`,
                  }}
                >
                  {founder.initials}
                </div>
                <p className="font-bold mt-3" style={{ color: INK.c900 }}>
                  {founder.name}
                </p>
                <p className="text-xs max-w-[180px] mx-auto" style={{ color: INK.c700 }}>
                  {founder.role}
                </p>
              </div>
            ))}
          </div>
          <div className="space-y-4 leading-relaxed" style={{ color: INK.c800 }}>
            {f.items.map((founder, idx) => (
              <p key={`fndrq-${idx}`}>
                <strong>{founder.name}:</strong> &ldquo;{founder.quote}&rdquo;
              </p>
            ))}
          </div>
          <div className="text-center mt-6">
            <a href="#optin" className="indigo-gold-btn-cta">
              Get Instant Access
              <span className="indigo-gold-btn-arrow">
                <Icon id="arrow-right" className="w-3.5 h-3.5" />
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
