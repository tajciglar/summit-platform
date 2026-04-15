<?php

namespace Tests\Feature;

use App\Filament\Resources\Funnels\Pages\ManageLandingPageBatches;
use App\Jobs\PublishLandingPageDraftJob;
use App\Jobs\RegenerateSectionJob;
use App\Models\Funnel;
use App\Models\FunnelStep;
use App\Models\LandingPageBatch;
use App\Models\LandingPageDraft;
use App\Models\Summit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Str;
use Tests\TestCase;

class ManageLandingPageBatchesEditorTest extends TestCase
{
    use RefreshDatabase;

    private function makePage(Funnel $funnel): ManageLandingPageBatches
    {
        $page = new ManageLandingPageBatches();
        $page->record = $funnel;
        return $page;
    }

    private function scaffold(array $overrides = []): array
    {
        $summit = Summit::factory()->create();
        $funnel = Funnel::factory()->create(['summit_id' => $summit->id]);
        FunnelStep::factory()->create([
            'funnel_id' => $funnel->id,
            'slug'      => 'optin',
            'content'   => [],
        ]);
        $batch = LandingPageBatch::factory()->create(array_merge([
            'summit_id' => $summit->id,
            'funnel_id' => $funnel->id,
            'status'    => 'running',
        ], $overrides['batch'] ?? []));

        return [$summit, $funnel, $batch];
    }

    // ======= publishDraft =======

    public function test_publish_draft_new_flow_when_all_sections_ready(): void
    {
        Queue::fake();
        config(['features.runtime_gemini_gen' => true]);

        [$summit, $funnel, $batch] = $this->scaffold();
        $draft = LandingPageDraft::factory()->create([
            'batch_id' => $batch->id,
            'status'   => 'ready',
            'sections' => [
                ['id' => (string) Str::uuid(), 'type' => 'hero', 'status' => 'ready'],
                ['id' => (string) Str::uuid(), 'type' => 'benefits_grid', 'status' => 'ready'],
            ],
        ]);

        $this->makePage($funnel)->publishDraft($draft->id);

        $this->assertSame('publishing', $draft->fresh()->status);
        $optinStep = $funnel->steps()->where('slug', 'optin')->first();
        $this->assertSame(['published_draft_id' => (string) $draft->id], $optinStep->content);
        $this->assertSame('completed', $batch->fresh()->status);
        Queue::assertPushed(PublishLandingPageDraftJob::class, function ($job) use ($draft) {
            return $job->draftId === (string) $draft->id;
        });
    }

    public function test_publish_draft_blocks_when_a_section_is_not_ready(): void
    {
        Queue::fake();
        config(['features.runtime_gemini_gen' => true]);

        [$summit, $funnel, $batch] = $this->scaffold();
        $draft = LandingPageDraft::factory()->create([
            'batch_id' => $batch->id,
            'status'   => 'ready',
            'sections' => [
                ['id' => (string) Str::uuid(), 'type' => 'hero', 'status' => 'ready'],
                ['id' => (string) Str::uuid(), 'type' => 'benefits_grid', 'status' => 'regenerating'],
            ],
        ]);

        $this->makePage($funnel)->publishDraft($draft->id);

        $this->assertSame('ready', $draft->fresh()->status);
        Queue::assertNotPushed(PublishLandingPageDraftJob::class);
    }

    public function test_publish_draft_blocks_when_no_sections(): void
    {
        Queue::fake();
        config(['features.runtime_gemini_gen' => true]);

        [$summit, $funnel, $batch] = $this->scaffold();
        $draft = LandingPageDraft::factory()->create([
            'batch_id' => $batch->id,
            'status'   => 'ready',
            'sections' => [],
            'blocks'   => ['foo' => 'bar'],
        ]);

        $this->makePage($funnel)->publishDraft($draft->id);

        $this->assertSame('ready', $draft->fresh()->status);
        Queue::assertNotPushed(PublishLandingPageDraftJob::class);
    }

    public function test_publish_draft_requires_ownership(): void
    {
        Queue::fake();
        config(['features.runtime_gemini_gen' => true]);

        [$summit, $funnel, $batch] = $this->scaffold();
        $otherFunnel = Funnel::factory()->create(['summit_id' => $summit->id]);

        $draft = LandingPageDraft::factory()->create([
            'batch_id' => $batch->id,
            'status'   => 'ready',
            'sections' => [
                ['id' => (string) Str::uuid(), 'type' => 'hero', 'status' => 'ready'],
            ],
        ]);

        $this->expectException(\Symfony\Component\HttpKernel\Exception\HttpException::class);
        $this->makePage($otherFunnel)->publishDraft($draft->id);
    }

    // ======= regenerateAllSections =======

    public function test_regenerate_all_sections_dispatches_for_each_section(): void
    {
        Queue::fake();

        [$summit, $funnel, $batch] = $this->scaffold();
        $id1 = (string) Str::uuid();
        $id2 = (string) Str::uuid();
        $id3 = (string) Str::uuid();

        $draft = LandingPageDraft::factory()->create([
            'batch_id' => $batch->id,
            'status'   => 'ready',
            'sections' => [
                ['id' => $id1, 'type' => 'hero', 'status' => 'ready'],
                ['id' => $id2, 'type' => 'benefits_grid', 'status' => 'ready'],
                ['id' => $id3, 'type' => 'speakers_grid', 'status' => 'failed'],
            ],
        ]);

        $this->makePage($funnel)->regenerateAllSections($draft->id);

        Queue::assertPushed(RegenerateSectionJob::class, 3);

        $sections = $draft->fresh()->sections;
        $this->assertSame('regenerating', $sections[0]['status']);
        $this->assertSame('regenerating', $sections[1]['status']);
        $this->assertSame('regenerating', $sections[2]['status']);
    }

    public function test_regenerate_all_sections_requires_ready_draft(): void
    {
        Queue::fake();

        [$summit, $funnel, $batch] = $this->scaffold();
        $draft = LandingPageDraft::factory()->create([
            'batch_id' => $batch->id,
            'status'   => 'generating',
            'sections' => [
                ['id' => (string) Str::uuid(), 'type' => 'hero', 'status' => 'ready'],
            ],
        ]);

        $this->makePage($funnel)->regenerateAllSections($draft->id);

        Queue::assertNotPushed(RegenerateSectionJob::class);
    }

    public function test_regenerate_all_sections_ownership_guard(): void
    {
        Queue::fake();

        [$summit, $funnel, $batch] = $this->scaffold();
        $otherFunnel = Funnel::factory()->create(['summit_id' => $summit->id]);
        $draft = LandingPageDraft::factory()->create([
            'batch_id' => $batch->id,
            'status'   => 'ready',
            'sections' => [
                ['id' => (string) Str::uuid(), 'type' => 'hero', 'status' => 'ready'],
            ],
        ]);

        $this->expectException(\Symfony\Component\HttpKernel\Exception\HttpException::class);
        $this->makePage($otherFunnel)->regenerateAllSections($draft->id);
    }

    // ======= updateSectionField =======

    public function test_update_section_field_saves_new_value(): void
    {
        [$summit, $funnel, $batch] = $this->scaffold();
        $sectionId = (string) Str::uuid();

        $draft = LandingPageDraft::factory()->create([
            'batch_id' => $batch->id,
            'status'   => 'ready',
            'sections' => [
                [
                    'id'     => $sectionId,
                    'type'   => 'hero',
                    'status' => 'ready',
                    'fields' => [
                        ['path' => 'props.headline', 'label' => 'Headline', 'type' => 'text', 'value' => 'Old'],
                        ['path' => 'props.subheadline', 'label' => 'Subheadline', 'type' => 'textarea', 'value' => 'Old sub'],
                    ],
                ],
            ],
        ]);

        $this->makePage($funnel)->updateSectionField($draft->id, $sectionId, 0, 'New headline');

        $sections = $draft->fresh()->sections;
        $this->assertSame('New headline', $sections[0]['fields'][0]['value']);
        $this->assertSame('Old sub', $sections[0]['fields'][1]['value']); // untouched
    }

    public function test_update_section_field_ownership_guard(): void
    {
        [$summit, $funnel, $batch] = $this->scaffold();
        $otherFunnel = Funnel::factory()->create(['summit_id' => $summit->id]);
        $sectionId = (string) Str::uuid();

        $draft = LandingPageDraft::factory()->create([
            'batch_id' => $batch->id,
            'status'   => 'ready',
            'sections' => [
                [
                    'id'     => $sectionId,
                    'type'   => 'hero',
                    'status' => 'ready',
                    'fields' => [
                        ['path' => 'props.headline', 'label' => 'Headline', 'type' => 'text', 'value' => 'Old'],
                    ],
                ],
            ],
        ]);

        $this->expectException(\Symfony\Component\HttpKernel\Exception\HttpException::class);
        $this->makePage($otherFunnel)->updateSectionField($draft->id, $sectionId, 0, 'x');
    }

    // ======= deleteSection =======

    public function test_delete_section_removes_section_and_preserves_order(): void
    {
        [$summit, $funnel, $batch] = $this->scaffold();
        $id1 = (string) Str::uuid();
        $id2 = (string) Str::uuid();
        $id3 = (string) Str::uuid();

        $draft = LandingPageDraft::factory()->create([
            'batch_id' => $batch->id,
            'status'   => 'ready',
            'sections' => [
                ['id' => $id1, 'type' => 'hero', 'status' => 'ready'],
                ['id' => $id2, 'type' => 'benefits_grid', 'status' => 'ready'],
                ['id' => $id3, 'type' => 'speakers_grid', 'status' => 'ready'],
            ],
        ]);

        $this->makePage($funnel)->deleteSection($draft->id, $id2);

        $sections = $draft->fresh()->sections;
        $this->assertCount(2, $sections);
        $this->assertSame($id1, $sections[0]['id']);
        $this->assertSame($id3, $sections[1]['id']);
    }

    public function test_delete_section_ownership_guard(): void
    {
        [$summit, $funnel, $batch] = $this->scaffold();
        $otherFunnel = Funnel::factory()->create(['summit_id' => $summit->id]);
        $sectionId = (string) Str::uuid();

        $draft = LandingPageDraft::factory()->create([
            'batch_id' => $batch->id,
            'status'   => 'ready',
            'sections' => [
                ['id' => $sectionId, 'type' => 'hero', 'status' => 'ready'],
            ],
        ]);

        $this->expectException(\Symfony\Component\HttpKernel\Exception\HttpException::class);
        $this->makePage($otherFunnel)->deleteSection($draft->id, $sectionId);
    }

    // ======= deleteDraft =======

    public function test_delete_draft_removes_draft(): void
    {
        [$summit, $funnel, $batch] = $this->scaffold();
        $draft1 = LandingPageDraft::factory()->create([
            'batch_id' => $batch->id,
            'version_number' => 1,
            'status'   => 'ready',
        ]);
        $draft2 = LandingPageDraft::factory()->create([
            'batch_id' => $batch->id,
            'version_number' => 2,
            'status'   => 'ready',
        ]);

        $this->makePage($funnel)->deleteDraft($draft1->id);

        $this->assertNull(LandingPageDraft::find($draft1->id));
        $this->assertNotNull(LandingPageDraft::find($draft2->id));
        $this->assertNotNull(LandingPageBatch::find($batch->id));
    }

    public function test_delete_draft_also_deletes_batch_when_last_draft(): void
    {
        [$summit, $funnel, $batch] = $this->scaffold();
        $draft = LandingPageDraft::factory()->create([
            'batch_id' => $batch->id,
            'status'   => 'ready',
        ]);

        $this->makePage($funnel)->deleteDraft($draft->id);

        $this->assertNull(LandingPageDraft::find($draft->id));
        $this->assertNull(LandingPageBatch::find($batch->id));
    }

    public function test_delete_draft_blocked_while_generating(): void
    {
        [$summit, $funnel, $batch] = $this->scaffold();
        $draft = LandingPageDraft::factory()->create([
            'batch_id' => $batch->id,
            'status'   => 'generating',
        ]);

        $this->makePage($funnel)->deleteDraft($draft->id);

        $this->assertNotNull(LandingPageDraft::find($draft->id));
    }

    public function test_delete_draft_blocked_while_publishing(): void
    {
        [$summit, $funnel, $batch] = $this->scaffold();
        $draft = LandingPageDraft::factory()->create([
            'batch_id' => $batch->id,
            'status'   => 'publishing',
        ]);

        $this->makePage($funnel)->deleteDraft($draft->id);

        $this->assertNotNull(LandingPageDraft::find($draft->id));
    }

    public function test_delete_draft_ownership_guard(): void
    {
        [$summit, $funnel, $batch] = $this->scaffold();
        $otherFunnel = Funnel::factory()->create(['summit_id' => $summit->id]);
        $draft = LandingPageDraft::factory()->create([
            'batch_id' => $batch->id,
            'status'   => 'ready',
        ]);

        $this->expectException(\Symfony\Component\HttpKernel\Exception\HttpException::class);
        $this->makePage($otherFunnel)->deleteDraft($draft->id);
    }
}
