import { config } from 'dotenv'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

import { loadDesignSystem, loadPrimitiveSources, loadExampleBlock } from './lib/prompt-parts'
import { loadBlockTemplate } from './lib/block-template'
import { generateBlockCode } from './lib/gemini-client'
import { parseEnvelope } from './lib/envelope'
import { writeBlock } from './lib/block-writer'
import type { StepType } from '../src/types/block'

const _dirname = dirname(fileURLToPath(import.meta.url))

config({ path: resolve(_dirname, '../../.env') })

const MODEL = process.env.GEMINI_CODE_MODEL ?? 'gemini-2.5-pro'
const BLOCKS_DIR = resolve(_dirname, '../src/blocks')

const SYSTEM_PROMPT = `
You are an expert React + Tailwind v4 developer building blocks for a Next.js 16 landing-page builder.
Read the rules, the design system, the primitive source code, and the example block carefully.
Output ONLY the JSON envelope described in the rules. No commentary, no markdown fences.
`.trim()

const PRIMITIVES = ['accordion', 'button', 'card', 'input', 'label', 'select', 'separator', 'textarea']
const EXAMPLE_CATEGORY = 'hero'
const EXAMPLE_NAME = 'HeroWithCountdown'

const NAME_PATTERN = /^[A-Za-z][A-Za-z0-9]*$/
const CATEGORY_PATTERN = /^[a-z][a-z0-9-]*$/

function getArg(flag: string): string | undefined {
  return process.argv.slice(2).find((a) => a.startsWith(`--${flag}=`))?.split('=')[1]
}

function hasFlag(flag: string): boolean {
  return process.argv.slice(2).includes(`--${flag}`)
}

async function main() {
  const name = getArg('name')
  const category = getArg('category')
  const reference = getArg('reference')
  const validOnArg = getArg('validOn') ?? 'optin'
  const force = hasFlag('force')

  if (!name || !category || !reference) {
    console.error('Usage: pnpm gen:block --name=<Block> --category=<cat> --reference=<png> [--validOn=optin,sales_page] [--force]')
    process.exit(1)
  }

  if (!NAME_PATTERN.test(name)) {
    console.error(`--name rejected: ${JSON.stringify(name)} (expected PascalCase/alphanumeric)`)
    process.exit(1)
  }
  if (!CATEGORY_PATTERN.test(category)) {
    console.error(`--category rejected: ${JSON.stringify(category)} (expected kebab-case)`)
    process.exit(1)
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY missing from .env')
    process.exit(1)
  }

  const referencePath = resolve(process.cwd(), reference)
  if (!existsSync(referencePath)) {
    console.error(`Reference PNG not found: ${referencePath}`)
    process.exit(1)
  }

  const validOn = validOnArg.split(',') as StepType[]
  const outDir = join(BLOCKS_DIR, category, name)

  console.log(`Model:     ${MODEL}`)
  console.log(`Block:     ${category}/${name}`)
  console.log(`Reference: ${reference}`)
  console.log(`Output:    ${outDir}${force ? ' (force overwrite)' : ''}\n`)

  const primitives = await loadPrimitiveSources(PRIMITIVES)
  const exampleBlock = await loadExampleBlock(EXAMPLE_CATEGORY, EXAMPLE_NAME)
  const blockTemplate = loadBlockTemplate()
  const referencePng = readFileSync(referencePath)

  const started = Date.now()
  const rawText = await generateBlockCode({
    apiKey: process.env.GEMINI_API_KEY,
    model: MODEL,
    systemPrompt: SYSTEM_PROMPT,
    designSystem: await loadDesignSystem(),
    primitives,
    exampleBlock,
    blockTemplate,
    blockSpec: { name, category, validOn },
    referencePng,
  })

  let envelope
  try {
    envelope = parseEnvelope(rawText)
  } catch (err) {
    console.error(`Failed to parse envelope: ${err instanceof Error ? err.message : err}`)
    console.error('\nRaw response (first 5000 chars):')
    console.error(rawText.slice(0, 5000))
    process.exit(2)
  }

  writeBlock({ dir: outDir, envelope, force })

  console.log(`✓ schema.ts      (${envelope.schema_ts.length} chars)`)
  console.log(`✓ meta.ts        (${envelope.meta_ts.length} chars)`)
  console.log(`✓ Component.tsx  (${envelope.component_tsx.length} chars)`)
  console.log(`✓ index.ts       (${envelope.index_ts.length} chars)`)
  console.log(`\nDone in ${Math.round((Date.now() - started) / 1000)}s.`)

  const nextAppDir = resolve(_dirname, '..')
  if (hasFlag('skip-typecheck')) {
    console.log('\nSkipping typecheck (--skip-typecheck).')
  } else {
    console.log('\nRunning pnpm typecheck…')
    const result = spawnSync('pnpm', ['typecheck'], { cwd: nextAppDir, stdio: 'inherit' })
    if (result.error) {
      console.error(`\nFailed to spawn pnpm typecheck: ${result.error.message}`)
      process.exit(3)
    }
    if (result.status !== 0) {
      console.error(`\nTypecheck failed (exit ${result.status}). Block written but needs fixes.`)
      process.exit(3)
    }
    console.log('✓ typecheck passed')
  }

  console.log(`\nNext: add '${name}' to src/blocks/_register.ts.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
