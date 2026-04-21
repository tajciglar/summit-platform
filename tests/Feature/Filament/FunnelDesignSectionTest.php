<?php

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

it('shows the skin picker on View Funnel', function () {
    $funnel = Funnel::factory()->for(Summit::factory())->create();

    livewire(ViewFunnel::class, ['record' => $funnel->id])
        ->assertSee('Skin')
        ->assertFormFieldExists('template_key');
});

it('shows the generate-all-steps action on View Funnel when a skin is picked', function () {
    $funnel = Funnel::factory()->for(Summit::factory())->create(['template_key' => 'ochre-ink']);

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
    $funnel = Funnel::factory()->for($summit)->create(['template_key' => 'ochre-ink']);
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
    $funnel = Funnel::factory()->for($summit)->create(['template_key' => 'ochre-ink']);
    FunnelStep::factory()->create(['funnel_id' => $funnel->id, 'step_type' => 'checkout', 'slug' => 'checkout']);

    livewire(ViewFunnel::class, ['record' => $funnel->id])
        ->callAction('generate_all_steps')
        ->assertNotified('No generable steps');

    expect(LandingPageBatch::count())->toBe(0);
});
