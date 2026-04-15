import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const _dirname = dirname(fileURLToPath(import.meta.url))

const UI_DIR = resolve(_dirname, '../../src/components/ui')

export function packPrimitives(names: string[]): string {
  if (names.length === 0) return ''
  return names
    .map((name) => {
      const path = join(UI_DIR, `${name}.tsx`)
      if (!existsSync(path)) {
        throw new Error(`primitive not found: ${name} (expected at ${path})`)
      }
      const source = readFileSync(path, 'utf-8')
      return `// @/components/ui/${name}.tsx\n${source}`
    })
    .join('\n\n')
}
