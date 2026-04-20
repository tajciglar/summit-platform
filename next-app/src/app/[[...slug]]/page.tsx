import { notFound } from 'next/navigation'
import { resolveFunnel } from '@/lib/api-client'
import { RenderBlocks } from '@/lib/render-block'
import { ThemeProvider } from '@/lib/theme-context'
import { SpeakersProvider } from '@/lib/speakers-context'
import { FunnelProvider } from '@/lib/funnel-context'

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
      <SpeakersProvider speakers={data.speakers}>
        <FunnelProvider
          value={{
            funnelId: data.funnel.id,
            funnelSlug: data.funnel.slug,
            summitSlug: summitSlug,
          }}
        >
          <main>
            <RenderBlocks blocks={data.blocks} />
          </main>
        </FunnelProvider>
      </SpeakersProvider>
    </ThemeProvider>
  )
}

export const revalidate = 60
