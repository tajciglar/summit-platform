import { notFound } from 'next/navigation'
import { resolveFunnel } from '@/lib/api-client'
import { RenderBlocks } from '@/lib/render-block'
import { ThemeProvider } from '@/lib/theme-context'

interface PageParams {
  slug?: string[]
}

export default async function FunnelPage({ params }: { params: Promise<PageParams> }) {
  const { slug = [] } = await params

  // URL pattern: /{summitSlug}/{funnelSlug?}/{stepSlug?}
  const [summitSlug, funnelSlug = 'main', stepSlug = 'optin'] = slug

  if (!summitSlug) notFound()

  const data = await resolveFunnel({ summitSlug, funnelSlug, stepSlug })
  if (!data) notFound()

  return (
    <ThemeProvider theme={data.theme}>
      <main>
        <RenderBlocks blocks={data.blocks} />
      </main>
    </ThemeProvider>
  )
}

export const revalidate = 60
