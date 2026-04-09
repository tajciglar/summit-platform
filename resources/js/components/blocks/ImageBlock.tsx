import type { ImageBlockData } from '@/types/blocks'

const widthMap = { small: 'max-w-md', medium: 'max-w-2xl', full: 'max-w-full' }

export default function ImageBlock({ data }: { data: ImageBlockData }) {
  const width = widthMap[data.width ?? 'medium']

  return (
    <section className="py-8 px-6">
      <div className={`${width} mx-auto`}>
        <img src={data.image_url} alt={data.alt_text ?? ''} className="w-full rounded-xl shadow-md" />
        {data.caption && <p className="text-center text-gray-500 mt-3 text-sm">{data.caption}</p>}
      </div>
    </section>
  )
}
