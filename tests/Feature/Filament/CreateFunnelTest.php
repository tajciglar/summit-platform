<?php

use App\Filament\Resources\Funnels\Pages\CreateFunnel;
use App\Jobs\GenerateLandingPageBatchJob;
use App\Models\Domain;
use App\Models\LandingPageBatch;
use App\Models\Summit;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Queue;

use function Pest\Livewire\livewire;

beforeEach(function () {
    Gate::before(fn () => true);
    $this->actingAs(User::factory()->admin()->create());

    $this->tenant = Domain::create([
        'name' => 'Test Domain',
        'hostname' => 'create-funnel-test.localhost',
        'slug' => 'create-funnel-test',
        'is_active' => true,
    ]);
    Filament::setTenant($this->tenant);

    $this->summit = Summit::factory()->create();
    $this->summit->domains()->attach($this->tenant);
});

it('seeds steps with empty page_content and dispatches no AI jobs', function () {
    Queue::fake();

    livewire(CreateFunnel::class)
        ->fillForm([
            'summit_id' => $this->summit->id,
            'name' => 'Test Funnel',
            'slug' => 'tf',
            'template_key' => 'ochre-ink',
            'section_config.optin' => ['masthead', 'hero', 'footer'],
            'section_config.sales_page' => ['masthead', 'hero', 'closing-cta', 'footer'],
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    Queue::assertNotPushed(GenerateLandingPageBatchJob::class);
    expect(LandingPageBatch::count())->toBe(0);

    $funnel = $this->summit->funnels()->where('slug', 'tf')->firstOrFail();
    $steps = $funnel->steps()->orderBy('sort_order')->get();

    expect($steps)->toHaveCount(2);
    expect($steps->pluck('step_type')->all())->toBe(['optin', 'sales_page']);

    $optin = $steps->firstWhere('step_type', 'optin');
    expect($optin->page_content['template_key'])->toBe('ochre-ink');
    expect($optin->page_content['enabled_sections'])->toEqualCanonicalizing(['masthead', 'hero', 'footer']);

    // Content keys come from the whole-template jsonSchema (camelCase),
    // which is what Next's Zod validates. Every required top-level
    // property must be present even for sections not in enabled_sections,
    // otherwise validation fails and preview errors.
    expect(array_keys($optin->page_content['content']))->toContain(
        'masthead', 'hero', 'featuredIn', 'socialProof', 'whatIsThis',
        'speakersByDay', 'footer', 'closing',
    );
    expect($optin->page_content['content']['masthead'])->toHaveKeys(['volume', 'eyebrow']);
    expect($optin->page_content['content']['masthead']['volume'])->toBeString()->not->toBeEmpty();
    expect($optin->page_content['content']['footer'])->toHaveKeys(['tagline', 'volume', 'copyright']);
});

it('creates no steps when no skin is picked', function () {
    // Section CheckboxLists are hidden until a skin is chosen, so a
    // skin-less funnel ends up with an empty section_config and no
    // auto-generated steps — the operator adds steps later by hand.
    Queue::fake();

    livewire(CreateFunnel::class)
        ->fillForm([
            'summit_id' => $this->summit->id,
            'name' => 'No Skin Funnel',
            'slug' => 'ns',
        ])
        ->call('create')
        ->assertHasNoFormErrors();

    $funnel = $this->summit->funnels()->where('slug', 'ns')->firstOrFail();

    expect($funnel->template_key)->toBeNull();
    expect($funnel->steps()->count())->toBe(0);
    Queue::assertNotPushed(GenerateLandingPageBatchJob::class);
});
