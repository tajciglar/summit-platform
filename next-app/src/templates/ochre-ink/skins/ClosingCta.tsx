import type { ClosingCtaContent } from '../../../sections/closing-cta.schema';

type Props = {
  content: ClosingCtaContent;
};

export function ClosingCta({ content }: Props) {
  return (
    <section className="bg-ink-700 py-24 md:py-32 border-b-8 border-ochre-600" id="final-cta">
      <div className="max-w-4xl mx-auto px-6 text-center">
        {content.eyebrow ? <p className="eyebrow text-ochre-400 mb-6">{content.eyebrow}</p> : null}
        <h2 className="font-display font-black text-5xl md:text-6xl lg:text-7xl text-paper-50 leading-[1.05] mb-8 tracking-tight">
          {content.headline}
        </h2>
        <p className="font-opus-serif italic text-paper-200 text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
          {content.subheadline}
        </p>
        <a
          href="#optin"
          className="inline-flex items-center gap-3 bg-ochre-600 hover:bg-ochre-500 text-ink-700 font-ui font-bold text-lg px-10 py-5 rounded-full transition"
        >
          {content.ctaLabel}
          <span className="text-xl">→</span>
        </a>
        {content.fineprint ? <p className="figure-label mt-8 text-paper-400">{content.fineprint}</p> : null}
      </div>
    </section>
  );
}
