import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const _dirname = dirname(fileURLToPath(import.meta.url))

export function loadBlockTemplate(): string {
  const path = resolve(_dirname, 'block-template.md')
  return readFileSync(path, 'utf-8')
}
