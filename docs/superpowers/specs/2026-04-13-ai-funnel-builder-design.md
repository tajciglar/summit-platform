# AI-Composed Block Library Funnel Builder — Design Spec

**Date:** 2026-04-13
**Status:** Design approved, awaiting implementation plan
**Owner:** Taj Brzovič
**Approach:** AI-composed block library (selected over template-fill and per-funnel code generation)

---

## 1. Problem & Goal

### Problem
Landing pages, checkout pages, bumps, and upsells for summit funnels are currently built by hand in WordPress + Oxygen/Elementor. This is slow, doesn't scale, and ties the dev team's bandwidth to per-summit page production.

### Goal
**Generate a complete summit funnel (optin → checkout → upsell → thank-you) in a few clicks**, with AI-supported composition and copywriting, while producing pages that match or exceed the design quality of the current WordPress output.

### Success criteria
- Click "Generate Funnel" on a Summit in Filament → complete funnel JSON in 60–90 seconds
- Generated funnel is reviewable and editable in the existing block builder UI
- One pilot summit ships in production on the new stack
- Build time per new summit drops from days to hours

---

## 2. Approach Selected

**AI-composed block library.** AI's job is to *pick* and *arrange* blocks from a curated library of ~32 premium Next.js components and *write copy* matching each block's schema. AI does not generate React code; it does not create new block types.

Rejected alternatives:
- **Template-first with AI copy fill** — too rigid, produces "looks like a template" output, AI doesn't compose
- **v0-style per-funnel code generation** — governance nightmare, can't bulk-update funnels, every summit becomes a mini-codebase
- **External design tool (Framer/Webflow) hosting pages** — two-system data flow, per-page manual work, AI generation inside those tools is limited

---

## 3. System Architecture

### Three deployment units

```
┌─────────────────────────────┐        ┌──────────────────────────┐
│  US VPS (Ploi + Hetzner     │        │  Vercel (US region)      │
│  Ashburn, VA)               │        │  Next.js renderer        │
│  Laravel + Filament + API   │◄──────►│  ISR cached              │
│  Postgres, Redis, queues    │  HTTPS │  Catch-all route         │
└──────────┬──────────────────┘        └──────────────────────────┘
           │
           ▼
     ┌─────────────────────┐
     │  Bunny CDN          │
     │  block-catalog.json │
     │  preview.png[]      │
     │  uploaded assets    │
     └─────────────────────┘
```

**Deployment 1 — Laravel app (Ploi + Hetzner Cloud Ashburn, dedicated vCPU).**
Filament admin, REST API for the renderer, Stripe webhooks, queues, Postgres. Hetzner Cloud **CCX line** (dedicated AMD CPU cores, no noisy neighbor) in **Ashburn, VA**. Migrating off Vultr for cost reduction and Laravel-native ops.

**Deployment 2 — Next.js renderer (Vercel, US region).**
Public funnel pages. Reads from Laravel API via SSR, caches via ISR, revalidates on publish-webhook from Laravel.

**Deployment 3 — Asset/catalog storage (Bunny CDN).**
Block catalog JSON, block preview PNGs, uploaded summit assets. Versioned. Bunny Storage Zone for files + Pull Zone for CDN delivery. Already configured in Laravel env (`BUNNY_CDN_*`).

### Why two deployments

- Vercel is purpose-built for Next.js (ISR, edge, image optimization, draft mode) — self-hosting fights the framework
- Independent scaling: summit launch traffic spikes hit Vercel edge cache, not the Laravel box
- Independent failure domain: Next.js crash ≠ admin down
- Independent deploys: ship a new block without redeploying Laravel

Trade-offs: CORS coordination needed, +20–100ms SSR round-trip on cold ISR misses (negligible after warmup), cache invalidation requires a webhook, two CI pipelines.

### Domain resolution stays in Laravel

Existing `ResolveFunnelDomain` middleware and custom-domain logic stay in Laravel. Next.js asks "what's at this URL?" via `GET /api/funnels/resolve?host=…&slug=…` and gets `{ step, blocks, summit, theme, products }` back. Custom domains still terminate at Laravel for resolution; rendering happens at Vercel.

### Hosting decisions

- **Laravel:** Ploi + **Hetzner Cloud CCX Ashburn (VA)** — dedicated vCPU line (CCX23: 4 dedicated AMD vCPU, 16 GB RAM, 160 GB NVMe). No noisy neighbor; cloud elasticity preserved.
- **Next.js:** **Vercel Pro** (US region pinned).
- **Asset storage:** Bunny CDN (already integrated; cheapest option at this scale; Storage Zone + Pull Zone).

Rejected: enhance.com (a hosting reseller control panel — not the right tool for a single Laravel app), Laravel Cloud (more managed, more expensive than needed), self-hosting Next.js (loses framework strengths).

---

## 4. Block Library

### Anatomy of a block

Each block lives in its own folder under `next-app/src/blocks/`:

```
blocks/hero/HeroWithSpeakers/
  Component.tsx        # Next.js component, consumes validated props
  schema.ts            # Zod schema — source of truth for props
  meta.ts              # AI metadata (purpose, validOn, exampleProps)
  preview.png          # Generated by Storybook in CI
  Component.stories.tsx # Storybook story for isolated dev
  index.ts
```

Four artifacts, each with one job:
- `Component.tsx` — the visual
- `schema.ts` — the props contract (source of truth)
- `meta.ts` — what the AI reads to decide whether to pick this block
- `preview.png` — what humans (and future multimodal AI) see in pickers

### Catalog (v1: ~32 blocks)

| Category | Count | Examples |
|----------|-------|----------|
| **Heroes** | 5 | HeroWithSpeakers, HeroSplit, HeroCountdown, HeroVideoForm, HeroMinimal |
| **Form/CTA** | 4 | OptinInline, OptinExpanded, CTAButton, CTAWithUrgency |
| **Speakers** | 3 | SpeakerGrid, SpeakerCarousel, SpeakerFeatured |
| **Social Proof** | 4 | TestimonialQuotes, TestimonialVideo, LogoStrip, StatsBar |
| **Content** | 4 | FAQAccordion, FeatureList, WhatYouGet, Agenda |
| **Checkout** | 5 | OrderSummary, PaymentForm, OrderBump, TrustBadges, Guarantee |
| **Upsell** | 3 | UpsellHero, UpsellComparison, UpsellScarcity |
| **Thank-you** | 3 | ConfirmationCard, VideoUnlockCard, NextStepsChecklist |
| **Utility** | 4 | RichText, ImageBlock, VideoEmbed, Countdown |

### Shared library, scoped per step type

One library; each block declares which step types it's valid on via `meta.validOn: ['optin'|'checkout'|'upsell'|'thank-you']`. Filament block picker filters by current step type. AI generator only considers valid blocks per step.

This avoids duplicating shared blocks (FAQ, Countdown, Testimonials, SpeakerGrid) across step-type-specific folders while still preventing invalid placements (e.g., PaymentForm on an optin).

### Visual quality sources

Compose from premium libraries, do not reinvent:
- **shadcn/ui blocks** — structural base (forms, layouts, accordions)
- **Aceternity UI** — motion-rich hero pieces
- **Magic UI** — micro-interactions (marquee, sparkles, shimmer borders)
- **Framer Motion** — animations
- **Tailwind v4** — styling (already in repo)

### Theming

Each `Summit` has a theme record: `{ primaryColor, accentColor, fontHeading, fontBody, logoUrl, heroImageStyle }`. Blocks read theme from React context, never hard-code colors. Same blocks + different theme = visually distinct summit.

### Versioning

Each block tracks `version: number`. DB stores `{ type, version, props }`. Breaking schema changes bump the version; renderer supports N and N-1 during transitions. Optional migration scripts upgrade old rows.

---

## 5. Schema Contract (the glue)

This is the most important architectural piece. If Filament, Next.js, and the AI generator disagree about block props, the system breaks.

### Source of truth: Zod schemas in Next.js repo

```ts
// blocks/hero/HeroWithSpeakers/schema.ts
export const schema = z.object({
  headline: z.string().min(1).max(120),
  subhead: z.string().max(300).optional(),
  speakerIds: z.array(z.number()).min(1).max(20),
  ctaLabel: z.string().default('Register Free'),
  backgroundStyle: z.enum(['gradient', 'image', 'solid']),
})
export type Props = z.infer<typeof schema>
```

### Codegen: one source → three consumers

A Next.js build script (`pnpm build:catalog`) walks every block folder and emits:

```json
// block-catalog.json
{
  "version": "2026.04.13-1",
  "blocks": [
    {
      "type": "HeroWithSpeakers",
      "category": "hero",
      "version": 1,
      "validOn": ["optin"],
      "purpose": "Primary hero for optins with 6+ speakers...",
      "schema": { /* JSON Schema via zod-to-json-schema */ },
      "exampleProps": { /* realistic example for AI */ },
      "previewUrl": "https://cdn.../previews/HeroWithSpeakers.png"
    }
  ]
}
```

Three consumers:

1. **Next.js renderer** — uses Zod types directly (same repo, no indirection)
2. **AI generator (Laravel)** — reads `schema` + `purpose` + `exampleProps`; builds Claude tool definitions; AI cannot return invalid props because the tool schema enforces them
3. **Filament admin (Laravel)** — reads `schema` and auto-generates editing forms via JSON-Schema-to-Filament-field mapper:

| JSON Schema | Filament field |
|-------------|----------------|
| `string` (short) | `TextInput` |
| `string` (long) | `Textarea` |
| `string` (rich-text format) | `RichEditor` |
| `enum` | `Select` |
| `array` of objects | `Repeater` |
| `array` of refs (e.g. speakerIds) | `Select` (multiple, options from DB) |
| `boolean` | `Toggle` |
| `number` | `TextInput` (numeric) |

**Result: no hand-written Filament forms per block.** Write one Zod schema; admin form, AI capability, and renderer types all derive from it.

### Propagation

```
Next.js CI: merge to main
  ↓
pnpm build:catalog
  ↓
Upload block-catalog-{version}.json to Bunny Storage Zone
  ↓
POST /api/admin/catalog/refresh {version} → Laravel webhook
  ↓
Laravel downloads, validates, caches in Redis
```

Laravel config pins which catalog version is "live" — preventing accidental updates from breaking existing summits.

---

## 6. AI Generation Pipeline

### User flow

```
Filament Summits page
  → Click "Generate Funnel" on a Summit
  → Wizard: confirm inputs (speakers, offer, tone, brand)
            optional free-text brief
            optional reference summit to mimic
  → Submit → queues GenerateFunnelJob
  → Progress UI streams status ("Architecting funnel…", "Writing copy…")
  → Job completes → redirect to block builder with funnel loaded
  → User reviews, tweaks copy/blocks, publishes
```

**Target wall-clock:** 60–90 seconds.
**Cost budget:** $0.50–2.00 per funnel (Claude Opus 4.6, prompt-cached catalog).

### Two-phase generation

Single-shot generation produces mediocre copy. Two phases consistently beat it.

**Phase 1 — Architect (Opus 4.6).**
Input: summit brief + block catalog manifest (cached).
Output: block *sequence* per step, no copy.

```json
{
  "optin": [
    { "type": "HeroWithSpeakers" },
    { "type": "OptinExpanded" },
    { "type": "SpeakerGrid" },
    { "type": "StatsBar" },
    { "type": "FAQAccordion" }
  ],
  "checkout": [...],
  "upsell": [...],
  "thank-you": [...]
}
```

**Phase 2 — Copywriter (Opus 4.6, parallel per step).**
Input: summit brief + architect output + each block's schema + exampleCopy.
Output: full validated props for every block. Steps run in parallel (4 API calls) for faster wall-clock.

### Claude API specifics

- **Structured output via tool use** — every block type becomes a Claude tool; AI cannot produce free-form output
- **Prompt caching** — block catalog + structural rules cached (~30k tokens); only per-summit delta is new cost
- **Validation loop** — Zod validation failures retry just the failing block with the error injected (max 2 retries per block)
- **Model routing** — Opus 4.6 for generation; Haiku 4.5 for cheap copy-only regeneration

### What AI does vs. doesn't do

| Does | Doesn't |
|------|---------|v
| Pick blocks from catalog | Invent new block types |
| Order blocks into a sensible funnel | Generate React code |
| Write copy fitting each block's schema | Upload or generate images |
| Suggest color accents from theme | Override the summit's theme |
| Propose CTA button text | Set prices, product IDs, Stripe config |

### Images

- **Speakers** — already in DB (Spatie Media Library); AI references by ID
- **Hero/accent** — AI picks from a **curated internal library** (~100 summit-appropriate images tagged by mood: "academic," "corporate," "wellness," etc.)
- **Custom uploads** — user replaces placeholders in Filament post-generation
- **Generative images** (fal.ai / Replicate) — out of v1

### Reconciliation with existing FunnelForge

The existing `FunnelForgeService.php` and `GenerateFunnel.php` Filament page will be **replaced by this new pipeline**. Same Filament button, new backend service. The improved version of FunnelForge in `wcc-projects/funnel-forge` will be reviewed during the implementation-planning phase to extract anything worth keeping (prompt patterns, tool definitions, structural rules) before replacement.

### File layout

```
app/Services/FunnelGenerator/
  FunnelGenerator.php          # Orchestrates the two-phase pipeline
  Phases/
    ArchitectPhase.php         # Pick block sequence
    CopywriterPhase.php        # Fill block props
  BlockCatalogLoader.php       # Reads exported catalog manifest
  Validators/
    BlockPropsValidator.php    # Validates props against JSON Schema from catalog (via opis/json-schema)
app/Jobs/
  GenerateFunnelJob.php        # Queued, streams progress via broadcasting
app/Filament/Actions/
  GenerateFunnelAction.php     # Button + wizard
```

### Error handling

- Validation fails after 2 retries → surface specific block error, allow regeneration or hand-fix
- Claude timeout → exponential backoff, 3 attempts total
- Rate limits → Redis-backed rate limiter
- Partial success — if 3/4 steps succeed, save those, allow regeneration of just the failed step

---

## 7. Block Authoring Workflow (dev-only)

### Adding a new block (target: < 2 hours end-to-end)

```bash
pnpm block:new Hero/NewHeroStyle
```

Scaffolds the four artifacts. Then:

1. **Open Storybook** (`pnpm storybook`) — design + tweak in isolation with mock props
2. **Fill `schema.ts`** — defines prop contract
3. **Fill `meta.ts`** — describes block to AI (purpose, exampleCopy, validOn)
4. **Commit + push** — CI runs:
   - `pnpm build:catalog` regenerates `block-catalog.json`
   - Storybook screenshot captured as `preview.png`
   - Upload to Bunny Storage Zone, ping Laravel webhook
5. **Block immediately available** in Filament picker and AI generation

### Storybook as the design lab

Storybook (`localhost:6006`) renders each block in isolation with mock data:
- Multiple variants per block (default + edge cases)
- Theme switcher to preview across summit brands
- Responsive preview (mobile/tablet/desktop)
- Accessibility checks (axe)
- Hot reload

Storybook is also where AI-generated component code lands during authoring: paste a v0.dev/Claude/Lovable component into `Component.tsx`, iterate in Storybook until premium, then commit. AI-assisted authoring + structured library = best of both worlds.

### Live preview in Filament builder

Block builder embeds Next.js preview in iframe via Next.js draft mode. Hot-reloads on block change. Existing preview-mode middleware ports forward to the new pipeline.

### PR requirements per block

- Passes `pnpm typecheck`
- Has Storybook story with ≥ 2 variants
- `meta.ts` filled (AI requires this)
- Passes axe accessibility check
- Catalog codegen runs cleanly

### Block changes

- **Non-breaking** (add optional prop, style tweak, bug fix): edit + commit; DB rows unchanged
- **Breaking** (remove/rename prop, change type): bump `version` in `meta.ts`; old component remains until migration runs

---

## 8. Migration & Rollout Plan

### Strategy: per-summit cutover

**Build the full funnel** (all 4 step types) on the new stack before any summit uses it. Pick **one low-stakes pilot summit** for end-to-end migration. Keep all other summits on WordPress. Once pilot ships clean, migrate remaining summits one-at-a-time.

Rejected alternatives:
- **Step-by-step within a funnel** (landing first, then checkout, then upsell) — requires a throwaway WordPress↔Laravel session-handoff layer, fragments analytics, awkward URL routing across two systems
- **Big bang all summits at once** — unacceptable launch-day risk, no fallback

### Phased timeline (~10–11 weeks to pilot)

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **0 — Foundation** | weeks 1–2 | Next.js repo + block scaffolding + Storybook + codegen + Zod→JSON Schema pipeline + catalog sync (CI → Bunny → Laravel webhook) + Vercel deployment + 3 pilot blocks end-to-end |
| **1 — Block library** | weeks 3–6 | Remaining ~29 blocks + theme system + auto-generated Filament forms + manual block composition |
| **2 — AI generation** | weeks 7–9 | Port/align FunnelForge improvements + two-phase pipeline + curated image library + validation/retry/job progress UI |
| **3 — Pilot summit** | weeks 10–11 | Migrate one summit's full funnel + run in production + measure conversion + gather bugs |
| **4 — Broader rollout** | weeks 12+ | Migrate remaining summits one-at-a-time + decommission WP gradually + v1.5 work |

### Rollback strategy

DNS for each summit points at either WordPress (old) or the new Next.js deployment. If a migrated summit has issues during launch week:
- DNS cutover back to WP: ~5 minutes
- WP version kept intact until summit completes
- No data loss (per-summit, no cross-summit dependencies)

### Data migration

**None from WP.** Each summit gets re-created in Filament (or AI-generated). Summit metadata (speakers, products, dates) already lives in Filament/Postgres today.

### CI/CD

**Next.js repo:**
- Push → Vercel preview deploy
- Merge to main → Vercel production + catalog codegen + Bunny upload + Laravel webhook ping

**Laravel repo:**
- Existing Ploi flow, unchanged
- One new route added: `POST /api/admin/catalog/refresh` (webhook receiver)

---

## 9. Out of Scope for V1

Stating the no's. Each item is a real future possibility, just not now.

- **A/B testing** — needed eventually; v1.5
- **Variant generation** (3–5 funnel options per generation) — single-shot in v1; multi-variant in v1.5
- **Generative images** (fal.ai / Midjourney) — curated library only in v1
- **Multi-language funnels** — English only at launch
- **User-authored custom blocks** in Filament — block authoring is dev-only via Storybook
- **Visual drag-drop pixel editing within Next.js preview** — Filament forms only; you select blocks, edit fields
- **Visual regression testing** (Chromatic/Percy) — defer to v1.5
- **Automatic WP content migration** — every summit gets re-created or AI-generated
- **Self-hosting Next.js** — Vercel only for v1
- **Advanced personalization** (UTM/geo/visitor-based block variation) — flat funnels in v1
- **Member-area / course delivery pages** — handled separately by existing `ContentAccessGrant` model

### Definition of done for v1

Click "Generate" on a Summit in Filament → complete funnel JSON returned in 60–90 seconds → tweak in block builder → launch one real (pilot) summit on the new stack.

---

## 10. Cost Analysis

### Current monthly hosting cost
**~$350/month on Vultr** (likely high-frequency or bare metal instance + managed Postgres + supporting services)

### Projected monthly hosting cost (new stack)

| Component | Spec | Monthly USD |
|-----------|------|------------:|
| **Hetzner Cloud CCX23 Ashburn** (production) | 4 dedicated AMD vCPU, 16 GB RAM, 160 GB NVMe, 20 TB bandwidth | ~$50 |
| **Hetzner Cloud CPX21 Ashburn** (staging, optional) | 3 vCPU, 4 GB RAM, 80 GB SSD | ~$9 |
| **Ploi** (control panel) | All servers | $10 |
| **Vercel Pro** (Next.js renderer) | 1 TB bandwidth, US region | $20 |
| **Bunny CDN** | ~50-100 GB storage + ~50-100 GB egress | ~$2 |
| **Cloudflare** (DNS + CDN front) | Free tier sufficient at current scale | $0 |
| **Total** | | **~$91/month** |

### Savings

| | Monthly | Annual |
|---|--------:|-------:|
| Current (Vultr) | $350 | $4,200 |
| Projected (new stack) | $91 | $1,092 |
| **Savings** | **$259** | **$3,108** |

### Sizing rationale (based on actual traffic data)

Current traffic (Cloudflare analytics, 14 days post-domain-migration, extrapolated to 30 days):
- ~92k unique visitors/month
- ~8.4M total requests/month
- ~1.9M origin requests/month (after 77% Cloudflare cache hit rate)
- ~52 GB egress from origin/month
- Average ~22 origin req/sec, peak likely 50-100 req/sec during summit launches

**Multiple concurrent summits accounted for:** business runs several summits in parallel. This does not multiply origin load proportionally — Cloudflare + Next.js ISR absorb the bulk of page traffic; only form submissions, Stripe webhooks, admin requests, and queue work hit Laravel. Worst-case scenario (two summits launching same day, ~10k registrations in an hour combined) = ~3 req/sec sustained POST traffic with brief 50-100 req/sec bursts. CCX23 sustains 100+ req/sec on Laravel POST routes comfortably.

**Scale-up path:** Hetzner Cloud rescaling is in-place and ~30 seconds of downtime. CCX23 → CCX33 ($100/mo, 8 vCPU, 32 GB) is a one-click upgrade if real load exceeds projections. **Do not over-provision upfront** — start at CCX23, monitor, scale on data.

### Caveats on cost numbers

- **No historical peak-traffic data available** (boss does not have detailed Vultr breakdown, no exported analytics for biggest historical launch). CCX23 sizing is based on current measured traffic plus 5-10× headroom; peak summit launches in the 5,000-15,000 concurrent visitors range are within capacity.
- **No data on Vultr cost breakdown** — $350/mo is treated as a single line item. If any portion is for services that *continue* (e.g., bandwidth on dedicated network, separate managed Postgres that we're keeping), savings could be slightly less. Confidence: high that savings exceed $200/mo regardless of breakdown.
- **No data on WP-specific SaaS being decommissioned** (Elementor Pro, Oxygen, FunnelKit, etc.). These are *additional* savings on top of the hosting number, not yet quantified.

### Why this is dramatically cheaper than Vultr at $350

1. **Laravel is lighter than WordPress** — no plugin overhead, no theme bloat, OPcache works properly. WP needs 2-3× the RAM Laravel does for the same throughput.
2. **Next.js on Vercel offloads page rendering** — origin server barely gets touched (ISR + edge cache absorbs ~95% of page loads).
3. **Hetzner pricing is structurally lower** than Vultr/AWS/DO at every tier, including for dedicated CPU instances.
4. **Cloudflare absorbs 77% of requests** — already true today, will continue.

### Cost risks to flag

- **Vercel bandwidth overage** — if a summit goes viral and exceeds 1 TB/mo, Vercel charges $0.40/GB. Budget $40/TB extra. Cap with Cloudflare in front to prevent surprises.
- **Claude API costs (AI generation)** — separate from hosting. ~$0.50-2.00 per funnel generation. At 4 summits/month × 3 generations each = ~$6-24/mo. Negligible.
- **Bunny bandwidth on viral assets** — Bunny is $0.005-0.01/GB; even 1 TB = $5-10. Hard to make this expensive.

### Net business case

- **Year 1 hosting savings: ~$3,108**
- **Migration project pays back in hosting alone within ~12-15 months** (assuming dev time costs ~$3-5k loaded)
- **Plus the unquantified gains:** dramatically faster funnel production, AI-generated drafts, single source of truth for content, no more Oxygen/Elementor maintenance

---

## 11. Open Questions for Implementation Plan

These get resolved during the writing-plans phase, not now:

1. **FunnelForge alignment** — review the improved `wcc-projects/funnel-forge` codebase, decide what to port, what to discard, what to extract as patterns
2. **Theme storage shape** — are theme colors stored per-summit or per-funnel?
3. **Catalog versioning scheme** — date-based, semver, or content-hash?
4. **Bunny Storage Zone setup** — confirm storage region (Falkenstein/NY/LA), Pull Zone config, API key access from Next.js CI
5. **Vercel-to-Laravel API authentication** — bearer token, mTLS, or signed requests?
6. **Image library curation** — who selects/uploads the initial ~100 images, by what taxonomy?
7. **Pilot summit selection** — which specific summit is the lowest-risk first migration target?

---

## Architecture decision summary

| Decision | Choice | Reason |
|----------|--------|--------|
| Approach | AI-composed block library | Matches "few clicks → funnel" goal, governable, scalable |
| Frontend stack | Next.js on Vercel | Replaces Inertia+React; framework-native hosting |
| Backend stack | Laravel + Filament on Ploi | Keeps existing admin, API, and queue infra |
| Schema source of truth | Zod in Next.js repo | Component owns its props; codegen to PHP and JSON Schema |
| Filament forms | Auto-generated from schema | Eliminates per-block form maintenance |
| AI generation | Two-phase (Architect → Copywriter) | Better quality than single-shot |
| Migration strategy | Per-summit cutover, pilot first | No throwaway integration, isolated rollback |
| US hosting | Hetzner Cloud CCX Ashburn (Laravel, dedicated vCPU) + Vercel (Next.js) | Dedicated CPU on cloud, US-based, framework-native, ~75% cost cut vs. current Vultr |
| Image strategy | Curated internal library | Avoids generative-image complexity in v1 |
| Storybook | Required for block dev | Industry standard, free, enables AI-assisted authoring |
