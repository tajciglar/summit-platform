'use client'
import { createContext, useContext } from 'react'

interface FunnelContextValue {
  funnelId: string
  funnelSlug: string
  summitSlug: string
}

const FunnelContext = createContext<FunnelContextValue | null>(null)

export function FunnelProvider({
  children,
  value,
}: {
  children: React.ReactNode
  value: FunnelContextValue
}) {
  return <FunnelContext.Provider value={value}>{children}</FunnelContext.Provider>
}

export function useFunnel(): FunnelContextValue {
  const ctx = useContext(FunnelContext)
  if (!ctx) throw new Error('useFunnel must be used inside FunnelProvider')
  return ctx
}
