import { notFound } from 'next/navigation'
import { fetchDraft } from '@/lib/draft-api-client'
import { RenderBlocks } from '@/lib/render-block'
import { ThemeProvider } from '@/lib/theme-context'
import { SpeakersProvider } from '@/lib/speakers-context'

interface PageParams {
  token: string
}

export default async function PreviewPage({ params }: { params: Promise<PageParams> }) {
  const { token } = await params
  const data = await fetchDraft(token)
  if (!data) notFound()

  return (
    <ThemeProvider theme={data.theme}>
      <SpeakersProvider speakers={data.speakers}>
        <div className="relative">
          {/* Preview banner */}
          <div className="sticky top-0 z-50 flex items-center justify-between bg-amber-400 px-4 py-2 text-sm font-medium text-amber-900">
            <span>
              Preview — Version {data.draft.version_number} · {data.draft.status}
            </span>
            <span className="opacity-60">{data.summit.title}</span>
          </div>
          <main>
            <RenderBlocks blocks={data.blocks} />
          </main>
        </div>
      </SpeakersProvider>
    </ThemeProvider>
  )
}

export const dynamic = 'force-dynamic'
