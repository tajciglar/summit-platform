'use client';

import type { AnchorHTMLAttributes } from 'react';
import { trackPageView } from './trackPageView';
import { useCheckoutTracking } from './CheckoutTrackingContext';

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'onClick'> & {
  href: string;
};

/**
 * Drop-in replacement for `<a href={resolveCheckoutHref(url)}>` on sales pages.
 * Fires a checkout_click page_view event before navigating to the WP checkout URL.
 */
export function TrackedCheckoutLink({ href, children, ...rest }: Props) {
  const { summitId, funnelId, funnelStepId } = useCheckoutTracking();

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    // Only intercept real external redirects — fall through for hash anchors
    if (!href.startsWith('#')) {
      e.preventDefault();
      trackPageView({
        page_type: 'checkout_click',
        summit_id: summitId,
        funnel_id: funnelId,
        funnel_step_id: funnelStepId,
      }).finally(() => {
        window.location.href = href;
      });
    }
  }

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
