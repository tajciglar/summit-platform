import { readFileSync, existsSync } from 'node:fs'
import { extname, resolve } from 'node:path'
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
  const absolute = resolve(process.cwd(), path)
  if (!existsSync(absolute)) return null
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
