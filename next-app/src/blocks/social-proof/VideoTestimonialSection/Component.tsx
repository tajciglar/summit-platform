import { cn } from '@/lib/cn'
import type { Props } from './schema'

export function VideoTestimonialSection(props: Props) {
  const gridCols =
    props.layout === 'single'
      ? 'grid-cols-1 max-w-3xl mx-auto'
      : 'grid-cols-1 md:grid-cols-2'

  return (
    <section className="bg-gray-50 py-16 md:py-20">
      <div className="mx-auto max-w-[1200px] px-6">
        <header className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">{props.headline}</h2>
          {props.subheadline && (
            <p className="mt-4 text-lg text-gray-600">{props.subheadline}</p>
          )}
        </header>
        <div className={cn('mt-10 grid gap-6', gridCols)}>
          {props.videos.map((video, i) => (
            <figure key={i} className="overflow-hidden rounded-xl bg-white shadow-sm">
              <div className="aspect-video bg-black">
                <iframe
                  src={video.embedUrl}
                  title={video.title}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
              <figcaption className="p-4">
                <p className="font-semibold text-gray-900">{video.title}</p>
                {video.speakerName && (
                  <p className="mt-1 text-sm text-gray-500">{video.speakerName}</p>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
