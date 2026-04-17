<?php

use App\Enums\SummitAudience;
use App\Filament\Resources\Funnels\Pages\GenerateLandingPagesPage;
use App\Jobs\GenerateLandingPageBatchJob;
use App\Models\Domain;
use App\Models\Funnel;
use App\Models\FunnelStep;
use App\Models\LandingPageBatch;
use App\Models\Summit;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Queue;

use function Pest\Livewire\livewire;

beforeEach(function () {
    // Bypass Filament Shield permission checks for tests.
    Gate::before(fn () => true);
    $this->actingAs(User::factory()->admin()->create());

    // Filament multi-tenant resources require an active tenant for URL generation.
    $tenant = Domain::create([
        'name' => 'Test Domain',
        'hostname' => 'test.localhost',
        'slug' => 'test-domain',
        'is_active' => true,
    ]);
    Filament::setTenant($tenant);
});

it('renders the generate form', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();

    livewire(GenerateLandingPagesPage::class, ['record' => $funnel->id])
        ->assertSuccessful()
        ->assertFormFieldExists('version_count')
        ->assertFormFieldExists('template_pool')
        ->assertFormFieldExists('audience_override')
        ->assertFormFieldExists('notes')
        ->assertFormFieldExists('style_reference_url');
});

it('creates a batch and dispatches the job on submit', function () {
    Queue::fake();
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    FunnelStep::factory()->for($funnel)->create([
        'step_type' => 'optin',
        'page_content' => [],
    ]);

    livewire(GenerateLandingPagesPage::class, ['record' => $funnel->id])
        ->fillForm([
            'version_count' => 2,
            'template_pool' => ['opus-v1', 'opus-v2'],
            'notes' => 'Urgent, mention free bonuses',
            'style_reference_url' => 'https://parenting-summits.com',
        ])
        ->call('submit')
        ->assertHasNoFormErrors();

    Queue::assertPushed(GenerateLandingPageBatchJob::class);
    expect(LandingPageBatch::count())->toBe(1);

    $batch = LandingPageBatch::first();
    expect($batch->summit_id)->toBe($summit->id);
    expect($batch->funnel_id)->toBe($funnel->id);
    expect((int) $batch->version_count)->toBe(2);
    expect($batch->template_pool)->toBe(['opus-v1', 'opus-v2']);
    expect($batch->notes)->toBe('Urgent, mention free bonuses');
    expect($batch->style_reference_url)->toBe('https://parenting-summits.com');
    expect($batch->status)->toBe('queued');
});

it('blocks submit when funnel has no optin step', function () {
    Queue::fake();
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    // Note: no FunnelStep with step_type=optin

    livewire(GenerateLandingPagesPage::class, ['record' => $funnel->id])
        ->fillForm([
            'version_count' => 1,
            'template_pool' => ['opus-v1'],
            'notes' => null,
            'style_reference_url' => null,
        ])
        ->call('submit');

    Queue::assertNothingPushed();
    expect(LandingPageBatch::count())->toBe(0);
});

it('persists audience_override to the batch', function () {
    Queue::fake();
    $summit = Summit::factory()->create(['audience' => SummitAudience::Herbal]);
    $funnel = Funnel::factory()->for($summit)->create();
    FunnelStep::factory()->for($funnel)->create([
        'step_type' => 'optin',
        'page_content' => [],
    ]);

    livewire(GenerateLandingPagesPage::class, ['record' => $funnel->id])
        ->fillForm([
            'version_count' => 1,
            'template_pool' => ['opus-v1'],
            'audience_override' => SummitAudience::Menopause->value,
            'notes' => null,
            'style_reference_url' => null,
        ])
        ->call('submit')
        ->assertHasNoFormErrors();

    Queue::assertPushed(GenerateLandingPageBatchJob::class);

    $batch = LandingPageBatch::where('funnel_id', $funnel->id)->latest()->first();
    expect($batch)->not->toBeNull();
    expect($batch->audience_override)->toBe(SummitAudience::Menopause);
});

it('persists null audience_override when not selected (falls back to summit default)', function () {
    Queue::fake();
    $summit = Summit::factory()->create(['audience' => SummitAudience::AdhdWomen]);
    $funnel = Funnel::factory()->for($summit)->create();
    FunnelStep::factory()->for($funnel)->create([
        'step_type' => 'optin',
        'page_content' => [],
    ]);

    livewire(GenerateLandingPagesPage::class, ['record' => $funnel->id])
        ->fillForm([
            'version_count' => 1,
            'template_pool' => ['opus-v1'],
            'audience_override' => null,
            'notes' => null,
            'style_reference_url' => null,
        ])
        ->call('submit')
        ->assertHasNoFormErrors();

    $batch = LandingPageBatch::where('funnel_id', $funnel->id)->latest()->first();
    expect($batch)->not->toBeNull();
    expect($batch->audience_override)->toBeNull();
});
