import { Node } from '../../shared/Node';
import type { SectionContentMap } from '../bridge';
import { INK, LAV } from './shared';

type Props = { content: SectionContentMap['footer'] };

export function Footer({ content }: Props) {
  const f = content;
  const logo = f.logo;
  return (
    <footer className="py-10" style={{ background: LAV.c50, borderTop: `1px solid ${LAV.c200}` }}>
      <div className="max-w-4xl mx-auto px-5 md:px-8 text-center">
        {logo?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo.url}
            alt={logo.alt ?? f.brandName}
            width={logo.width ?? undefined}
            height={logo.height ?? undefined}
            className="mx-auto mb-4 h-10 w-auto"
            data-testid="indigo-gold-footer-logo"
          />
        ) : null}
        <p className="indigo-gold-display italic text-xl mb-4" style={{ color: LAV.c700 }}>
          <Node id="footer.brandName" role="body">{f.brandName}</Node>
        </p>
        <nav className="text-sm flex flex-wrap justify-center gap-6" style={{ color: INK.c700 }}>
          {f.links.map((link, idx) => (
            <a key={`foot-${idx}`} href={link.href} className="hover:underline">
              {link.label}
            </a>
          ))}
        </nav>
        <p className="text-xs mt-3" style={{ color: INK.c700 }}>
          <Node id="footer.copyright" role="body">{f.copyright}</Node>
        </p>
      </div>
    </footer>
  );
}
