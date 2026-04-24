import { Node } from '../../shared/Node';
import type { GreenGoldContent } from '../../green-gold.schema';

type Props = { content: GreenGoldContent };

export function Footer({ content }: Props) {
  const f = content.footer;
  return (
    <footer
      className="py-10"
      style={{ background: '#0F1F0F', color: '#BBF7D0' }}>

      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: '#16A34A' }}>

              <span className="green-gold-heading font-black text-white text-lg">
                <Node id="footer.brandInitial" role="body">{f.brandInitial}</Node>
              </span>
            </div>
            <div>
              <p
                className="green-gold-heading font-bold text-sm"
                style={{ color: '#FFFFFF' }}>

                <Node id="footer.brandName" role="body">{f.brandName}</Node>
              </p>
              <p
                className="text-xs"
                style={{ color: '#86EFAC' }}>

                <Node id="footer.tagline" role="tagline">{f.tagline}</Node>
              </p>
            </div>
          </div>
          <div className="flex gap-6 text-sm">
            {f.links.map((link, idx) =>
            <a
              key={`footer-link-${idx}`}
              href={link.href}
              style={{ color: 'inherit' }}>

                {link.label}
              </a>
            )}
          </div>
          <p
            className="text-xs"
            style={{ color: '#4ADE80' }}>

            <Node id="footer.copyright" role="body">{f.copyright}</Node>
          </p>
        </div>
      </div>
    </footer>);

}
