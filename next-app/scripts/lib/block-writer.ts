import { mkdirSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import type { Envelope } from './envelope'

export interface WriteBlockArgs {
  dir: string
  envelope: Envelope
  force: boolean
}

export function writeBlock({ dir, envelope, force }: WriteBlockArgs): void {
  if (existsSync(dir) && readdirSync(dir).length > 0 && !force) {
    throw new Error(`block directory already exists and is not empty: ${dir} (pass --force to overwrite)`)
  }

  mkdirSync(dir, { recursive: true })

  writeFileSync(join(dir, 'schema.ts'), envelope.schema_ts)
  writeFileSync(join(dir, 'meta.ts'), envelope.meta_ts)
  writeFileSync(join(dir, 'Component.tsx'), envelope.component_tsx)
  writeFileSync(join(dir, 'index.ts'), envelope.index_ts)
}
