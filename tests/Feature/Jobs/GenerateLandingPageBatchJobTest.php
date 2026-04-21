<?php

use App\Jobs\GenerateLandingPageBatchJob;
use App\Jobs\GenerateLandingPageVersionJob;
use App\Models\Funnel;
use App\Models\LandingPageBatch;
use App\Models\Summit;
use App\Services\Templates\TemplateSelector;
use Illuminate\Support\Facades\Queue;

it('selects N templates and dispatches a version job per template', function () {
    Queue::fake([GenerateLandingPageVersionJob::class]);

    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id,
        'funnel_id' => $funnel->id,
        'version_count' => 3,
        'status' => 'queued',
        'template_pool' => ['ochre-ink', 'lime-ink'],
    ]);

    $this->mock(TemplateSelector::class, function ($m) {
        $m->shouldReceive('pick')
            ->once()
            ->with(['ochre-ink', 'lime-ink'], 3)
            ->andReturn(['ochre-ink', 'lime-ink']);
    });

    GenerateLandingPageBatchJob::dispatchSync($batch->id);

    Queue::assertPushed(GenerateLandingPageVersionJob::class, 2);
    expect($batch->fresh()->status)->toBe('running');
});

it('marks the batch as failed when selector returns no keys', function () {
    Queue::fake([GenerateLandingPageVersionJob::class]);
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id,
        'funnel_id' => $funnel->id,
        'version_count' => 3,
        'status' => 'queued',
    ]);

    $this->mock(TemplateSelector::class, function ($m) {
        $m->shouldReceive('pick')->andReturn([]);
    });

    GenerateLandingPageBatchJob::dispatchSync($batch->id);
    expect($batch->fresh()->status)->toBe('failed');
});
