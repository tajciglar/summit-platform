import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, useTheme } from './theme-context'

function Probe() {
  const theme = useTheme()
  return <div>{theme.primaryColor}</div>
}

describe('ThemeProvider', () => {
  it('provides theme to children', () => {
    render(
      <ThemeProvider theme={{
        primaryColor: '#5e4d9b', accentColor: '#00b553',
        fontHeading: 'Inter', fontBody: 'Inter',
        logoUrl: null, backgroundStyle: 'light',
      }}>
        <Probe />
      </ThemeProvider>
    )
    expect(screen.getByText('#5e4d9b')).toBeInTheDocument()
  })
})
