'use client';

import { useEffect } from 'react';
import { trackPageView } from './trackPageView';

type Props = {
  pageType: 'optin' | 'sales';
  summitId: string;
  funnelId: string;
  funnelStepId: string;
};

export function PageViewTracker({ pageType, summitId, funnelId, funnelStepId }: Props) {
  useEffect(() => {
    trackPageView({
      page_type: pageType,
      summit_id: summitId,
      funnel_id: funnelId,
      funnel_step_id: funnelStepId,
    });
  }, [pageType, summitId, funnelId, funnelStepId]);

  return null;
}
