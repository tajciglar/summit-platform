import type { CreamSageContent } from '../../cream-sage.schema';
import { Node } from '../../shared/Node';

type Props = { content: CreamSageContent };

export function Footer({ content }: Props) {
  const f = content.footer;
  return (
    <footer className="py-14 relative overflow-hidden" style={{ background: 'var(--cs-paper-alt, #F4EDE2)' }}>
      <svg
        className="cream-sage-wave-top absolute top-0 left-0 right-0"
        viewBox="0 0 1200 40"
        preserveAspectRatio="none"
        fill="#C4663D"
        aria-hidden="true"
        style={{ opacity: 0.15 }}
      >
        <path d="M0 40 Q 300 0, 600 20 T 1200 10 L 1200 0 L 0 0 Z" />
      </svg>
      <div className="max-w-6xl mx-auto px-6 pt-4">
        <div
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-8"
          style={{ borderBottom: '1px solid rgba(179,195,183,0.5)' }}
        >
          <div className="flex items-center gap-3">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <circle cx="16" cy="16" r="14" fill="#4A6B5D" />
              <path d="M9 16 Q 16 8, 23 16 Q 16 24, 9 16" fill="#E8B9A0" />
            </svg>
            <div>
              <p
                className="font-bold text-2xl"
                style={{ fontFamily: "'Fraunces', serif", color: '#2F4A40' }}
              >
                <Node id="footer.brandName">{f.brandName}</Node>
              </p>
              <p
                className="text-base md:text-lg"
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontStyle: 'italic',
                  color: '#3A3221',
                }}
              >
                <Node id="footer.tagline">{f.tagline}</Node>
              </p>
            </div>
          </div>
          <div
            className="flex items-center gap-6 text-base font-semibold"
            style={{ color: '#3A3221' }}
          >
            {f.links.map((link, idx) => (
              <a
                key={`footer-link-${idx}`}
                href={link.href}
                className="hover:underline"
              >
                <Node id={`footer.links.${idx}.label`}>{link.label}</Node>
              </a>
            ))}
          </div>
        </div>
        <p
          className="text-base mt-6 text-center md:text-left"
          style={{ color: '#3A3221' }}
        >
          <Node id="footer.copyright">{f.copyright}</Node>
        </p>
      </div>
    </footer>
  );
}
