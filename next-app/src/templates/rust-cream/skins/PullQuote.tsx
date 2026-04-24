import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';

type Props = {
  content: SectionContentMap['pull-quote'];
};

export function PullQuote({ content: pq }: Props) {
  return (
    <section className="py-14 md:py-20" style={{ backgroundColor: '#3D2B1F' }}>
      <div className="max-w-3xl mx-auto px-6 text-center">
        <svg
          className="w-10 h-10 mx-auto mb-4 opacity-50"
          style={{ color: '#C2703E' }}
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true">

          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
        </svg>
        <p className="rust-cream-heading font-bold text-2xl md:text-3xl text-white leading-relaxed italic">
          &ldquo;<Node id="pullQuote.quote" role="quote">{pq.quote}</Node>&rdquo;
        </p>
        <p className="font-medium text-sm mt-4" style={{ color: '#E8C4A8' }}>
          <Node id="pullQuote.attribution" role="body">{pq.attribution}</Node>
        </p>
      </div>
    </section>
  );
}
