import type { CreamSageContent } from '../../cream-sage.schema';
import { Node } from '../../shared/Node';

type Props = { content: CreamSageContent };

export function PullQuote({ content }: Props) {
  const pq = content.pullQuote;
  return (
    <section
      className="py-24 md:py-32 relative overflow-hidden"
      style={{ background: '#4A6B5D', color: '#FAF7F2' }}
    >
      <svg
        className="cream-sage-wave-top absolute top-0 left-0 right-0"
        viewBox="0 0 1200 40"
        preserveAspectRatio="none"
        fill="#F4EDE2"
        aria-hidden="true"
      >
        <path d="M0 40 Q 300 0, 600 20 T 1200 10 L 1200 0 L 0 0 Z" />
      </svg>
      <div className="max-w-4xl mx-auto px-6 text-center relative mt-6">
        <svg
          className="w-16 h-16 mx-auto mb-6"
          style={{ color: '#E8B9A0', opacity: 0.4 }}
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
        </svg>
        <p
          className="font-black text-3xl md:text-5xl leading-[1.15] mb-8"
          style={{
            fontFamily: "'Fraunces', serif",
            fontStyle: 'italic',
          }}
        >
          <Node id="pullQuote.quote">{pq.quote}</Node>
        </p>
        <p
          className="font-bold text-base md:text-lg tracking-wide"
          style={{
            fontFamily: "'Nunito', 'DM Sans', sans-serif",
            color: '#E8B9A0',
          }}
        >
          <Node id="pullQuote.attribution">{pq.attribution}</Node>
        </p>
      </div>
    </section>
  );
}
