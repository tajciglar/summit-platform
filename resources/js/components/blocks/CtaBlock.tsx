import type { CtaBlockData } from '@/types/blocks'

export default function CtaBlock({ data }: { data: CtaBlockData }) {
  const styleMap = {
    primary: { bg: 'var(--theme-primary)', text: 'white' },
    accent: { bg: 'var(--theme-accent)', text: 'var(--theme-secondary)' },
    dark: { bg: 'var(--theme-secondary)', text: 'white' },
  }
  const colors = styleMap[data.style ?? 'primary']

  return (
    <section className="py-16 text-center" style={{ backgroundColor: colors.bg }}>
      <div className="max-w-2xl mx-auto px-6">
        {data.heading && (
          <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ fontFamily: 'var(--font-heading), sans-serif', color: colors.text }}>
            {data.heading}
          </h2>
        )}
        {data.subheading && <p className="text-lg mb-6" style={{ color: colors.text, opacity: 0.8 }}>{data.subheading}</p>}
        <a
          href={data.button_url ?? '#register'}
          className="inline-flex items-center px-10 py-4 rounded-lg text-lg font-bold shadow-lg hover:opacity-90 active:scale-[0.98] transition-all focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          style={{ backgroundColor: 'var(--theme-surface)', color: colors.bg }}
        >
          {data.button_text}
        </a>
      </div>
    </section>
  )
}
