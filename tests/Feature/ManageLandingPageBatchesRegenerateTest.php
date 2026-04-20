<?php

namespace Tests\Feature;

use App\Enums\LandingPageDraftStatus;
use App\Filament\Resources\Funnels\Pages\ManageLandingPageBatches;
use App\Jobs\RegenerateSectionJob;
use App\Models\Funnel;
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
        $funnel = Funnel::factory()->create(['summit_id' => $summit->id]);

        $batch = LandingPageBatch::factory()->create([
            'summit_id' => $summit->id,
            'funnel_id' => $funnel->id,
            'status' => 'running',
        ]);

        $sectionId = '550e8400-e29b-41d4-a716-446655440000';

        $draft = LandingPageDraft::factory()->create([
            'batch_id' => $batch->id,
            'status' => 'ready',
            'sections' => [
                ['id' => $sectionId, 'type' => 'hero', 'status' => 'ready'],
            ],
        ]);

        $page = new ManageLandingPageBatches;
        $page->record = $funnel;

        $page->regenerateSection($draft->id, $sectionId, null);

        Queue::assertPushed(RegenerateSectionJob::class, function ($job) use ($draft, $sectionId) {
            return $job->draftId === $draft->id
                && $job->sectionId === $sectionId
                && $job->note === null;
        });

        $this->assertSame('regenerating', $draft->fresh()->sections[0]['status']);
    }

    public function test_regenerate_section_does_nothing_if_draft_status_is_not_ready(): void
    {
        Queue::fake();

        $summit = Summit::factory()->create();
        $funnel = Funnel::factory()->create(['summit_id' => $summit->id]);

        $batch = LandingPageBatch::factory()->create([
            'summit_id' => $summit->id,
            'funnel_id' => $funnel->id,
            'status' => 'running',
        ]);

        $sectionId = '550e8400-e29b-41d4-a716-446655440000';

        $draft = LandingPageDraft::factory()->create([
            'batch_id' => $batch->id,
            'status' => 'generating',
            'sections' => [
                ['id' => $sectionId, 'type' => 'hero', 'status' => 'ready'],
            ],
        ]);

        $page = new ManageLandingPageBatches;
        $page->record = $funnel;

        $page->regenerateSection($draft->id, $sectionId, null);

        Queue::assertNotPushed(RegenerateSectionJob::class);

        // Section status must remain untouched
        $this->assertSame('ready', $draft->fresh()->sections[0]['status']);
    }

    public function test_regenerate_section_does_nothing_for_approved_draft(): void
    {
        Queue::fake();

        $summit = Summit::factory()->create();
        $funnel = Funnel::factory()->create(['summit_id' => $summit->id]);

        $batch = LandingPageBatch::factory()->create([
            'summit_id' => $summit->id,
            'funnel_id' => $funnel->id,
            'status' => 'completed',
        ]);

        $sectionId = '550e8400-e29b-41d4-a716-446655440000';

        $draft = LandingPageDraft::factory()->create([
            'batch_id' => $batch->id,
            'status' => LandingPageDraftStatus::Shortlisted,
            'sections' => [
                ['id' => $sectionId, 'type' => 'hero', 'status' => 'ready'],
            ],
        ]);

        $page = new ManageLandingPageBatches;
        $page->record = $funnel;

        $page->regenerateSection($draft->id, $sectionId, null);

        Queue::assertNotPushed(RegenerateSectionJob::class);
    }

    public function test_regenerate_section_ignores_invalid_section_id(): void
    {
        Queue::fake();

        $summit = Summit::factory()->create();
        $funnel = Funnel::factory()->create(['summit_id' => $summit->id]);

        $batch = LandingPageBatch::factory()->create([
            'summit_id' => $summit->id,
            'funnel_id' => $funnel->id,
            'status' => 'running',
        ]);

        $draft = LandingPageDraft::factory()->create([
            'batch_id' => $batch->id,
            'status' => 'ready',
            'sections' => [
                ['id' => '550e8400-e29b-41d4-a716-446655440000', 'type' => 'hero', 'status' => 'ready'],
            ],
        ]);

        $page = new ManageLandingPageBatches;
        $page->record = $funnel;

        $page->regenerateSection($draft->id, 'not-a-uuid', null);

        Queue::assertNotPushed(RegenerateSectionJob::class);
    }
}
