import type { GreenGoldContent } from '../../green-gold.schema';

type Props = { content: GreenGoldContent };

export function Trust({ content }: Props) {
  return (
    <section
      className="bg-white py-5"
      style={{ borderBottom: '1px solid #DCFCE7' }}>

      <div
        className="max-w-4xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 md:gap-10 text-sm"
        style={{ color: 'rgba(26,46,26,0.6)' }}>

        {content.trust.items.map((item, idx) =>
        <span key={`trust-${idx}`} className="flex items-center gap-2">
            <svg
            className="w-4 h-4"
            style={{ color: idx === 3 ? '#EAB308' : '#16A34A' }}
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true">

              <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd" />

            </svg>
            {item}
          </span>
        )}
      </div>
    </section>);

}
