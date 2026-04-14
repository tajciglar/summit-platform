import type { BlockRow } from '@/types/block'
import { globalRegistry } from './block-registry'

interface RenderBlockProps {
  block: BlockRow
}

export function RenderBlock({ block }: RenderBlockProps) {
  const def = globalRegistry.get(block.type, block.version)

  if (!def) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`Unknown block: ${block.type}@${block.version}`)
      return (
        <div className="p-4 border-2 border-dashed border-red-400 bg-red-50 text-red-700">
          Unknown block: {block.type}@{block.version}
        </div>
      )
    }
    return null
  }

  const parsed = def.schema.safeParse(block.props)
  if (!parsed.success) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`Invalid props for ${block.type}:`, parsed.error)
      return (
        <div className="p-4 border-2 border-dashed border-amber-400 bg-amber-50">
          Invalid props for {block.type}
        </div>
      )
    }
    return null
  }

  const Component = def.Component as React.ComponentType<Record<string, unknown>>
  return <Component {...(parsed.data as Record<string, unknown>)} />
}

export function RenderBlocks({ blocks }: { blocks: BlockRow[] }) {
  return (
    <>
      {blocks.map((block) => (
        <RenderBlock key={block.id} block={block} />
      ))}
    </>
  )
}
