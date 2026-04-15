import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { dirname, basename, extname, resolve } from 'node:path'
import { DESIGN_SYSTEM } from './design-system'
import { packPrimitives } from './primitive-packer'
import { packExampleBlock } from './example-block-packer'

const DEFAULT_PRIMITIVES = ['accordion', 'button', 'card', 'input', 'label', 'select', 'separator', 'textarea']

export async function loadDesignSystem(): Promise<string> {
  return DESIGN_SYSTEM
}

export async function loadPrimitiveSources(names: string[] = DEFAULT_PRIMITIVES): Promise<string> {
  return packPrimitives(names)
}

export async function loadExampleBlock(category: string, name: string): Promise<string> {
  return packExampleBlock(category, name)
}

export async function loadReferenceImage(
  path: string | null,
): Promise<{ mime: string; data: string } | null> {
  if (!path) return null
  const absolute = resolveReferencePath(resolve(process.cwd(), path))
  if (!absolute) return null
  const ext = extname(absolute).toLowerCase()
  const mime =
    ext === '.png'
      ? 'image/png'
      : ext === '.jpg' || ext === '.jpeg'
        ? 'image/jpeg'
        : ext === '.webp'
          ? 'image/webp'
          : 'application/octet-stream'
  const buf = readFileSync(absolute)
  return { mime, data: buf.toString('base64') }
}

/**
 * Resolve a reference-image path tolerantly. The block-reference PNGs live
 * with numeric prefixes (e.g. 02_HeroWithCountdown.png), but the design
 * prompt looks them up by section type only (HeroWithCountdown.png). Try the
 * exact path first; if that misses, scan the parent directory for any file
 * that matches `<digits>_<type>.<ext>`.
 */
function resolveReferencePath(absolute: string): string | null {
  if (existsSync(absolute)) return absolute
  const dir = dirname(absolute)
  const file = basename(absolute) // e.g. HeroWithCountdown.png
  const ext = extname(file)
  const stem = file.slice(0, file.length - ext.length)
  if (!existsSync(dir)) return null
  const re = new RegExp(`^\\d+_${stem.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\${ext}$`, 'i')
  const match = readdirSync(dir).find((f) => re.test(f))
  return match ? `${dir}/${match}` : null
}
