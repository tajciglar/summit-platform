import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { Icon, INK } from './shared';

type Props = { content: SectionContentMap['overview'] };

export function Overview({ content }: Props) {
  const o = content;
  const image =
    o.imageUrl ??
    'https://images.unsplash.com/photo-1591343395082-e120087004b4?w=700&auto=format&fit=crop&q=60';

  return (
    <section className="py-16" style={{ background: '#F4EFFA' }}>
      <div className="max-w-6xl mx-auto px-5 md:px-8 grid md:grid-cols-2 gap-12 items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" className="rounded-2xl shadow-xl w-full max-w-md mx-auto" loading="lazy" />
        <div>
          <p className="indigo-gold-eyebrow-head mb-2"><Node id="overview.eyebrow" role="label">{o.eyebrow}</Node></p>
          <h2 className="indigo-gold-h2-head mb-5"><Node id="overview.headline" role="heading">{o.headline}</Node></h2>
          <div className="space-y-4 leading-relaxed" style={{ color: INK.c800 }}>
            {o.bodyParagraphs.map((para, idx) => (
              <p key={`ovp-${idx}`}>{para}</p>
            ))}
          </div>
          <div className="mt-6">
            <a href="#optin" className="indigo-gold-btn-cta">
              <Node id="overview.ctaLabel" role="button">{o.ctaLabel}</Node>
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
