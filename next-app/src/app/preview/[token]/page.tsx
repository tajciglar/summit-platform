import { notFound } from 'next/navigation'
import { fetchDraft } from '@/lib/draft-api-client'
import { RenderBlocks } from '@/lib/render-block'
import type { Section } from '@/lib/blocks/types'
import { ThemeProvider } from '@/lib/theme-context'
import { SpeakersProvider } from '@/lib/speakers-context'

interface PageParams {
  token: string
}

export default async function PreviewPage({ params }: { params: Promise<PageParams> }) {
  const { token } = await params
  const data = await fetchDraft(token)
  if (!data) notFound()

  // Runtime-Gemini flow: each section carries its own JSX.
  // We cannot invoke renderSection() inline here because this page is a React
  // Server Component and the UI primitives (Base UI / lucide) are Client
  // Components — Next.js replaces them with references in RSC context and
  // ReactDOMServer.renderToString() can't call them.
  //
  // Instead, fetch the pre-rendered HTML from our own Route Handler, which
  // runs in plain Node.js runtime (not RSC) where client components can be
  // server-rendered normally.
  const sections = data.sections ?? []
  const hasSections = sections.length > 0
  const sectionsHtml = hasSections ? await fetchSectionsHtml(sections) : ''

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
            {hasSections ? (
              <div dangerouslySetInnerHTML={{ __html: sectionsHtml }} />
            ) : (
              <RenderBlocks blocks={data.blocks} />
            )}
          </main>
        </div>
      </SpeakersProvider>
    </ThemeProvider>
  )
}

async function fetchSectionsHtml(sections: Section[]): Promise<string> {
  // Drop failed sections from the publish request — publisher rejects them.
  // We'll splice error placeholders back in so the preview still shows them.
  const renderable = sections.filter((s) => s.status !== 'failed')
  const failed = sections.filter((s) => s.status === 'failed')

  let bodyHtml = ''
  if (renderable.length > 0) {
    const base = process.env.NEXT_APP_INTERNAL_URL ?? 'http://localhost:3000'
    const token = process.env.INTERNAL_API_TOKEN
    try {
      const res = await fetch(`${base}/api/drafts/preview/render`, {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'content-type': 'application/json',
          authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ sections: renderable }),
      })
      if (res.ok) {
        bodyHtml = await res.text()
      } else {
        bodyHtml = `<div style="padding:1rem;background:#fee;border:1px solid #fcc;color:#900;margin:1rem">Render endpoint returned ${res.status}: ${await res.text()}</div>`
      }
    } catch (err) {
      bodyHtml = `<div style="padding:1rem;background:#fee;border:1px solid #fcc;color:#900;margin:1rem">Fetch failed: ${(err as Error).message}</div>`
    }
  }

  const failedHtml = failed
    .map(
      (s) =>
        `<div style="padding:1rem;background:#fee;border:1px solid #fcc;color:#900;margin:1rem">Section ${s.type} failed: ${s.error ?? 'unknown error'}</div>`,
    )
    .join('\n')

  return bodyHtml + '\n' + failedHtml
}

export const dynamic = 'force-dynamic'
