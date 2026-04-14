'use client'
import { createContext, useContext, type ReactNode } from 'react'

export interface Theme {
  primaryColor: string
  accentColor: string
  fontHeading: string
  fontBody: string
  logoUrl: string | null
  backgroundStyle: 'light' | 'dark' | 'gradient'
}

const defaultTheme: Theme = {
  primaryColor: '#5e4d9b',
  accentColor: '#00b553',
  fontHeading: 'Inter',
  fontBody: 'Inter',
  logoUrl: null,
  backgroundStyle: 'light',
}

const ThemeContext = createContext<Theme>(defaultTheme)

export function ThemeProvider({ theme, children }: { theme: Theme; children: ReactNode }) {
  const cssVars = {
    '--color-primary': hexToRgbTriplet(theme.primaryColor),
    '--color-accent': hexToRgbTriplet(theme.accentColor),
    '--font-heading': theme.fontHeading,
    '--font-body': theme.fontBody,
  } as React.CSSProperties

  return (
    <ThemeContext.Provider value={theme}>
      <div style={cssVars}>{children}</div>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}

function hexToRgbTriplet(hex: string): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `${r} ${g} ${b}`
}
