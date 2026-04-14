import type { Props } from './schema'

export function LogoStripCarousel(props: Props) {
  if (props.animation === 'static') {
    return (
      <section className="bg-white py-10">
        <div className="mx-auto max-w-[1200px] px-6">
          {props.headline && (
            <p className="mb-6 text-center text-sm uppercase tracking-wider text-gray-500">
              {props.headline}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
            {props.logos.map((logo, i) => (
              <LogoItem key={i} logo={logo} />
            ))}
          </div>
        </div>
      </section>
    )
  }

  const doubled = [...props.logos, ...props.logos]

  return (
    <section className="overflow-hidden bg-white py-10">
      {props.headline && (
        <p className="mb-6 text-center text-sm uppercase tracking-wider text-gray-500">
          {props.headline}
        </p>
      )}
      <div
        className="flex w-max gap-12 whitespace-nowrap animate-[marquee-scroll_40s_linear_infinite]"
        aria-hidden={false}
      >
        {doubled.map((logo, i) => (
          <LogoItem key={i} logo={logo} hideFromA11y={i >= props.logos.length} />
        ))}
      </div>
    </section>
  )
}

function LogoItem({
  logo,
  hideFromA11y,
}: {
  logo: Props['logos'][number]
  hideFromA11y?: boolean
}) {
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logo.imageUrl}
      alt={hideFromA11y ? '' : logo.name}
      className="h-10 w-auto shrink-0 opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0"
    />
  )

  if (logo.websiteUrl && !hideFromA11y) {
    return (
      <a
        href={logo.websiteUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={logo.name}
      >
        {img}
      </a>
    )
  }
  return <div aria-hidden={hideFromA11y || undefined}>{img}</div>
}
