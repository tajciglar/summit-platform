import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const _dirname = dirname(fileURLToPath(import.meta.url))

const BLOCKS_DIR = resolve(_dirname, '../../src/blocks')

const FILES = ['schema.ts', 'meta.ts', 'Component.tsx', 'index.ts'] as const

const NAME_PATTERN = /^[A-Za-z][A-Za-z0-9]*$/

export function packExampleBlock(category: string, name: string): string {
  if (!NAME_PATTERN.test(category) || !NAME_PATTERN.test(name)) {
    throw new Error(
      `block name rejected: ${JSON.stringify({ category, name })} (expected alphanumeric)`,
    )
  }
  const dir = join(BLOCKS_DIR, category, name)
  if (!existsSync(dir)) {
    throw new Error(`block not found: ${category}/${name} (expected at ${dir})`)
  }
  return FILES
    .map((f) => `// ${name}/${f}\n${readFileSync(join(dir, f), 'utf-8')}`)
    .join('\n\n')
}
