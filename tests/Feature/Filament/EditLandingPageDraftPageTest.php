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
    // Bypass Filament Shield permission checks for tests.
    Gate::before(fn () => true);
    $this->actingAs(User::factory()->admin()->create());

    // Filament tenant is Domain — register one and make it the active tenant
    // so URL generation for breadcrumbs / nav links works inside the page view.
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
        'template_key' => 'opus-v1',
        'sections' => ['hero' => ['headline' => 'Hello world', 'subheadline' => 'A subtitle']],
        'enabled_sections' => ['hero', 'footer'],
        'status' => 'shortlisted',
        'preview_token' => 't1',
    ], $overrides);

    $draft = LandingPageDraft::create($attrs);

    return [$funnel, $draft];
}

it('renders per-section fieldsets for opus-v1 drafts', function () {
    [$funnel, $draft] = makeDraft();

    livewire(EditLandingPageDraftPage::class, [
        'record' => $funnel->id,
        'draft' => $draft->id,
    ])->assertSuccessful();
});

it('hydrates the enabled toggles from the draft enabled_sections', function () {
    [$funnel, $draft] = makeDraft([
        'enabled_sections' => ['hero', 'faq', 'footer'],
    ]);

    $page = livewire(EditLandingPageDraftPage::class, [
        'record' => $funnel->id,
        'draft' => $draft->id,
    ])->assertSuccessful();

    $data = $page->instance()->data;

    expect($data['enabled']['hero'] ?? null)->toBeTrue();
    expect($data['enabled']['faq'] ?? null)->toBeTrue();
    expect($data['enabled']['footer'] ?? null)->toBeTrue();
    // `masthead` is supported but not in enabled_sections -> should be false.
    expect($data['enabled']['masthead'] ?? null)->toBeFalse();
});

it('falls back to defaultEnabledSections when the draft has none stored', function () {
    [$funnel, $draft] = makeDraft([
        'enabled_sections' => null,
    ]);

    $page = livewire(EditLandingPageDraftPage::class, [
        'record' => $funnel->id,
        'draft' => $draft->id,
    ])->assertSuccessful();

    $data = $page->instance()->data;

    // opus-v1 defaultEnabledSections includes 'hero' and 'footer'.
    expect($data['enabled']['hero'] ?? null)->toBeTrue();
    expect($data['enabled']['footer'] ?? null)->toBeTrue();
});

it('toggling a section off removes it from enabled_sections on save', function () {
    [$funnel, $draft] = makeDraft([
        'enabled_sections' => ['hero', 'faq', 'footer'],
    ]);

    livewire(EditLandingPageDraftPage::class, [
        'record' => $funnel->id,
        'draft' => $draft->id,
    ])
        ->set('data.enabled.faq', false)
        ->call('save');

    $fresh = $draft->fresh()->enabled_sections;

    expect($fresh)->not->toContain('faq');
    expect($fresh)->toContain('hero');
    expect($fresh)->toContain('footer');
});

it('falls back to a whole-schema form when the template does not support sections', function () {
    [$funnel, $draft] = makeDraft([
        'template_key' => 'opus-v2',
        'enabled_sections' => null,
        'sections' => ['summit' => ['name' => 'My Summit']],
    ]);

    livewire(EditLandingPageDraftPage::class, [
        'record' => $funnel->id,
        'draft' => $draft->id,
    ])->assertSuccessful();
});

it('persists section content edits on save', function () {
    [$funnel, $draft] = makeDraft([
        'sections' => ['hero' => ['headline' => 'Original', 'subheadline' => 'sub']],
        'enabled_sections' => ['hero'],
    ]);

    livewire(EditLandingPageDraftPage::class, [
        'record' => $funnel->id,
        'draft' => $draft->id,
    ])
        ->set('data.content.hero.headline', 'Updated headline')
        ->call('save');

    expect($draft->fresh()->sections['hero']['headline'])->toBe('Updated headline');
});
