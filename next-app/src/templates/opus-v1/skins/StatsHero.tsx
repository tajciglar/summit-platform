import type { StatsHeroContent } from '../../../sections/stats-hero.schema';

type Props = {
  content: StatsHeroContent;
};

export function StatsHero({ content }: Props) {
  return (
    <section className="bg-paper-100 py-16 md:py-24 border-b border-paper-300">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-center figure-label mb-10">By the Numbers</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-4 text-center">
          <div className="md:border-r md:border-paper-300 md:pr-4">
            <p className="font-display font-black text-7xl md:text-8xl text-ink-700 leading-none mb-3">
              {content.statValue1}
            </p>
            <p className="font-opus-serif italic text-taupe-700 text-lg">{content.statLabel1}</p>
          </div>
          <div className="md:border-r md:border-paper-300 md:pr-4">
            <p className="font-display font-black text-7xl md:text-8xl text-ochre-600 leading-none mb-3">
              {content.statValue2}
            </p>
            <p className="font-opus-serif italic text-taupe-700 text-lg">{content.statLabel2}</p>
          </div>
          <div>
            <p className="font-display font-black text-7xl md:text-8xl text-ink-700 leading-none mb-3">
              {content.statValue3}
            </p>
            <p className="font-opus-serif italic text-taupe-700 text-lg">{content.statLabel3}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
