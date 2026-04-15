# Gemini Landing Page Generation — Design Spec

**Date:** 2026-04-15
**Status:** Draft — pending review
**Scope:** V1 one-click full-page generation, V2 per-block regeneration
**Related:** `docs/superpowers/plans/2026-04-14-landing-page-generator.md` (merged)

---

## Context

The project already has a Claude-driven landing page generator:

- `app/Services/LandingPageGenerator.php` composes a page via `ArchitectPhase` (block sequence) and `CopywriterPhase` (props).
- `app/Jobs/GenerateLandingPageVersionJob.php` runs the generator and saves output as `LandingPageDraft.blocks` (JSON).
- Next.js renders the JSON via the block library at `next-app/src/blocks/**`.
- Operator reviews the draft in Filament and approves → public page.

What the live pipeline produces today is composition + copy. What it does **not** produce is imagery. Block props like `bannerImageUrl`, speaker portraits, founder photos, feature photos, and video thumbnails are either empty, placeholder, or manually filled in Filament. The result: live pages look under-dressed compared to the Gemini-generated reference PNGs in `docs/block-references/` which *are* what the brand wants.

Reference PNGs were produced by two one-shot dev scripts (`next-app/scripts/generate-block-references.ts`, `generate-fullpage-composite.ts`) using `gemini-3.1-flash-image-preview`. Those scripts do not touch the running app.

## Goal

Make the one-click "Generate" flow produce a page that visually matches `docs/block-references/00_FullPageComposite.png` and the live reference at `https://www.parenting-summits.com/`, rendered by Next.js and editable in Filament — by adding Gemini image generation to the existing Claude composition pipeline.

## Non-goals

- Replacing Claude. Claude continues to own block selection and copy.
- Replacing the block system with raw AI-generated HTML/JSX. Pages remain block-JSON, editable per-block in Filament.
- Generating net-new block variants with AI. Catalog evolution is a separate workstream (Approach 4 in brainstorm, not in this spec).
- Per-block regeneration in V1. V2 only.
- Human face consistency across portraits (each speaker prompt is independent).

## Architecture overview

Two-phase pipeline becomes three-phase:

```
Summit data
   │
   ▼
ArchitectPhase (Claude)          → block sequence matching reference pattern
   │
   ▼
CopywriterPhase (Claude)         → text props + image briefs per image slot
   │
   ▼
ImageryPhase (Gemini + Bunny)    → generate + upload images, patch URLs into props
   │
   ▼
LandingPageDraft.blocks (JSON)   → rendered by Next.js, editable in Filament
```

**Why this shape:** Claude stays responsible for structural and textual decisions (including *what kind of image* each slot needs, written as an image brief). Gemini is a pure image-generation worker that takes briefs and returns URLs. The two roles never overlap, so failures in imagery do not corrupt the composition (page still renders with placeholder).

## V1 scope

### What ships

1. **Block catalog image-slot metadata.** Each block's `meta.ts` declares which props are image slots and what the brief schema is. Example for `HeroWithCountdown`:
   ```ts
   imageSlots: {
     bannerImageUrl: {
       aspect: '4:3',
       purpose: 'warm hero photograph showing the summit audience (e.g. parent and child)',
     }
   }
   ```
   Catalog builder (`next-app/scripts/build-catalog.ts`) lifts this into the published catalog JSON so Laravel sees it.

2. **CopywriterPhase produces image briefs.** When filling props for a block that has image slots, Claude additionally returns an `_imageBriefs: { propName: brief }` shape alongside the normal props. Brief is a short text description (one to three sentences) grounded in the block's `purpose` metadata plus summit context (tone, audience, palette).

3. **ImageryPhase (new).** `app/Services/FunnelGenerator/Phases/ImageryPhase.php`:
   - Input: the blocks array from CopywriterPhase (with `_imageBriefs` attached).
   - For each image brief, call `GeminiImageService::generate(brief, aspect)` in parallel (capped concurrency, e.g. 4 — same as the dev script).
   - For each returned PNG: upload to Bunny CDN via `BunnyUploader`, receive public URL.
   - Patch the URL into the right prop on the block. Strip `_imageBriefs` before returning.
   - Return the same blocks array with `bannerImageUrl` etc. filled.

4. **GeminiImageService (new).** `app/Services/Imagery/GeminiImageService.php`:
   - Uses `@google/genai` equivalent in PHP — call the REST API directly with Laravel `Http` (no official PHP SDK; the REST interface is stable).
   - Model: `gemini-3.1-flash-image-preview` (same as dev scripts, already proven quality).
   - System prompt includes the project design system (palette, typography, mood) — lifted verbatim from `generate-block-references.ts`.
   - Returns raw PNG bytes plus metadata (dimensions, aspect).
   - Retry once on transient failure; beyond that, return null (ImageryPhase falls back to placeholder URL).

5. **BunnyUploader (new).** `app/Services/Storage/BunnyUploader.php`:
   - Accepts (bytes, extension, prefix) → uploads to configured Bunny storage zone → returns public URL.
   - Path convention: `landing-pages/{summit_id}/{draft_id}/{slot-hash}.png` so regeneration in V2 can overwrite deterministically if wanted.
   - Reuses `BUNNY_CDN_*` env vars already in `.env.example`.

6. **Wire into LandingPageGenerator.** `generate()` becomes:
   ```php
   $sequence  = $this->architect->run(...);
   $blocks    = $this->copywriter->run(...);      // now returns _imageBriefs
   $blocks    = $this->imagery->run($blocks);     // fills image URLs
   return $this->addUuids($blocks);
   ```

7. **Job changes.** `GenerateLandingPageVersionJob` timeout stays at 900s. Memory budget: ~16 image calls × ~100KB PNG = trivial. Concurrency inside ImageryPhase (not inside the job itself) keeps wall time under 60s for a 20-block page.

8. **Filament surface.** No UI changes in V1. Existing batch/draft UI works unchanged — drafts just now render with real imagery.

### What does not ship in V1

- Per-block regeneration (V2).
- Image cache / reuse across pages (acceptable: each page pays its own image cost first-gen).
- Operator-editable image briefs (first pass: Claude chooses, no override).
- Style-reference images (V2 could let operator upload a mood board Gemini conditions on).
- Cost dashboard / quota (nice-to-have, not blocking).

## V2 scope — per-block regeneration

### What ships in V2

1. **Regenerate-block action in Filament** on each row of the draft's block list: "Regenerate this block" with optional free-text note ("make it warmer", "shorter answers").

2. **New job** `RegenerateBlockJob(draft_id, block_index, note)`:
   - Loads current draft blocks.
   - Re-runs `CopywriterPhase` for just that one block (single-item call, same catalog entry, same brief, plus optional note).
   - Re-runs `ImageryPhase` for just that block (regenerates only its images).
   - Replaces the entry at `block_index` in the composition (other blocks' props unchanged).
   - Persists as a **new `LandingPageDraft` version** belonging to the same batch (immutable, keeps full history; matches how full-page regeneration already works).

3. **Catalog changes**: CopywriterPhase gains a single-block mode (`runOne(block, brief, catalog, note)`) reusing the same tool schema.

4. **Bunny upload path**: new draft → new `draft_id` in path → no overwrite risk; old imagery remains accessible until cleanup.

### What does not ship in V2

- Prompt editing per block (power-user; V3).
- Multi-block regeneration in one action (can do sequentially via multiple clicks).
- Image-only regeneration (regenerate keeps copy+image coupled; reasoning: Claude's brief + prop pair should stay consistent).

## Data model changes

### Laravel

- `LandingPageDraft`: no schema change (the `blocks` JSON column already carries image URLs). Consider adding `gemini_cost_usd` decimal later for cost tracking; **not in V1**.
- `LandingPageBatch`: no change.
- New config: `config/imagery.php` — Gemini model name, concurrency cap, retry policy, placeholder URL.

### Block catalog (TypeScript → JSON)

- `BlockMeta` type gains optional `imageSlots: Record<string, { aspect: string; purpose: string }>`.
- `build-catalog.ts` serializes it.
- `BlockCatalogService` in Laravel returns it unchanged (already passes through arbitrary fields).

### Environment

- `GEMINI_API_KEY` — already in `.env.example`.
- `BUNNY_CDN_HOSTNAME`, `BUNNY_CDN_STORAGE_ZONE`, `BUNNY_CDN_API_KEY` — already in `.env.example` (empty; need values for prod).
- `GEMINI_IMAGE_MODEL` — optional override, defaults to `gemini-3.1-flash-image-preview`.
- `IMAGERY_CONCURRENCY` — default 4.

## Integration points

- **CopywriterPhase ↔ ImageryPhase:** the `_imageBriefs` convention on each block is the contract. ImageryPhase must never need to call Claude; CopywriterPhase must never need to know about Gemini/Bunny.
- **ImageryPhase ↔ GeminiImageService:** service exposes `generate(prompt, aspect): ?string` (PNG bytes or null on failure).
- **ImageryPhase ↔ BunnyUploader:** uploader exposes `upload(bytes, path): string` (public URL) or throws.
- **LandingPageGenerator ↔ Phases:** constructor-injected via Laravel container. No behavior change to its public `generate()` signature.

## Error handling

| Failure | Behavior |
|---|---|
| Gemini API rate-limited or 5xx | Retry once with jitter. On second failure → skip that image slot, log, continue. |
| Gemini returns no image part (only text) | Log text for diagnostics, fall back to placeholder URL. |
| Bunny upload fails | Retry once. On second failure → bubble up; ImageryPhase falls back to placeholder URL for that slot. |
| Claude brief missing for declared image slot | Use the block's `exampleProps` image URL if present, else placeholder. Log warning (indicates catalog/prompt drift). |
| Whole ImageryPhase throws unexpectedly | Job catches → draft status becomes `ready` anyway with text-only blocks (imagery is value-add, not critical-path). Error stored in `LandingPageDraft.error_message` prefixed `[imagery]`. |

**Placeholder URL:** a single static PNG shipped with the Next.js app at `next-app/public/placeholders/image-slot.png` (aspect-neutral, low-weight). Reference stored in `config/imagery.php` as an absolute URL derived from `APP_URL`. Operator knows: placeholder = Gemini failed, can regenerate that block in V2.

## Cost + latency budget

Per full-page generation (~18–28 blocks, ~8–16 image slots):

| Item | Per generation |
|---|---|
| Claude Architect | ~1 call, ~5k in / ~500 out tokens → low cents |
| Claude Copywriter | ~1 call, ~10–20k in / ~3–5k out tokens → low cents |
| Gemini Image | 8–16 calls × ~$0.039 (3.1 Flash Image pricing) → **$0.30–$0.60 per page** |
| Bunny upload | bandwidth in, ~negligible |
| **Total** | ~**$0.35–$0.70 per page** |
| Wall time | ~30–60s (Claude ~15s, Gemini parallel ×4 worst-case ~45s) |

Per-block regeneration (V2): 1 Claude call + 0–2 Gemini calls → well under $0.10 and 15s.

## Testing

Test pyramid (existing PHPUnit setup):

- **Unit:** `GeminiImageServiceTest` with `Http::fake()` — assert request shape, parse success/failure cases.
- **Unit:** `BunnyUploaderTest` with `Http::fake()` — URL construction, retry, error paths.
- **Unit:** `ImageryPhaseTest` — given blocks with briefs, verify parallel dispatch, URL patching, placeholder fallback on failure.
- **Feature:** `GenerateLandingPageVersionJobTest` — end-to-end with all external services faked; assert draft ends in `ready` with image URLs present.
- **Manual:** one real generation against a seeded summit, eyeball against `00_FullPageComposite.png` — must look recognizably similar.

No contract test against Gemini itself (external service, tested via the dev scripts already).

## Rollout

1. Merge V1 behind config: if `IMAGERY_ENABLED=false`, ImageryPhase short-circuits → no imagery, existing behavior preserved.
2. Enable on staging → run against 2–3 seeded summits → compare against PNG references.
3. Enable in production → first real generation per new summit.
4. V2 after V1 proves stable for ~a week.

## Open questions

- **Image consistency across speakers on one page:** each Gemini call is independent, so 8 speaker portraits in a `SpeakerGridDay` will vary in lighting/style. Acceptable for V1 (PNG references show this too). Later: pass a common style-seed prompt to all image calls for the same block.
- **Legal/brand review of AI faces:** Gemini-generated portraits look like real people. For speakers we have actual headshots in `speakers` table — CopywriterPhase should prefer existing speaker photos and only generate when none exist. Spec assumes this is already handled by the block using `speaker.photo_url`. **Verify during implementation.**
- **Existing imagery columns on Speaker/Summit models:** if models already hold photo URLs, those take precedence over Gemini generation. This needs a check in CopywriterPhase: if the data is present, no `_imageBrief` is emitted for that slot.
