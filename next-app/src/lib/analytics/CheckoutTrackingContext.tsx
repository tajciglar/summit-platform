'use client';

import { createContext, useContext, type ReactNode } from 'react';

export type CheckoutTrackingIds = {
  summitId: string;
  funnelId: string;
  funnelStepId: string;
};

const CheckoutTrackingContext = createContext<CheckoutTrackingIds>({
  summitId: '',
  funnelId: '',
  funnelStepId: '',
});

export function CheckoutTrackingProvider({
  children,
  summitId,
  funnelId,
  funnelStepId,
}: CheckoutTrackingIds & { children: ReactNode }) {
  return (
    <CheckoutTrackingContext.Provider value={{ summitId, funnelId, funnelStepId }}>
      {children}
    </CheckoutTrackingContext.Provider>
  );
}

export function useCheckoutTracking(): CheckoutTrackingIds {
  return useContext(CheckoutTrackingContext);
}
