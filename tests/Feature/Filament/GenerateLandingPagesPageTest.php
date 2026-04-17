<?php

use App\Filament\Resources\Funnels\Pages\GenerateLandingPagesPage;
use App\Jobs\GenerateLandingPageBatchJob;
use App\Models\Funnel;
use App\Models\LandingPageBatch;
use App\Models\Summit;
use App\Models\User;
use Illuminate\Support\Facades\Queue;

use function Pest\Livewire\livewire;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

it('renders the generate form', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();

    livewire(GenerateLandingPagesPage::class, ['record' => $funnel->id])
        ->assertSuccessful()
        ->assertFormFieldExists('version_count')
        ->assertFormFieldExists('template_pool')
        ->assertFormFieldExists('notes')
        ->assertFormFieldExists('style_reference_url');
});

it('creates a batch and dispatches the job on submit', function () {
    Queue::fake();
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();

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
