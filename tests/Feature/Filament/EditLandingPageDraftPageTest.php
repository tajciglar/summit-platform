<?php

use App\Filament\Resources\Funnels\Pages\EditLandingPageDraftPage;
use App\Models\Domain;
use App\Models\Funnel;
use App\Models\LandingPageBatch;
use App\Models\LandingPageDraft;
use App\Models\Summit;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Support\Facades\Gate;

use function Pest\Livewire\livewire;

beforeEach(function () {
    Gate::before(fn () => true);
    $this->actingAs(User::factory()->admin()->create());

    $this->tenant = Domain::create([
        'name' => 'Test Domain',
        'hostname' => 'test.localhost',
        'slug' => 'test-domain',
        'is_active' => true,
    ]);
    Filament::setTenant($this->tenant);
});

function makeDraft(array $overrides = []): array
{
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id,
        'funnel_id' => $funnel->id,
        'version_count' => 1,
        'status' => 'running',
    ]);

    $attrs = array_merge([
        'batch_id' => $batch->id,
        'version_number' => 1,
        'template_key' => 'ochre-ink',
        'sections' => ['hero' => ['headline' => 'Hello world', 'subheadline' => 'A subtitle']],
        'enabled_sections' => ['hero', 'footer'],
        'status' => 'shortlisted',
        'preview_token' => 't1',
    ], $overrides);

    $draft = LandingPageDraft::create($attrs);

    return [$funnel, $draft];
}

/** @return list<array{type: string, data: array}> Strip Builder's UUID keys for easy assertions. */
function normalizeBlocks(array $blocks): array
{
    return array_values(array_map(
        fn (array $b): array => ['type' => $b['type'], 'data' => $b['data'] ?? []],
        $blocks,
    ));
}

it('renders Builder blocks for ochre-ink drafts', function () {
    [$funnel, $draft] = makeDraft();

    livewire(EditLandingPageDraftPage::class, [
        'record' => $funnel->id,
        'draft' => $draft->id,
    ])->assertSuccessful();
});

it('hydrates Builder blocks from enabled_sections in order', function () {
    [$funnel, $draft] = makeDraft([
        'enabled_sections' => ['hero', 'faq', 'footer'],
    ]);

    $page = livewire(EditLandingPageDraftPage::class, [
        'record' => $funnel->id,
        'draft' => $draft->id,
    ])->assertSuccessful();

    $blocks = normalizeBlocks($page->instance()->data['blocks'] ?? []);
    $types = array_column($blocks, 'type');

    expect($types)->toBe(['hero', 'faq', 'footer']);
});

it('falls back to defaultEnabledSections when the draft has none stored', function () {
    [$funnel, $draft] = makeDraft(['enabled_sections' => null]);

    $page = livewire(EditLandingPageDraftPage::class, [
        'record' => $funnel->id,
        'draft' => $draft->id,
    ])->assertSuccessful();

    $blocks = normalizeBlocks($page->instance()->data['blocks'] ?? []);
    $types = array_column($blocks, 'type');

    expect($types)->toContain('hero');
    expect($types)->toContain('footer');
});

it('removing a block persists enabled_sections minus that section', function () {
    [$funnel, $draft] = makeDraft([
        'enabled_sections' => ['hero', 'faq', 'footer'],
    ]);

    $page = livewire(EditLandingPageDraftPage::class, [
        'record' => $funnel->id,
        'draft' => $draft->id,
    ]);

    // Drop the middle block ('faq').
    $blocks = collect($page->instance()->data['blocks'] ?? [])
        ->reject(fn (array $b) => ($b['type'] ?? null) === 'faq')
        ->values()
        ->all();

    $page->set('data.blocks', $blocks)->call('save');

    $fresh = $draft->fresh()->enabled_sections;
    expect($fresh)->toBe(['hero', 'footer']);
});

it('reordering blocks persists the new enabled_sections order', function () {
    [$funnel, $draft] = makeDraft([
        'enabled_sections' => ['hero', 'faq', 'footer'],
    ]);

    $page = livewire(EditLandingPageDraftPage::class, [
        'record' => $funnel->id,
        'draft' => $draft->id,
    ]);

    // Swap 'faq' and 'footer'.
    $blocks = collect($page->instance()->data['blocks'] ?? [])->values();
    $reordered = [$blocks[0], $blocks[2], $blocks[1]];

    $page->set('data.blocks', $reordered)->call('save');

    expect($draft->fresh()->enabled_sections)->toBe(['hero', 'footer', 'faq']);
});

it('falls back to a whole-schema form when the template does not support sections', function () {
    [$funnel, $draft] = makeDraft([
        'template_key' => 'lime-ink',
        'enabled_sections' => null,
        'sections' => ['summit' => ['name' => 'My Summit']],
    ]);

    livewire(EditLandingPageDraftPage::class, [
        'record' => $funnel->id,
        'draft' => $draft->id,
    ])->assertSuccessful();
});

it('persists content edits inside a block on save', function () {
    [$funnel, $draft] = makeDraft([
        'sections' => ['hero' => ['headline' => 'Original', 'subheadline' => 'sub']],
        'enabled_sections' => ['hero'],
    ]);

    $page = livewire(EditLandingPageDraftPage::class, [
        'record' => $funnel->id,
        'draft' => $draft->id,
    ]);

    // Builder state has a single hero block — rewrite its data.
    $blocks = collect($page->instance()->data['blocks'] ?? [])->values()->all();
    $blocks[0]['data']['headline'] = 'Updated headline';

    $page->set('data.blocks', $blocks)->call('save');

    expect($draft->fresh()->sections['hero']['headline'])->toBe('Updated headline');
});
