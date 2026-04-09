import type { VideoBlockData } from '@/types/blocks'

export default function VideoBlock({ data }: { data: VideoBlockData }) {
  return (
    <section className="py-12 md:py-16 px-6">
      <div className="max-w-4xl mx-auto">
        {data.heading && (
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6" style={{ fontFamily: 'var(--font-heading), sans-serif', color: 'var(--theme-secondary)' }}>
            {data.heading}
          </h2>
        )}
        <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
          <iframe src={data.video_url} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        </div>
        {data.caption && <p className="text-center text-gray-500 mt-4 text-sm">{data.caption}</p>}
      </div>
    </section>
  )
}
