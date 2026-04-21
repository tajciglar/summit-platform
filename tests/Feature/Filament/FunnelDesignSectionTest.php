<?php

use App\Filament\Resources\Funnels\Pages\EditFunnel;
use App\Filament\Resources\Funnels\Pages\ViewFunnel;
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

it('shows the Design section with skin picker on Edit Funnel', function () {
    $funnel = Funnel::factory()->for(Summit::factory())->create();

    livewire(EditFunnel::class, ['record' => $funnel->id])
        ->assertSee('Design')
        ->assertSee('Skin')
        ->assertFormFieldExists('template_key');
});

it('persists template_key and section_config on save', function () {
    $summit = Summit::factory()->create();
    $summit->domains()->attach($this->tenant);
    $funnel = Funnel::factory()->for($summit)->create();

    livewire(EditFunnel::class, ['record' => $funnel->id])
        ->fillForm([
            'summit_id' => $funnel->summit_id,
            'name' => $funnel->name,
            'slug' => $funnel->slug,
            'template_key' => 'opus-v1',
            'section_config.optin' => ['masthead', 'hero', 'footer'],
            'section_config.sales_page' => ['masthead', 'value-prop', 'closing-cta', 'footer'],
            'section_config.thank_you' => ['masthead', 'closing-cta', 'footer'],
        ])
        ->call('save')
        ->assertHasNoFormErrors();

    $fresh = $funnel->fresh();
    expect($fresh->template_key)->toBe('opus-v1');
    expect($fresh->section_config['optin'])->toBe(['masthead', 'hero', 'footer']);
    expect($fresh->section_config['sales_page'])->toBe(['masthead', 'value-prop', 'closing-cta', 'footer']);
    expect($fresh->section_config['thank_you'])->toBe(['masthead', 'closing-cta', 'footer']);
});

it('shows the generate-all-steps action on View Funnel when a skin is picked', function () {
    $funnel = Funnel::factory()->for(Summit::factory())->create(['template_key' => 'opus-v1']);

    livewire(ViewFunnel::class, ['record' => $funnel->id])
        ->assertActionVisible('generate_all_steps');
});

it('hides the generate-all-steps action when no skin is picked', function () {
    $funnel = Funnel::factory()->for(Summit::factory())->create(['template_key' => null]);

    livewire(ViewFunnel::class, ['record' => $funnel->id])
        ->assertActionHidden('generate_all_steps');
});

it('dispatches one batch per generable step when generate-all-steps fires', function () {
    Queue::fake();

    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create(['template_key' => 'opus-v1']);
    FunnelStep::factory()->create(['funnel_id' => $funnel->id, 'step_type' => 'optin', 'slug' => 'optin']);
    FunnelStep::factory()->create(['funnel_id' => $funnel->id, 'step_type' => 'sales_page', 'slug' => 'sales']);
    FunnelStep::factory()->create(['funnel_id' => $funnel->id, 'step_type' => 'thank_you', 'slug' => 'thanks']);
    // checkout is not a generable step — should be skipped
    FunnelStep::factory()->create(['funnel_id' => $funnel->id, 'step_type' => 'checkout', 'slug' => 'checkout']);

    livewire(ViewFunnel::class, ['record' => $funnel->id])
        ->callAction('generate_all_steps');

    expect(LandingPageBatch::count())->toBe(3);

    $expectedStepIds = FunnelStep::whereIn('step_type', ['optin', 'sales_page', 'thank_you'])
        ->pluck('id')
        ->sort()
        ->values()
        ->all();
    expect(LandingPageBatch::pluck('funnel_step_id')->sort()->values()->all())
        ->toEqual($expectedStepIds);

    Queue::assertPushed(GenerateLandingPageBatchJob::class, 3);
});

it('warns when there are no generable steps', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create(['template_key' => 'opus-v1']);
    FunnelStep::factory()->create(['funnel_id' => $funnel->id, 'step_type' => 'checkout', 'slug' => 'checkout']);

    livewire(ViewFunnel::class, ['record' => $funnel->id])
        ->callAction('generate_all_steps')
        ->assertNotified('No generable steps');

    expect(LandingPageBatch::count())->toBe(0);
});
