<?php

declare(strict_types=1);

use App\Enums\SummitAudience;
use App\Models\Funnel;
use App\Models\LandingPageBatch;
use App\Models\LandingPageDraft;
use App\Models\Summit;

it('casts Summit.audience to SummitAudience enum', function () {
    $summit = Summit::factory()->create(['audience' => SummitAudience::Herbal]);
    expect($summit->fresh()->audience)->toBe(SummitAudience::Herbal);
});

it('allows null Summit.audience', function () {
    $summit = Summit::factory()->create(['audience' => null]);
    expect($summit->fresh()->audience)->toBeNull();
});

it('casts LandingPageBatch.audience_override to SummitAudience enum', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $batch = LandingPageBatch::factory()->create([
        'summit_id' => $summit->id,
        'funnel_id' => $funnel->id,
        'audience_override' => SummitAudience::Ai,
    ]);
    expect($batch->fresh()->audience_override)->toBe(SummitAudience::Ai);
});

it('casts LandingPageDraft.palette to array', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $batch = LandingPageBatch::factory()->create(['summit_id' => $summit->id, 'funnel_id' => $funnel->id]);
    $draft = LandingPageDraft::factory()->create([
        'batch_id' => $batch->id,
        'palette' => ['primary' => '#000000', 'ink' => '#111111'],
    ]);
    $fresh = $draft->fresh();
    expect($fresh->palette)->toBeArray();
    expect($fresh->palette['primary'])->toBe('#000000');
});
