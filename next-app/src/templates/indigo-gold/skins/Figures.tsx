import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { Icon, INK, type IconId } from './shared';

type Props = { content: SectionContentMap['figures'] };

export function Figures({ content }: Props) {
  const f = content;
  const icons: IconId[] = ['brain', 'users', 'heart', 'message', 'book', 'target'];
  return (
    <section className="py-16" style={{ background: '#F4EFFA' }}>
      <div className="max-w-5xl mx-auto px-5 md:px-8 text-center">
        <p className="indigo-gold-eyebrow-head mb-2"><Node id="figures.eyebrow" role="label">{f.eyebrow}</Node></p>
        <h2 className="indigo-gold-h2-head mb-10"><Node id="figures.headline" role="heading">{f.headline}</Node></h2>
        <div className="grid md:grid-cols-2 gap-4 text-left">
          {f.items.map((item, idx) => (
            <div key={`fig-${idx}`} className="indigo-gold-factcard">
              <div className="indigo-gold-factcard-ico">
                <Icon id={icons[idx % icons.length]} className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-lg" style={{ color: INK.c900 }}>
                  {item.value}
                </p>
                <p className="text-sm" style={{ color: INK.c800 }}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
