import { Head } from '@inertiajs/react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import PreviewBanner from '@/components/funnel/PreviewBanner'
import type { FunnelTheme } from '@/types/funnel'
import type { ReactNode } from 'react'

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
        {fontsUrl && <link rel="stylesheet" href={fontsUrl} />}
      </Head>

      {isPreview && <PreviewBanner />}

      {theme.logo_url && (
        <div className="flex justify-center py-4">
          <img src={theme.logo_url} alt="Logo" className="h-10 object-contain" />
        </div>
      )}

      <ThemeProvider theme={theme}>
        <div
          className="min-h-screen"
          style={{
            backgroundColor: theme.colors?.background ?? '#ffffff',
            color: theme.colors?.text ?? '#111827',
            fontFamily: `'${theme.fonts?.body ?? 'Inter'}', sans-serif`,
          }}
        >
          {children}
        </div>
      </ThemeProvider>
    </>
  )
}
