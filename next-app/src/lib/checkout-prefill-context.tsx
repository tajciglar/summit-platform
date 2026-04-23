'use client'
import { createContext, useContext, type ReactNode } from 'react'

export interface CheckoutPrefill {
  email: string | null
  firstName: string | null
}

const CheckoutPrefillContext = createContext<CheckoutPrefill>({
  email: null,
  firstName: null,
})

export function CheckoutPrefillProvider({
  email,
  firstName,
  children,
}: CheckoutPrefill & { children: ReactNode }) {
  return (
    <CheckoutPrefillContext.Provider value={{ email, firstName }}>
      {children}
    </CheckoutPrefillContext.Provider>
  )
}

export function useCheckoutPrefill(): CheckoutPrefill {
  return useContext(CheckoutPrefillContext)
}
