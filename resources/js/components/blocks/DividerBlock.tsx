import type { DividerBlockData } from '@/types/blocks'

const sizeMap = { sm: 'py-4', md: 'py-8', lg: 'py-16' }

export default function DividerBlock({ data }: { data: DividerBlockData }) {
  const size = sizeMap[data.size ?? 'md']
  const dividerStyle = data.style ?? 'space'

  return (
    <div className={size} role="separator">
      {dividerStyle === 'line' && <hr className="max-w-4xl mx-auto" style={{ borderColor: 'var(--theme-border)' }} />}
      {dividerStyle === 'dots' && (
        <div className="flex justify-center gap-2" aria-hidden="true">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--theme-border)' }} />
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--theme-border)' }} />
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--theme-border)' }} />
        </div>
      )}
    </div>
  )
}
