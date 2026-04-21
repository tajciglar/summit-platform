import type { MarqueeContent } from '../../../sections/marquee.schema';

type Props = {
  content: MarqueeContent;
};

export function Marquee({ content }: Props) {
  // Duplicate items to make the marquee loop seamlessly.
  const items = [...content.items, ...content.items];
  return (
    <section className="bg-paper-50 py-10 border-b border-paper-300">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center figure-label mb-6">As Featured In</p>
        <div className="marquee-wrap">
          <div className="marquee-track">
            {items.map((name, idx) => (
              <span className="marquee-item" key={`featured-${idx}`}>
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
