# Section Image Slots Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow template designers to declare optional image slots in any section (hero backgrounds, host photos, bonus thumbnails, logos, etc.); operators upload via the existing Media Library; each template's skin renders the image or falls back gracefully when empty.

**Architecture:** Each template's content schema (`next-app/src/templates/<template>.schema.ts`) declares optional media-id fields using a new `MediaIdSchema(...)` helper. The helper attaches JSON Schema metadata (`x-media: { role, category }`) so `FilamentSchemaMapper` can render a JSON-backed `MediaPickerField` in the Filament editor. `LandingPageDraftResource` walks the content tree, finds media-id fields, and attaches resolved `{ url, alt, width, height }` sidecars so Next.js templates render without extra lookups. Skins render `null`-safe — empty slot = text-only layout.

**Tech Stack:** Zod 3 (schema), Laravel 13 + Filament v4 (editor), Spatie Media Library (storage), React 19 + Next.js 16 (render)

---

## File Structure

**New files:**
- `next-app/src/sections/shared/media-id-schema.ts` — Zod helper that tags a UUID field with media metadata
- `next-app/src/sections/shared/__tests__/media-id-schema.test.ts` — helper unit tests
- `app/Filament/Forms/Components/MediaPickerField.php` — JSON-backed variant of `MediaPickerInput` (writes to content path, no `setMediaFor`)
- `resources/views/filament/forms/components/media-picker-field.blade.php` — view (reuses picker UI)
- `app/Services/Templates/MediaContentResolver.php` — walks content tree and attaches resolved sidecars
- `tests/Unit/MediaContentResolverTest.php` — resolver unit tests
- `tests/Feature/Filament/MediaPickerFieldTest.php` — Filament picker tests

**Modified files:**
- `app/Services/Templates/FilamentSchemaMapper.php` — detect `x-media` marker, emit `MediaPickerField`
- `app/Http/Resources/LandingPageDraftResource.php` — invoke `MediaContentResolver`
- `next-app/src/templates/indigo-gold.schema.ts` — add image fields (pilot)
- `next-app/src/templates/IndigoGold.tsx` — render image fields with fallbacks
- `next-app/src/templates/<each-other-template>.schema.ts` + `<each-other-template>.tsx` — rollout tasks

---

## Task 1: `MediaIdSchema` helper (Zod + JSON Schema metadata)

**Files:**
- Create: `next-app/src/sections/shared/media-id-schema.ts`
- Test: `next-app/src/sections/shared/__tests__/media-id-schema.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// next-app/src/sections/shared/__tests__/media-id-schema.test.ts
import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { MediaIdSchema } from '../media-id-schema';

describe('MediaIdSchema', () => {
  it('accepts a UUID and rejects non-UUIDs', () => {
    const s = MediaIdSchema({ role: 'hero-background', category: 'hero' });
    expect(s.safeParse('550e8400-e29b-41d4-a716-446655440000').success).toBe(true);
    expect(s.safeParse('not-a-uuid').success).toBe(false);
  });

  it('is optional + nullable by default (empty slot)', () => {
    const s = MediaIdSchema({ role: 'hero-background', category: 'hero' });
    expect(s.safeParse(undefined).success).toBe(true);
    expect(s.safeParse(null).success).toBe(true);
  });

  it('embeds x-media metadata in the schema description', () => {
    const s = MediaIdSchema({ role: 'hero-background', category: 'hero', subCategory: 'background' });
    // We stash metadata in .describe() as JSON so zod-to-json-schema surfaces it.
    expect(s.description).toContain('"x-media"');
    const parsed = JSON.parse(s.description!);
    expect(parsed['x-media']).toEqual({
      role: 'hero-background',
      category: 'hero',
      subCategory: 'background',
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd next-app && pnpm vitest run src/sections/shared/__tests__/media-id-schema.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write minimal implementation**

```typescript
// next-app/src/sections/shared/media-id-schema.ts
import { z } from 'zod';

export type MediaIdMetadata = {
  /** Semantic role, e.g. 'hero-background', 'host-photo', 'bonus-thumbnail'. */
  role: string;
  /** MediaCategory key — matches app/Enums/MediaCategory.php. */
  category: 'hero' | 'product' | 'downloadables' | 'speaker' | 'logo' | 'brand';
  /** Optional sub-category filter for the picker. */
  subCategory?: string;
};

/**
 * Optional media-id slot in a content schema. Stored as a UUID string referring
 * to a MediaItem; Filament renders a MediaPickerField; the API attaches a
 * resolved `{ url, alt, width, height }` sidecar before sending to Next.js.
 */
export function MediaIdSchema(meta: MediaIdMetadata) {
  return z
    .string()
    .uuid()
    .nullish()
    .describe(JSON.stringify({ 'x-media': meta }));
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd next-app && pnpm vitest run src/sections/shared/__tests__/media-id-schema.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add next-app/src/sections/shared/media-id-schema.ts next-app/src/sections/shared/__tests__/media-id-schema.test.ts
git commit -m "feat(editor): MediaIdSchema helper for optional image slots"
```

---

## Task 2: PHP — decode `x-media` metadata in `FilamentSchemaMapper`

**Files:**
- Modify: `app/Services/Templates/FilamentSchemaMapper.php`
- Test: `tests/Unit/FilamentSchemaMapperTest.php` (create if absent)

- [ ] **Step 1: Write the failing test**

```php
// tests/Unit/FilamentSchemaMapperTest.php
<?php

namespace Tests\Unit;

use App\Filament\Forms\Components\MediaPickerField;
use App\Services\Templates\FilamentSchemaMapper;
use Tests\TestCase;

class FilamentSchemaMapperTest extends TestCase
{
    public function test_emits_media_picker_field_when_x_media_metadata_present(): void
    {
        $schema = [
            'type' => 'object',
            'properties' => [
                'heroBackgroundImageId' => [
                    'anyOf' => [
                        ['type' => 'string', 'format' => 'uuid'],
                        ['type' => 'null'],
                    ],
                    'description' => json_encode([
                        'x-media' => [
                            'role' => 'hero-background',
                            'category' => 'hero',
                            'subCategory' => 'background',
                        ],
                    ]),
                ],
            ],
        ];

        $out = (new FilamentSchemaMapper())->map($schema);

        $this->assertCount(1, $out);
        $this->assertInstanceOf(MediaPickerField::class, $out[0]);
        $this->assertSame('heroBackgroundImageId', $out[0]->getName());
        $this->assertSame('hero', $out[0]->getCategory());
        $this->assertSame('hero-background', $out[0]->getRole());
        $this->assertSame('background', $out[0]->getSubCategoryFilter());
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --compact --filter=FilamentSchemaMapperTest`
Expected: FAIL — `MediaPickerField` not defined, or test asserts `TextInput` returned.

- [ ] **Step 3: Implement `MediaPickerField` stub first so the mapper has something to emit**

```php
// app/Filament/Forms/Components/MediaPickerField.php
<?php

namespace App\Filament\Forms\Components;

use App\Models\MediaItem;
use App\Services\Media\MediaItemCreator;
use Filament\Forms\Components\Field;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;

/**
 * JSON-backed media picker. Unlike MediaPickerInput (which binds to a model
 * via setMediaFor), this field writes the selected MediaItem UUID directly
 * into its state path — suitable for nested content JSON like
 * `data.content.hero.backgroundImageId`.
 */
class MediaPickerField extends Field
{
    protected string $view = 'filament.forms.components.media-picker-field';

    protected string $category = 'hero';

    protected string $role = 'image';

    protected ?string $subCategoryFilter = null;

    protected bool $allowUpload = true;

    public function category(string $category): static
    {
        $this->category = $category;
        return $this;
    }

    public function role(string $role): static
    {
        $this->role = $role;
        return $this;
    }

    public function subCategory(?string $subCategory): static
    {
        $this->subCategoryFilter = $subCategory;
        return $this;
    }

    public function allowUpload(bool $allow = true): static
    {
        $this->allowUpload = $allow;
        return $this;
    }

    public function getCategory(): string
    {
        return $this->category;
    }

    public function getRole(): string
    {
        return $this->role;
    }

    public function getSubCategoryFilter(): ?string
    {
        return $this->subCategoryFilter;
    }

    public function isUploadAllowed(): bool
    {
        return $this->allowUpload;
    }

    public function getUploadStatePath(bool $absolute = true): string
    {
        return $this->getStatePath($absolute).'_upload';
    }

    protected function setUp(): void
    {
        parent::setUp();

        // This field *is* dehydrated — it must persist into the JSON content.
        $this->saveRelationshipsUsing(function (MediaPickerField $component, mixed $state): void {
            $livewire = $component->getLivewire();
            $uploadKey = $component->getUploadStatePath(false);
            $data = $livewire->data ?? [];

            $uploaded = data_get($data, $uploadKey);
            $uploadedFile = is_array($uploaded) ? ($uploaded[0] ?? null) : $uploaded;

            if ($uploadedFile instanceof TemporaryUploadedFile) {
                $newItem = app(MediaItemCreator::class)->fromUpload(
                    source: $uploadedFile,
                    category: $component->getCategory(),
                    subCategory: $component->getSubCategoryFilter(),
                );
                data_set($data, $uploadKey, null);
                data_set($data, $component->getStatePath(false), $newItem->getKey());
                $livewire->data = $data;
                $component->state($newItem->getKey());
            }
        });
    }
}
```

- [ ] **Step 4: Create a minimal view that renders the existing picker UI**

```blade
{{-- resources/views/filament/forms/components/media-picker-field.blade.php --}}
@php
    // Reuse the existing picker view by aliasing variables it expects.
    $field = $field ?? $getField();
@endphp

<x-dynamic-component :component="'filament.forms.components.media-picker-input'" :field="$field" />
```

- [ ] **Step 5: Extend the mapper**

Modify `app/Services/Templates/FilamentSchemaMapper.php` in `mapProperty()` — BEFORE the speaker-array check, add:

```php
// Media-id slot: `description` is a JSON blob containing `x-media` metadata.
if ($media = $this->extractMediaMetadata($schema)) {
    $picker = \App\Filament\Forms\Components\MediaPickerField::make($name)
        ->label($label)
        ->category($media['category'])
        ->role($media['role']);

    if (isset($media['subCategory'])) {
        $picker->subCategory($media['subCategory']);
    }

    return $picker;
}
```

Add the helper method at the bottom of the class:

```php
/**
 * @param  array<string, mixed>  $schema
 * @return array{role: string, category: string, subCategory?: string}|null
 */
private function extractMediaMetadata(array $schema): ?array
{
    $description = $schema['description'] ?? null;
    if (! is_string($description) || ! str_contains($description, 'x-media')) {
        return null;
    }

    $decoded = json_decode($description, true);
    if (! is_array($decoded) || ! isset($decoded['x-media']) || ! is_array($decoded['x-media'])) {
        return null;
    }

    $meta = $decoded['x-media'];
    if (! isset($meta['role'], $meta['category'])) {
        return null;
    }

    return $meta;
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `php artisan test --compact --filter=FilamentSchemaMapperTest`
Expected: PASS.

- [ ] **Step 7: Run Pint**

Run: `vendor/bin/pint --dirty --format agent`

- [ ] **Step 8: Commit**

```bash
git add app/Filament/Forms/Components/MediaPickerField.php \
        resources/views/filament/forms/components/media-picker-field.blade.php \
        app/Services/Templates/FilamentSchemaMapper.php \
        tests/Unit/FilamentSchemaMapperTest.php
git commit -m "feat(editor): emit MediaPickerField for x-media content slots"
```

---

## Task 3: `MediaContentResolver` — attach resolved URLs to content tree

**Files:**
- Create: `app/Services/Templates/MediaContentResolver.php`
- Test: `tests/Unit/MediaContentResolverTest.php`
- Modify: `app/Http/Resources/LandingPageDraftResource.php:48-64`

- [ ] **Step 1: Write the failing test**

```php
// tests/Unit/MediaContentResolverTest.php
<?php

namespace Tests\Unit;

use App\Models\MediaItem;
use App\Services\Templates\MediaContentResolver;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MediaContentResolverTest extends TestCase
{
    use RefreshDatabase;

    public function test_replaces_media_id_fields_with_resolved_sidecars(): void
    {
        $item = MediaItem::factory()->create(['category' => 'hero']);

        $content = [
            'hero' => [
                'headline' => 'Hello',
                'backgroundImageId' => $item->id,
            ],
            'footer' => [
                'logoMediaId' => null,
            ],
        ];

        $resolved = app(MediaContentResolver::class)->resolve($content);

        $this->assertSame('Hello', $resolved['hero']['headline']);
        $this->assertSame($item->id, $resolved['hero']['backgroundImageId']);
        $this->assertIsArray($resolved['hero']['backgroundImage']);
        $this->assertArrayHasKey('url', $resolved['hero']['backgroundImage']);
        $this->assertArrayNotHasKey('logo', $resolved['footer']);
    }

    public function test_handles_arrays_of_objects_with_media_ids(): void
    {
        $item = MediaItem::factory()->create();
        $content = [
            'bonuses' => [
                'items' => [
                    ['title' => 'A', 'thumbnailMediaId' => $item->id],
                    ['title' => 'B', 'thumbnailMediaId' => null],
                ],
            ],
        ];

        $resolved = app(MediaContentResolver::class)->resolve($content);

        $this->assertIsArray($resolved['bonuses']['items'][0]['thumbnail']);
        $this->assertArrayNotHasKey('thumbnail', $resolved['bonuses']['items'][1]);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --compact --filter=MediaContentResolverTest`
Expected: FAIL — class not found.

- [ ] **Step 3: Implement the resolver**

```php
// app/Services/Templates/MediaContentResolver.php
<?php

namespace App\Services\Templates;

use App\Models\MediaItem;
use Illuminate\Support\Str;

/**
 * Walk a content tree and, for every `*MediaId` / `*ImageId` field that
 * resolves to a MediaItem, add a sibling object with the resolved URL and
 * display metadata. Keys follow a convention:
 *   backgroundImageId -> backgroundImage
 *   logoMediaId       -> logo
 *   thumbnailMediaId  -> thumbnail
 *
 * Null / missing / unresolved ids are skipped — the skin sees nothing and
 * should render its empty-state layout.
 */
class MediaContentResolver
{
    /**
     * @param  array<string, mixed>|list<mixed>  $content
     * @return array<string, mixed>|list<mixed>
     */
    public function resolve(array $content): array
    {
        $ids = $this->collectIds($content);

        if ($ids === []) {
            return $content;
        }

        $items = MediaItem::query()->whereIn('id', $ids)->get()->keyBy('id');

        return $this->walk($content, $items);
    }

    /**
     * @param  array<string, mixed>|list<mixed>  $node
     * @return list<string>
     */
    private function collectIds(array $node): array
    {
        $out = [];
        array_walk_recursive($node, function ($value, $key) use (&$out): void {
            if (is_string($key) && $this->isMediaIdKey($key) && is_string($value) && $value !== '') {
                $out[] = $value;
            }
        });
        return array_values(array_unique($out));
    }

    /**
     * @param  array<string, mixed>|list<mixed>  $node
     * @param  \Illuminate\Support\Collection<string, MediaItem>  $items
     * @return array<string, mixed>|list<mixed>
     */
    private function walk(array $node, $items): array
    {
        $out = [];

        foreach ($node as $key => $value) {
            if (is_array($value)) {
                $out[$key] = $this->walk($value, $items);
                continue;
            }

            $out[$key] = $value;

            if (is_string($key) && $this->isMediaIdKey($key) && is_string($value) && $value !== '') {
                $item = $items->get($value);
                if ($item) {
                    $sidecarKey = $this->sidecarKey($key);
                    $out[$sidecarKey] = $this->toSidecar($item);
                }
            }
        }

        return $out;
    }

    private function isMediaIdKey(string $key): bool
    {
        return Str::endsWith($key, ['MediaId', 'ImageId']);
    }

    private function sidecarKey(string $key): string
    {
        if (Str::endsWith($key, 'MediaId')) {
            return Str::replaceLast('MediaId', '', $key);
        }
        // ImageId -> Image
        return Str::replaceLast('ImageId', 'Image', $key);
    }

    /**
     * @return array{id: string, url: string, alt: ?string, width: ?int, height: ?int}
     */
    private function toSidecar(MediaItem $item): array
    {
        return [
            'id' => $item->getKey(),
            'url' => $item->url(),
            'alt' => $item->alt_text,
            'width' => $item->width,
            'height' => $item->height,
        ];
    }
}
```

- [ ] **Step 4: Run resolver test to verify it passes**

Run: `php artisan test --compact --filter=MediaContentResolverTest`
Expected: PASS (2 tests).

- [ ] **Step 5: Wire resolver into `LandingPageDraftResource`**

Modify `app/Http/Resources/LandingPageDraftResource.php` — replace lines 48-64 with:

```php
/**
 * @param  mixed  $raw
 * @return array<int|string, mixed>
 */
private static function normalizeContent($raw, Request $request): array
{
    if (! is_array($raw) || $raw === []) {
        return [];
    }

    $isList = array_keys($raw) === range(0, count($raw) - 1);
    $looksLikeSections = $isList && is_array($raw[0] ?? null) && isset($raw[0]['type']);

    $content = $looksLikeSections
        ? SectionResource::collection($raw)->toArray($request)
        : $raw;

    return app(\App\Services\Templates\MediaContentResolver::class)->resolve($content);
}
```

- [ ] **Step 6: Run Pint**

Run: `vendor/bin/pint --dirty --format agent`

- [ ] **Step 7: Commit**

```bash
git add app/Services/Templates/MediaContentResolver.php \
        tests/Unit/MediaContentResolverTest.php \
        app/Http/Resources/LandingPageDraftResource.php
git commit -m "feat(editor): attach resolved media URLs to draft content tree"
```

---

## Task 4: Pilot — add image slots to IndigoGold schema

**Files:**
- Modify: `next-app/src/templates/indigo-gold.schema.ts`
- Test: `next-app/src/templates/indigo-gold.schema.test.ts` (extend existing)

- [ ] **Step 1: Write failing tests for the new optional fields**

Append to `next-app/src/templates/indigo-gold.schema.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { IndigoGoldSchema } from './indigo-gold.schema';

describe('IndigoGold image slots', () => {
  const base = /* reuse existing fixture builder in the test file; if none, inline a minimal valid content object here */;

  it('accepts hero backgroundImageId, masthead logoMediaId, host photoMediaId as optional UUIDs', () => {
    const input = {
      ...base,
      hero: { ...base.hero, backgroundImageId: '550e8400-e29b-41d4-a716-446655440000' },
      topBar: { ...base.topBar, logoMediaId: '550e8400-e29b-41d4-a716-446655440001' },
      founders: {
        ...base.founders,
        items: base.founders.items.map((f) => ({ ...f, photoMediaId: null })),
      },
    };
    expect(IndigoGoldSchema.safeParse(input).success).toBe(true);
  });

  it('accepts drafts without any image fields (all optional)', () => {
    expect(IndigoGoldSchema.safeParse(base).success).toBe(true);
  });

  it('rejects non-UUID values', () => {
    const input = { ...base, hero: { ...base.hero, backgroundImageId: 'not-uuid' } };
    expect(IndigoGoldSchema.safeParse(input).success).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd next-app && pnpm vitest run src/templates/indigo-gold.schema.test.ts`
Expected: FAIL — unknown fields.

- [ ] **Step 3: Add image slots to the schema**

In `next-app/src/templates/indigo-gold.schema.ts`:

Add at the top:

```typescript
import { MediaIdSchema } from '../sections/shared/media-id-schema';
```

In `hero` object (after `collagePhotoUrls`):

```typescript
    backgroundImageId: MediaIdSchema({ role: 'hero-background', category: 'hero', subCategory: 'background' }),
    foregroundImageId: MediaIdSchema({ role: 'hero-foreground', category: 'hero', subCategory: 'lifestyle' }),
```

In `topBar`:

```typescript
    logoMediaId: MediaIdSchema({ role: 'logo', category: 'brand' }),
```

In `overview` (replace `imageUrl` usage — keep the field for back-compat but add structured slot):

```typescript
    imageMediaId: MediaIdSchema({ role: 'overview-image', category: 'hero' }),
```

In `founders.items` repeater:

```typescript
      photoMediaId: MediaIdSchema({ role: 'host-photo', category: 'speaker' }),
```

In `bonuses.items`:

```typescript
      thumbnailMediaId: MediaIdSchema({ role: 'bonus-thumbnail', category: 'product', subCategory: 'thumbnail' }),
```

In `freeGift`:

```typescript
    coverImageId: MediaIdSchema({ role: 'gift-cover', category: 'product' }),
```

In `footer`:

```typescript
    logoMediaId: MediaIdSchema({ role: 'footer-logo', category: 'brand' }),
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd next-app && pnpm vitest run src/templates/indigo-gold.schema.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add next-app/src/templates/indigo-gold.schema.ts next-app/src/templates/indigo-gold.schema.test.ts
git commit -m "feat(indigo-gold): optional image slots in schema"
```

---

## Task 5: Pilot — render image slots in IndigoGold skin

**Files:**
- Modify: `next-app/src/templates/IndigoGold.tsx`
- Test: `next-app/src/templates/indigo-gold.test.tsx` (extend)

- [ ] **Step 1: Write failing render tests**

Append to `next-app/src/templates/indigo-gold.test.tsx`:

```typescript
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { IndigoGold } from './IndigoGold';

describe('IndigoGold image slots', () => {
  it('renders <img> when hero.backgroundImage sidecar present', () => {
    const content = /* fixture */ {
      // ...include minimum valid content + the sidecar
      hero: {
        // ...other required fields
        backgroundImageId: '550e8400-e29b-41d4-a716-446655440000',
        backgroundImage: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          url: 'https://cdn.example.test/hero-bg.jpg',
          alt: 'ADHD Summit backdrop',
          width: 1920,
          height: 1080,
        },
      },
    };
    const { container } = render(<IndigoGold content={content as any} speakers={[]} />);
    const img = container.querySelector('img[src="https://cdn.example.test/hero-bg.jpg"]');
    expect(img).not.toBeNull();
  });

  it('omits the <img> when sidecar is absent (empty-state layout)', () => {
    const content = /* fixture without backgroundImage sidecar */;
    const { container } = render(<IndigoGold content={content as any} speakers={[]} />);
    expect(container.querySelector('img[alt*="backdrop"]')).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd next-app && pnpm vitest run src/templates/indigo-gold.test.tsx -t "image slots"`
Expected: FAIL.

- [ ] **Step 3: Update `IndigoGold.tsx` to render sidecars**

For each slot added in Task 4, render a null-safe `<img>` in the appropriate section. Example for hero background:

```tsx
{content.hero.backgroundImage && (
  <img
    src={content.hero.backgroundImage.url}
    alt={content.hero.backgroundImage.alt ?? ''}
    width={content.hero.backgroundImage.width ?? undefined}
    height={content.hero.backgroundImage.height ?? undefined}
    className="hero-background"
    loading="eager"
  />
)}
```

And analogous blocks for `topBar.logo`, `overview.image`, `founders.items[i].photo`, `bonuses.items[i].thumbnail`, `freeGift.cover`, `footer.logo`.

Each location must: (a) render when the sidecar is present; (b) render the pre-existing empty-state layout (initials, text-only overview, etc.) when absent.

- [ ] **Step 4: Update the TypeScript content type**

If `IndigoGoldContent` is the source of truth, regenerate via `z.infer`. Since the sidecar is added post-API, extend the render-time type in `IndigoGold.tsx`:

```tsx
type MediaSidecar = { id: string; url: string; alt: string | null; width: number | null; height: number | null };

type RenderContent = IndigoGoldContent & {
  hero: IndigoGoldContent['hero'] & { backgroundImage?: MediaSidecar; foregroundImage?: MediaSidecar };
  topBar: IndigoGoldContent['topBar'] & { logo?: MediaSidecar };
  overview: IndigoGoldContent['overview'] & { image?: MediaSidecar };
  founders: IndigoGoldContent['founders'] & { items: Array<IndigoGoldContent['founders']['items'][number] & { photo?: MediaSidecar }> };
  bonuses: IndigoGoldContent['bonuses'] & { items: Array<IndigoGoldContent['bonuses']['items'][number] & { thumbnail?: MediaSidecar }> };
  freeGift: IndigoGoldContent['freeGift'] & { cover?: MediaSidecar };
  footer: IndigoGoldContent['footer'] & { logo?: MediaSidecar };
};
```

Use `RenderContent` in the component signature.

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd next-app && pnpm vitest run src/templates/indigo-gold.test.tsx`
Expected: PASS.

- [ ] **Step 6: Run typecheck**

Run: `cd next-app && pnpm typecheck`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add next-app/src/templates/IndigoGold.tsx next-app/src/templates/indigo-gold.test.tsx
git commit -m "feat(indigo-gold): render image slots with empty-state fallbacks"
```

---

## Task 6: End-to-end smoke — Filament + Laravel + Next.js

**Files:** no new files — verifies the pilot works in a browser.

- [ ] **Step 1: Start the dev stack**

Run: `composer dev` (per feedback memory — starts server + queue + pail + vite)

- [ ] **Step 2: Open an IndigoGold landing page draft in Filament**

Navigate to `/admin/funnels/{funnel}/landing-page-drafts/{draft}/edit`. Confirm that:
- Hero `backgroundImageId` / `foregroundImageId` fields appear as media pickers (not text inputs)
- Upload an image → it persists, the picker reflects the upload after save

- [ ] **Step 3: Render the funnel's Next.js page**

Navigate to the funnel's published URL (use `get-absolute-url` via boost). Confirm:
- The uploaded hero image renders in the hero section
- Remove the image via Filament → page falls back to the speaker collage / empty-state layout

- [ ] **Step 4: Run full suites**

Run in parallel:
- `php artisan test --compact`
- `cd next-app && pnpm typecheck && pnpm vitest run`

Expected: all green.

- [ ] **Step 5: Commit any small fixes with**

```bash
git commit -am "fix: indigo-gold image slot pilot polish"
```

(skip if nothing changed)

---

## Rollout Tasks — Tasks 7-13 (one per remaining template)

**Pattern:** For each of `BlueCoral`, `CreamSage`, `GreenGold`, `LimeInk`, `OchreInk`, `RustCream`, `VioletSun`, repeat the same work done for IndigoGold in Tasks 4+5:

### Task 7: BlueCoral image slots

- [ ] **Step 1: Review the template's design** — open `next-app/src/templates/BlueCoral.tsx` and its reference PNG (if present). Note which sections visually call for images (hero art, host photo, product shot, etc.).
- [ ] **Step 2: Extend tests** — add `describe('BlueCoral image slots', ...)` to `blue-coral.schema.test.ts` and `blue-coral.test.tsx` mirroring Tasks 4 Step 1 and Task 5 Step 1.
- [ ] **Step 3: Add `MediaIdSchema(...)` entries** to `next-app/src/templates/blue-coral.schema.ts` for each slot you identified. Use the same pattern as Task 4 Step 3. Re-use existing roles (`hero-background`, `logo`, `host-photo`, `bonus-thumbnail`) where semantics match, invent new ones only when a template has a truly unique slot (e.g. `lifestyle-collage`).
- [ ] **Step 4: Render in `BlueCoral.tsx`** — same null-safe pattern as Task 5 Step 3, with that template's own empty-state layout preserved.
- [ ] **Step 5: Extend render type** — same as Task 5 Step 4 adapted to BlueCoral.
- [ ] **Step 6: Run**: `cd next-app && pnpm vitest run src/templates/blue-coral.* && pnpm typecheck`. Expected: PASS.
- [ ] **Step 7: Smoke-test** the rendered BlueCoral page in the browser (upload an image in Filament, confirm it renders; remove it, confirm fallback).
- [ ] **Step 8: Commit**: `git commit -am "feat(blue-coral): optional image slots"`

### Task 8: CreamSage image slots

Repeat Task 7 steps, replacing every `blue-coral` / `BlueCoral` with `cream-sage` / `CreamSage`.

### Task 9: GreenGold image slots

Repeat Task 7 steps, replacing every `blue-coral` / `BlueCoral` with `green-gold` / `GreenGold`.

### Task 10: LimeInk image slots

Repeat Task 7 steps, replacing every `blue-coral` / `BlueCoral` with `lime-ink` / `LimeInk`.

### Task 11: OchreInk image slots

Repeat Task 7 steps, replacing every `blue-coral` / `BlueCoral` with `ochre-ink` / `OchreInk`. Note: OchreInk has its own subfolder (`next-app/src/templates/ochre-ink/`) — place new image-handling files inside it if the template's convention is modular.

### Task 12: RustCream image slots

Repeat Task 7 steps, replacing every `blue-coral` / `BlueCoral` with `rust-cream` / `RustCream`.

### Task 13: VioletSun image slots

Repeat Task 7 steps, replacing every `blue-coral` / `BlueCoral` with `violet-sun` / `VioletSun`.

---

## Task 14: Update documentation snippet

**Files:**
- Modify: `CLAUDE.md` (append a short section under "Phase plan (V1)" or a new "Template conventions" note)

- [ ] **Step 1: Add a paragraph describing the image-slot convention**

```markdown
## Template image slots

Templates declare optional image slots via `MediaIdSchema({ role, category, subCategory? })`
in `next-app/src/sections/shared/media-id-schema.ts`. Filament renders them as
`MediaPickerField`; the Laravel API resolves UUIDs to `{ url, alt, width, height }`
sidecars before sending to Next.js. Every skin must render the image when the
sidecar is present and fall back to its text-only layout when absent.
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: template image-slot convention"
```

---

## Done

After Task 14: every template has optional image slots wired end-to-end. Operator flow: upload once into the Media Library → pick per-section in Filament → renders automatically, sections adapt when empty.
