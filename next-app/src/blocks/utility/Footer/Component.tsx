import type { Props } from './schema'

export function Footer(props: Props) {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-[1200px] px-6 py-12">
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-start md:justify-between md:text-left">
          <div className="max-w-md">
            {props.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={props.logoUrl} alt="" className="mb-3 h-10 w-auto" />
            )}
            {props.tagline && (
              <p className="text-sm text-white/70">{props.tagline}</p>
            )}
            {props.summitDatesText && (
              <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-[rgb(var(--color-accent))]">
                {props.summitDatesText}
              </p>
            )}
          </div>
          {props.links.length > 0 && (
            <nav aria-label="Footer links">
              <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 md:justify-end">
                {props.links.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.url}
                      className="text-sm text-white/70 underline-offset-4 transition hover:text-white hover:underline"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/50">
          {props.copyrightText}
        </div>
      </div>
    </footer>
  )
}
