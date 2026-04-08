import { createContext, useContext, type ReactNode } from 'react'
import type { FunnelTheme } from '@/types/funnel'

const ThemeContext = createContext<FunnelTheme>({})

export function useTheme() {
  return useContext(ThemeContext)
}

const defaults = {
  primary: '#4f46e5',
  secondary: '#1e293b',
  accent: '#f59e0b',
  background: '#ffffff',
  text: '#111827',
}

export function ThemeProvider({ theme, children }: { theme: FunnelTheme; children: ReactNode }) {
  const colors = theme.colors ?? {}
  const fonts = theme.fonts ?? {}

  const style = {
    '--theme-primary': colors.primary ?? defaults.primary,
    '--theme-secondary': colors.secondary ?? defaults.secondary,
    '--theme-accent': colors.accent ?? defaults.accent,
    '--theme-bg': colors.background ?? defaults.background,
    '--theme-text': colors.text ?? defaults.text,
    '--font-heading': fonts.heading ?? 'Inter',
    '--font-body': fonts.body ?? 'Inter',
  } as React.CSSProperties

  return (
    <ThemeContext.Provider value={theme}>
      <div style={style}>{children}</div>
    </ThemeContext.Provider>
  )
}
