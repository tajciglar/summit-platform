import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { Icon, INK, LAV, OUTCOME_ICON } from './shared';

type Props = { content: SectionContentMap['outcomes'] };

export function Outcomes({ content }: Props) {
  const o = content;
  return (
    <section className="py-16" style={{ background: '#F4EFFA' }}>
      <div className="max-w-6xl mx-auto px-5 md:px-8 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="indigo-gold-eyebrow-head mb-2"><Node id="outcomes.eyebrow" role="label">{o.eyebrow}</Node></p>
          <h2 className="indigo-gold-h2-head mb-8"><Node id="outcomes.headline" role="heading">{o.headline}</Node></h2>
          <ul className="space-y-4">
            {o.items.map((item, idx) => (
              <li key={`out-${idx}`} className="flex gap-4 items-start">
                <span
                  className="w-11 h-11 rounded-full grid place-items-center flex-shrink-0 shadow"
                  style={{ background: '#fff', color: LAV.c700 }}
                >
                  <Icon id={OUTCOME_ICON[item.icon] ?? 'heart'} className="w-5 h-5" />
                </span>
                <p>
                  <strong style={{ color: INK.c900 }}>{item.title}</strong>
                  <span style={{ color: INK.c800 }}>
                    {' — '}
                    {item.description}
                  </span>
                </p>
              </li>
            ))}
          </ul>
          <a href="#optin" className="indigo-gold-btn-cta mt-6">
            Get Instant Access
            <span className="indigo-gold-btn-arrow">
              <Icon id="arrow-right" className="w-3.5 h-3.5" />
            </span>
          </a>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=700&auto=format&fit=crop&q=60"
          alt=""
          className="rounded-2xl shadow-xl w-full max-w-md mx-auto"
          loading="lazy"
        />
      </div>
    </section>
  );
}
