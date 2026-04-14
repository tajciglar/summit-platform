import { readdirSync, statSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { z } from 'zod'
import type { BlockCatalog, CatalogEntry } from '../src/types/block'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BLOCKS_DIR = join(__dirname, '..', 'src', 'blocks')
const OUT_FILE = join(__dirname, '..', 'public', 'block-catalog.json')

interface BlockModule {
  meta: CatalogEntry
  schema: unknown
}

async function loadBlock(dir: string): Promise<BlockModule | null> {
  const indexPath = join(dir, 'index.ts')
  if (!existsSync(indexPath)) return null
  const mod = await import(pathToFileURL(indexPath).href)
  if (!mod.meta || !mod.schema) return null
  return { meta: mod.meta, schema: mod.schema }
}

function findBlockDirs(root: string): string[] {
  const results: string[] = []
  function walk(current: string) {
    for (const entry of readdirSync(current)) {
      const full = join(current, entry)
      if (!statSync(full).isDirectory()) continue
      if (existsSync(join(full, 'index.ts')) && existsSync(join(full, 'schema.ts'))) {
        results.push(full)
      } else {
        walk(full)
      }
    }
  }
  walk(root)
  return results
}

async function buildCatalog(): Promise<BlockCatalog> {
  const dirs = findBlockDirs(BLOCKS_DIR)
  const entries: CatalogEntry[] = []

  for (const dir of dirs) {
    const block = await loadBlock(dir)
    if (!block) continue
    const jsonSchema = z.toJSONSchema(block.schema as z.ZodType)
    entries.push({
      type: block.meta.type,
      category: block.meta.category,
      version: block.meta.version,
      validOn: block.meta.validOn,
      purpose: block.meta.purpose,
      schema: jsonSchema as Record<string, unknown>,
      exampleProps: block.meta.exampleProps,
      previewUrl: `/block-previews/${block.meta.type}.png`,
    })
  }

  const version = new Date().toISOString().replace(/[:.]/g, '-')

  return {
    version,
    generatedAt: new Date().toISOString(),
    blocks: entries.sort((a, b) => a.type.localeCompare(b.type)),
  }
}

async function main() {
  const catalog = await buildCatalog()
  writeFileSync(OUT_FILE, JSON.stringify(catalog, null, 2))
  console.log(`Wrote ${catalog.blocks.length} blocks to ${OUT_FILE}`)
  console.log(`  Version: ${catalog.version}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

export { buildCatalog }
