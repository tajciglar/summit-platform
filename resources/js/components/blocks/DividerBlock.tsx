import type { DividerBlockData } from '@/types/blocks'

const sizeMap = { sm: 'py-4', md: 'py-8', lg: 'py-16' }

export default function DividerBlock({ data }: { data: DividerBlockData }) {
  const size = sizeMap[data.size ?? 'md']
  const style = data.style ?? 'space'

  return (
    <div className={size}>
      {style === 'line' && <hr className="border-gray-200 max-w-4xl mx-auto" />}
      {style === 'dots' && (
        <div className="flex justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gray-300" />
          <span className="w-2 h-2 rounded-full bg-gray-300" />
          <span className="w-2 h-2 rounded-full bg-gray-300" />
        </div>
      )}
    </div>
  )
}
