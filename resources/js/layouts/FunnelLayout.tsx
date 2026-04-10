import { Head } from '@inertiajs/react'
import { Component, type ErrorInfo } from 'react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import PreviewBanner from '@/components/funnel/PreviewBanner'
import type { FunnelTheme } from '@/types/funnel'
import type { ReactNode } from 'react'

class FunnelErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Funnel page error:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-8">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-6">We hit an unexpected error loading this page. Please try refreshing.</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-block px-6 py-2.5 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors"
            >
              Refresh page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

interface Props {
  theme: FunnelTheme
  isPreview: boolean
  title?: string
  children: ReactNode
}

function googleFontsUrl(theme: FunnelTheme): string | null {
  const fonts = new Set<string>()
  if (theme.fonts?.heading && theme.fonts.heading !== 'Inter') fonts.add(theme.fonts.heading)
  if (theme.fonts?.body && theme.fonts.body !== 'Inter') fonts.add(theme.fonts.body)
  if (fonts.size === 0) return null

  const families = [...fonts].map((f) => `family=${f.replace(/ /g, '+')}:wght@400;500;600;700`).join('&')
  return `https://fonts.googleapis.com/css2?${families}&display=swap`
}

export default function FunnelLayout({ theme, isPreview, title, children }: Props) {
  const fontsUrl = googleFontsUrl(theme)

  return (
    <>
      <Head>
        {title && <title>{title}</title>}
        {fontsUrl && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link rel="preload" href={fontsUrl} as="style" />
            <link rel="stylesheet" href={fontsUrl} />
          </>
        )}
      </Head>

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-medium"
        style={{ backgroundColor: 'var(--theme-primary)', color: '#fff' }}
      >
        Skip to content
      </a>

      {isPreview && <PreviewBanner />}

      {theme.logo_url && (
        <div className="flex justify-center py-4">
          <img
            src={theme.logo_url}
            alt={theme.logo_alt ?? title ?? 'Site logo'}
            className="h-10 object-contain"
          />
        </div>
      )}

      <ThemeProvider theme={theme}>
        <FunnelErrorBoundary>
          <main
            id="main-content"
            className="min-h-screen"
            style={{
              backgroundColor: theme.colors?.background ?? '#ffffff',
              color: theme.colors?.text ?? '#111827',
              fontFamily: `'${theme.fonts?.body ?? 'Inter'}', sans-serif`,
            }}
          >
            {children}
          </main>
        </FunnelErrorBoundary>
      </ThemeProvider>
    </>
  )
}
