'use client';

import type { AnchorHTMLAttributes } from 'react';
import { buildTrackingUrl } from './buildTrackingUrl';

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'onClick'> & {
  href: string;
};

/**
 * Drop-in replacement for the "no thanks" / decline link on sales pages.
 * Forwards UTM params + Meta identifiers (fbclid, _fbp, _fbc) onto the
 * outbound URL so the destination site can attribute the visit back to
 * the original traffic source.
 *
 * Unlike `TrackedCheckoutLink`, no pixel event is fired — declines are not
 * conversions; we only carry identity forward.
 */
export function TrackedDeclineLink({ href, children, ...rest }: Props) {
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (href.startsWith('#')) return;
    e.preventDefault();
    window.location.href = buildTrackingUrl(href);
  }

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
