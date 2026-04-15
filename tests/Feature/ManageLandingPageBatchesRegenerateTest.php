<?php

namespace Tests\Feature;

use App\Filament\Resources\Summits\Pages\ManageLandingPageBatches;
use App\Jobs\RegenerateSectionJob;
use App\Models\LandingPageBatch;
use App\Models\LandingPageDraft;
use App\Models\Summit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class ManageLandingPageBatchesRegenerateTest extends TestCase
{
    use RefreshDatabase;

    public function test_regenerate_section_dispatches_job_and_marks_section_as_regenerating(): void
    {
        Queue::fake();

        $summit = Summit::factory()->create();

        $batch = LandingPageBatch::factory()->create([
            'summit_id' => $summit->id,
            'status'    => 'running',
        ]);

        $draft = LandingPageDraft::factory()->create([
            'batch_id' => $batch->id,
            'status'   => 'ready',
            'sections' => [
                ['id' => 'abc', 'type' => 'hero', 'status' => 'ready'],
            ],
        ]);

        $page = new ManageLandingPageBatches();
        $page->record = $summit;

        $page->regenerateSection($draft->id, 'abc', null);

        Queue::assertPushed(RegenerateSectionJob::class, function ($job) use ($draft) {
            return $job->draftId === $draft->id
                && $job->sectionId === 'abc'
                && $job->note === null;
        });

        $this->assertSame('regenerating', $draft->fresh()->sections[0]['status']);
    }

    public function test_regenerate_section_does_nothing_if_draft_status_is_not_ready(): void
    {
        Queue::fake();

        $summit = Summit::factory()->create();

        $batch = LandingPageBatch::factory()->create([
            'summit_id' => $summit->id,
            'status'    => 'running',
        ]);

        $draft = LandingPageDraft::factory()->create([
            'batch_id' => $batch->id,
            'status'   => 'generating',
            'sections' => [
                ['id' => 'abc', 'type' => 'hero', 'status' => 'ready'],
            ],
        ]);

        $page = new ManageLandingPageBatches();
        $page->record = $summit;

        $page->regenerateSection($draft->id, 'abc', null);

        Queue::assertNotPushed(RegenerateSectionJob::class);

        // Section status must remain untouched
        $this->assertSame('ready', $draft->fresh()->sections[0]['status']);
    }
}
