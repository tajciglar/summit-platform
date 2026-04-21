# Media Library — Design Spec

**Date:** 2026-04-21
**Status:** Approved (design phase); ready for implementation plan
**Scope:** v1 (images only). Downloadable delivery deferred to Brevo/checkout spec.

## Background

Operators currently attach images one at a time per resource (Product, Speaker, Summit, FunnelStepBump, Domain, AppSettings). Each model uses Spatie's `HasMedia` on a local disk. There is no way to browse, reuse, or audit assets across a domain.

Goals for v1:

- A **per-domain media library** (plus platform-global items) with a Filament UI.
- **Library is the single source of truth.** Owning models reference library items; they don't hold their own media collections.
- **Storage lives in Bunny** (Storage Zone + CDN). Filament is UI only; no local binary fallback.
- **Reusable picker field** shared by every resource that needs an image.
- **PDF category scaffolded** for the downloadable-product use case, but delivery (post-purchase signed URLs in email) is deferred.

## Decisions locked in brainstorming

| # | Decision | Alternatives rejected |
|---|---|---|
| Q1 | Library is the **single source of truth**. Drop per-model `HasMedia`; owning models reference library items. | Additive layer (two systems); hybrid (two patterns). |
| Q2 | **Nullable `domain_id`** for globals (platform-owned assets). Editors see globals read-only; platform admins manage them. | Hard per-domain only; explicit sharing pivot. |
| Q3 | **v1 = images only.** Downloadable category scaffolded in schema/UI; delivery flow deferred. | Full downloadable delivery in v1. |
| Q4 | **One-shot migration command** moves existing Spatie media into the library. | Dual-write bridge; wipe and re-upload. |
| Q5 (storage) | **Polymorphic pivot** (`media_item_attachments`) for all attachments, single-slot and gallery alike. | Per-slot FK columns; FK+pivot hybrid. |
| Q5 (UX) | **Picker modal with inline upload** — thumbnail slot in forms; modal pre-filtered by category; "Upload new" inside the modal lands in library and auto-selects. | External upload then separate pick step. |

## Architecture

```
+-------------------------------------------+
|  Bunny Storage Zone                       |
|   path: {domain_uuid|_global}/{category}/ |
|         {uuid}.{ext}                      |
+-------------------------------------------+
                ^ upload + conversions via queue
                |
+-------------------------------------------+
|  Spatie media (disk_name=bunny)           |
|   1:1 with MediaItem; conversions         |
|   thumb (320x320), preview (1200x630)     |
+-------------------------------------------+
                ^ single-file collection
                |
+-------------------------------------------+
|  MediaItem (library row)                  |
|   id, domain_id NULLABLE, category,       |
|   sub_category, caption, alt_text,        |
|   created_by_user_id, timestamps          |
+-------------------------------------------+
                ^ morphToMany
                |
+-------------------------------------------+
|  media_item_attachments                   |
|   media_item_id, attachable_id,           |
|   attachable_type, role, sort_order       |
+-------------------------------------------+
                ^
                |
+-------------------------------------------+
|  Summit / Product / Speaker /             |
|  FunnelStepBump / Domain / AppSettings    |
|  (use HasMediaAttachments trait)          |
+-------------------------------------------+
```

## Data model

### `media_items`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `domain_id` | uuid, FK → `domains.id`, **nullable** | null = global/platform-owned |
| `category` | enum(`hero`,`product`,`people`,`brand`,`downloadable`) | see "Category taxonomy" below |
| `sub_category` | string, nullable | free-text, autocompleted from existing values in the same domain (`upsell`, `bump`, `main`, `team`, …) |
| `caption` | string, nullable | |
| `alt_text` | string, nullable | required on images at attach time for accessibility (enforced in picker, not DB) |
| `created_by_user_id` | uuid, FK → `users.id` | |
| `created_at`, `updated_at` | timestamps | |

Indexes: `(domain_id, category)`, `(domain_id, sub_category)`.

### `media_item_attachments` (the pivot)

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `media_item_id` | uuid, FK → `media_items.id`, cascade on delete-of-item **blocked** by app guard | |
| `attachable_id` | uuid | morph |
| `attachable_type` | string | morph |
| `role` | string | `hero`, `image`, `photo`, `logo`, `gallery`, … |
| `sort_order` | int, default 0 | for galleries |
| `created_at`, `updated_at` | timestamps | |

Indexes: unique `(attachable_id, attachable_type, role, media_item_id)`; `(media_item_id)` for reverse usage lookup.

**Single-slot roles** (e.g. `hero`, `image`, `photo`, `logo`) are enforced at the model level: `setMediaFor($role, $item)` deletes any existing pivot row with the same `(attachable, role)` before inserting. **Gallery roles** allow multiple rows per slot, ordered by `sort_order`.

### Spatie `media` (existing)

No schema changes. One row per MediaItem, `model_type = App\Models\MediaItem`, `collection_name = 'file'`, `disk_name = 'bunny'`.

## Category taxonomy

The original memory spec sketched three categories (`hero`, `product`, `downloadable`). Reviewing the 6 existing consumers during design showed that forced Speaker photos and Domain/AppSettings logos into categories where they don't belong. v1 uses **five** top-level categories so operators find things where they intuitively look:

| Category | Used for | Sub-category examples |
|---|---|---|
| `hero` | Summit/landing page hero images | `optin`, `sales`, `summit` |
| `product` | Product images (offers, upsells, bumps) | `main`, `upsell`, `bump` |
| `people` | Speaker headshots, team photos | `speaker`, `team` |
| `brand` | Logos, brand marks | `primary`, `dark`, `favicon` |
| `downloadable` | PDFs/ebooks (scaffolded in v1; delivery deferred) | `ebook`, `worksheet` |

`sub_category` stays free-text with autocomplete so operators can coin new ones.

## Storage + Bunny wiring

- New disk `bunny` in `config/filesystems.php` using a community Flysystem Bunny adapter. Final package choice (`platformcommunity/flysystem-bunny-cdn` vs. `corbpie/bunny-cdn-laravel` vs. alternative) is confirmed during implementation; selection criteria = actively maintained as of 2026-04, Laravel 13 compatible, supports Bunny Storage Zone + pull zone CDN URL.
- `config/media-library.php` published; `disk_name` = `bunny`.
- Conversions registered on `MediaItem`:
  - `thumb` — 320×320 contain, for grid thumbnails.
  - `preview` — 1200×630 contain, for hero-size previews in forms.
  - Both queued.
- Path convention: `{domain_uuid}/{category}/{uuid}.{ext}` for domain-scoped items; `_global/{category}/{uuid}.{ext}` for global items. Spatie's path generator is customized to use this pattern.
- CDN URL: Bunny pull-zone hostname from `BUNNY_CDN_HOSTNAME`. Library returns CDN URLs to frontend and Filament; storage zone hostname is server-side only.

## Models

### `MediaItem`

```php
class MediaItem extends Model implements HasMedia
{
    use InteractsWithMedia, HasUuids;

    protected $fillable = [
        'domain_id', 'category', 'sub_category',
        'caption', 'alt_text', 'created_by_user_id',
    ];

    protected $casts = ['category' => MediaCategory::class];

    public function domain(): BelongsTo { return $this->belongsTo(Domain::class); }

    public function createdBy(): BelongsTo { return $this->belongsTo(User::class, 'created_by_user_id'); }

    public function attachments(): HasMany { return $this->hasMany(MediaItemAttachment::class); }

    public function scopeForDomain(Builder $q, Domain $domain): Builder
    { return $q->where('domain_id', $domain->id); }

    public function scopeGlobal(Builder $q): Builder
    { return $q->whereNull('domain_id'); }

    public function scopeVisibleTo(Builder $q, Domain $domain): Builder
    { return $q->where(fn ($q) => $q->where('domain_id', $domain->id)->orWhereNull('domain_id')); }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('file')->singleFile();
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')->fit(Fit::Contain, 320, 320);
        $this->addMediaConversion('preview')->fit(Fit::Contain, 1200, 630);
    }

    public function url(): ?string { return $this->getFirstMediaUrl('file'); }
    public function thumbUrl(): ?string { return $this->getFirstMediaUrl('file', 'thumb'); }
    public function previewUrl(): ?string { return $this->getFirstMediaUrl('file', 'preview'); }
}
```

### `HasMediaAttachments` trait

```php
trait HasMediaAttachments
{
    public function mediaAttachments(): MorphToMany
    {
        return $this->morphToMany(MediaItem::class, 'attachable', 'media_item_attachments')
            ->withPivot(['role', 'sort_order'])->withTimestamps();
    }

    public function mediaFor(string $role): ?MediaItem
    {
        return $this->mediaAttachments()->wherePivot('role', $role)->first();
    }

    public function galleryFor(string $role): Collection
    {
        return $this->mediaAttachments()
            ->wherePivot('role', $role)
            ->orderBy('media_item_attachments.sort_order')
            ->get();
    }

    public function setMediaFor(string $role, ?MediaItem $item): void
    {
        $this->mediaAttachments()->wherePivot('role', $role)->detach();
        if ($item) { $this->mediaAttachments()->attach($item->id, ['role' => $role]); }
    }

    public function setGalleryFor(string $role, array $mediaItemIds): void
    {
        $this->mediaAttachments()->wherePivot('role', $role)->detach();
        foreach (array_values($mediaItemIds) as $i => $id) {
            $this->mediaAttachments()->attach($id, ['role' => $role, 'sort_order' => $i]);
        }
    }
}
```

Consumers (drop `HasMedia`, adopt `HasMediaAttachments`):

- `Summit` — role `hero`
- `Product` — role `image`
- `Speaker` — role `photo`
- `FunnelStepBump` — role `image`
- `Domain` — role `logo`
- `AppSettings` — role `logo`

Future consumers add the trait and pick roles freely — no schema change.

## Filament

### `MediaLibraryResource` — `/admin/media-library`

- Navigation group: *Content*. Icon: `Heroicon::Photo`.
- List view: grid of thumbnail cards grouped by category tabs (`Hero`, `Product`, `Downloadable`). Globals appear under a separate "Global" tab visible to all editors as read-only; editable only with `media_library.manage_globals`.
- Card shows thumbnail, sub-category tag, caption, "Used in: N places" badge.
- Filters: sub-category select (autocompleted from existing), usage (used / unused), uploader.
- Tenant scoping via existing `ScopesTenantViaSummitDomains`-style approach adapted for MediaItem's direct `domain_id` (no summit indirection): scope to `visibleTo(currentDomain)`.
- **Upload action**: modal with drop zone; category preset from active tab; sub-category TagsInput autocompleted from existing values in the domain; alt_text + caption fields.
- **Usage inline panel** (row action `View usage`): list of `{mediable_type, record title, role}` rows from attachments, each linking to the owner's Filament edit page.
- **Delete guard**: if `attachments().count() > 0`, confirmation modal lists all usages; hard delete requires typing the filename to confirm and is blocked for editors without `media_library.delete_in_use`.

### `MediaPickerInput` (custom Filament form field)

- API: `MediaPickerInput::make('hero')->category('hero')->role('hero')->required()`.
- Renders:
  - **Empty state**: dashed thumbnail-sized slot with "Choose image" button.
  - **Filled state**: thumbnail preview + `Replace`, `Clear` actions on hover.
- Clicking `Choose image` or `Replace` opens a library modal:
  - Pre-filtered: `category` from the field, `visibleTo(currentDomain)`.
  - Operator can change category tab within the modal.
  - Grid of thumbnails, paginated, with search + sub-category filter.
  - Top-right: "Upload new" button — on click, inline upload form appears above the grid; on save, item is created in the library with the modal's current category, alt_text/caption from the form, and is immediately selected (modal closes and form field shows it).
- On form save, the field writes to `media_item_attachments` via `setMediaFor($role, $item)` on the owning record. Dehydration happens after the record is saved (for create flows) via a model observer hook registered by the trait, since attachments need an existing `attachable_id`.

### Permissions (Spatie Permissions)

| Permission | Who | What |
|---|---|---|
| `media_library.view` | editor + admin | see own-domain + globals |
| `media_library.upload` | editor + admin | upload into own domain |
| `media_library.manage_globals` | platform admin only | CRUD on null-domain items |
| `media_library.delete` | editor + admin | delete own-domain items that are NOT attached |
| `media_library.delete_in_use` | platform admin only | force-delete items that are attached (breaks references) |

## Migration from existing media

One-shot command `php artisan media-library:migrate`:

1. Run schema migrations (adds `media_items`, `media_item_attachments`; temporary `legacy_spatie_media_id` column on `media_items` for idempotency).
2. Iterate existing Spatie `media` rows where `model_type` is one of Summit/Product/Speaker/FunnelStepBump/Domain/AppSettings.
3. For each legacy row:
   - Resolve owning domain:
     - `Summit` → first `summit.domains`
     - `Product`, `Speaker`, `FunnelStepBump` → through their summit
     - `Domain` → self
     - `AppSettings` → null (global)
   - Map `(model, collection_name)` → category:
     - `Summit.hero` → `hero` (sub `summit`)
     - `Product.image` → `product` (sub `main`)
     - `FunnelStepBump.image` → `product` (sub `bump`)
     - `Speaker.photo` → `people` (sub `speaker`)
     - `Domain.logo` → `brand` (sub `primary`)
     - `AppSettings.logo` → `brand` (sub `primary`)
   - Create `MediaItem` with that domain + category; set `created_by_user_id` to the record's creator if available, else the first platform admin.
   - Stream-copy the file from the local disk to Bunny; attach to the MediaItem's `file` collection (Spatie media row with `disk_name=bunny`). Preserve original filename.
   - Create `media_item_attachments` row: `attachable = legacy owner`, `role = collection_name`, `sort_order = 0`.
   - Store legacy Spatie media id on the MediaItem for idempotency.
4. Run a verification pass: every legacy media row has exactly one corresponding MediaItem + attachment; file checksums match.
5. Deploy code change that removes `HasMedia` from the 6 models.
6. After a 7-day soak, run a follow-up command that drops **only** the legacy Spatie media rows (those whose `model_type` is in the 6 migrated model classes) and their local files. Spatie rows owned by `MediaItem` itself — the new canonical library entries — are left alone.

Command flags:
- `--dry-run` — reports counts and mappings without writing.
- `--model=Summit` — migrate a single model for staged rollout.
- `--resume` — skip MediaItems that already have `legacy_spatie_media_id` set.

## Testing

- **Unit**
  - `MediaItem` scopes: `forDomain`, `global`, `visibleTo` return expected sets across domains.
  - `HasMediaAttachments` trait: `setMediaFor` replaces existing row; `galleryFor` returns ordered collection; `setGalleryFor` rewrites in order.
  - `MediaCategory` enum coverage.
  - Path generator produces `{domain|_global}/{category}/{uuid}.{ext}`.
- **Feature (Filament / Livewire)**
  - `MediaLibraryResource`: list filters correctly (own + globals, not other domains); upload creates MediaItem + Bunny file (faked disk); delete blocked when in use; force-delete admin path.
  - `MediaPickerInput` on `ProductResource`: pick existing, upload-new-and-pick, clear; verifies pivot row after save.
  - Cross-domain isolation: domain A operator cannot see or pick domain B items.
- **Migration**
  - Pest test seeds a Summit + Product + Speaker with legacy media; runs `media-library:migrate`; asserts new pivot rows, MediaItem rows, file content match; re-running is a no-op.
- **Permissions**
  - Editor without `manage_globals` cannot edit global items; receives 403 on admin panel actions.

Run with `php artisan test --compact`.

## Out of scope (deferred)

- Signed download URLs + delivery endpoint + Brevo/AC email wiring for downloadables (separate Brevo/checkout spec).
- `product_downloadables` multi-file pivot.
- Cross-domain explicit sharing (beyond null = global).
- Bulk operations (re-tag, move between categories).
- Image cropping UI beyond Filament's upload crop.
- Analytics ("which images convert best").

## Open items for implementation

- **Bunny Flysystem adapter** — confirm the currently maintained package before wiring the disk. Fallback: thin wrapper around Bunny HTTP API if no package is viable.
- **Filament custom field rendering** — confirm Filament v4 custom field API surface for the picker (render from Blade view + Livewire component for the modal).
- **Tenant trait** — MediaItem has a direct `domain_id` so it cannot reuse `ScopesTenantViaSummitDomains` verbatim; either create a sibling trait `ScopesTenantViaDomainId` or inline the scoping in the resource.
