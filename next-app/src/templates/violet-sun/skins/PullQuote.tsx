import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';

type Props = {
  content: SectionContentMap['pull-quote'];
};

export function PullQuote({ content }: Props) {
  const pq = content;
  return (
    <section className="violet-sun-grad-violet-dark text-white py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 violet-sun-dots-bg opacity-30"></div>
      <div
        className="absolute top-10 right-10 w-32 h-32 rounded-full blur-3xl"
        style={{ background: 'rgba(255,195,0,0.2)' }}
      ></div>
      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <svg
          className="w-16 h-16 mx-auto mb-6"
          style={{ color: '#FFC300' }}
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
        </svg>
        <p className="violet-sun-display font-bold text-3xl md:text-5xl leading-[1.15] mb-8 tracking-[-0.02em]">
          &ldquo;<Node id="pullQuote.quote" role="quote">{pq.quote}</Node>&rdquo;
        </p>
        <div className="inline-flex items-center gap-4">
          <span
            className="w-12 h-[1px]"
            style={{ background: '#FFC300' }}
          ></span>
          <p className="violet-sun-eyebrow" style={{ color: '#FFC300' }}>
            <Node id="pullQuote.attribution" role="body">{pq.attribution}</Node>
          </p>
          <span
            className="w-12 h-[1px]"
            style={{ background: '#FFC300' }}
          ></span>
        </div>
      </div>
    </section>
  );
}
