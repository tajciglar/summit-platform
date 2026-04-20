<?php

use App\Enums\LandingPageDraftStatus;
use App\Models\Funnel;
use App\Models\LandingPageBatch;
use App\Models\LandingPageDraft;
use App\Models\Summit;
use Illuminate\Support\Facades\DB;

it('reads status as enum and writes from enum', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->create(['summit_id' => $summit->id]);
    $batch = LandingPageBatch::factory()->create([
        'summit_id' => $summit->id,
        'funnel_id' => $funnel->id,
    ]);

    $draft = LandingPageDraft::factory()->create([
        'batch_id' => $batch->id,
        'status' => LandingPageDraftStatus::Queued,
    ]);

    expect($draft->fresh()->status)->toBeInstanceOf(LandingPageDraftStatus::class)
        ->and($draft->fresh()->status)->toBe(LandingPageDraftStatus::Queued);

    $draft->update(['status' => LandingPageDraftStatus::Ready]);

    $rawValue = DB::table('landing_page_drafts')->where('id', $draft->id)->value('status');

    expect($rawValue)->toBe('ready');
});
