import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { Icon, INK, LAV } from './shared';

type Props = { content: SectionContentMap['shifts'] };

export function Shifts({ content }: Props) {
  const s = content;
  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-5 md:px-8 text-center">
        <p className="indigo-gold-eyebrow-head mb-2"><Node id="shifts.eyebrow" role="label">{s.eyebrow}</Node></p>
        <h2 className="indigo-gold-h2-head mb-10"><Node id="shifts.headline" role="heading">{s.headline}</Node></h2>
        <div className="rounded-2xl p-8 md:p-10 text-left space-y-5 shadow" style={{ background: LAV.c50 }}>
          {s.items.map((item, idx) => (
            <p key={`shift-${idx}`} className="flex gap-3">
              <span
                className="w-8 h-8 rounded-full grid place-items-center flex-shrink-0"
                style={{ background: '#DCFCE7', color: '#16A34A' }}
              >
                <Icon id="arrow-up-right" className="w-4 h-4" />
              </span>
              <span style={{ color: INK.c800 }}>
                <strong style={{ color: INK.c900 }}>{item.title}.</strong> {item.description}
              </span>
            </p>
          ))}
        </div>
        <a href="#optin" className="indigo-gold-btn-cta mt-8">
          Get Instant Access
          <span className="indigo-gold-btn-arrow">
            <Icon id="arrow-right" className="w-3.5 h-3.5" />
          </span>
        </a>
      </div>
    </section>
  );
}
