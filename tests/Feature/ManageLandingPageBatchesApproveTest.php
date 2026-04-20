<?php

namespace Tests\Feature;

use App\Enums\LandingPageDraftStatus;
use App\Filament\Resources\Funnels\Pages\ManageLandingPageBatches;
use App\Jobs\PublishLandingPageDraftJob;
use App\Models\Funnel;
use App\Models\FunnelStep;
use App\Models\LandingPageBatch;
use App\Models\LandingPageDraft;
use App\Models\Summit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class ManageLandingPageBatchesApproveTest extends TestCase
{
    use RefreshDatabase;

    private function makePage(Funnel $funnel): ManageLandingPageBatches
    {
        $page = new ManageLandingPageBatches;
        $page->record = $funnel;

        return $page;
    }

    private function scaffoldFunnelWithOptinStep(Summit $summit): array
    {
        $funnel = Funnel::factory()->create(['summit_id' => $summit->id]);
        $optinStep = FunnelStep::factory()->create([
            'funnel_id' => $funnel->id,
            'slug' => 'optin',
            'content' => [],
        ]);

        return [$funnel, $optinStep];
    }

    public function test_approve_draft_uses_old_path_when_flag_off(): void
    {
        Queue::fake();
        config(['features.runtime_gemini_gen' => false]);

        $summit = Summit::factory()->create();
        [$funnel, $optinStep] = $this->scaffoldFunnelWithOptinStep($summit);

        $batch = LandingPageBatch::factory()->create([
            'summit_id' => $summit->id,
            'funnel_id' => $funnel->id,
            'status' => 'running',
        ]);

        $draft = LandingPageDraft::factory()->create([
            'batch_id' => $batch->id,
            'status' => 'ready',
            'blocks' => ['foo' => 'bar'],
        ]);

        $this->makePage($funnel)->approveDraft($draft->id);

        $this->assertEquals(['foo' => 'bar'], $optinStep->fresh()->content);
        $this->assertSame(LandingPageDraftStatus::Shortlisted, $draft->fresh()->status);
        Queue::assertNotPushed(PublishLandingPageDraftJob::class);
    }

    public function test_approve_draft_uses_new_path_when_flag_on_and_sections_present(): void
    {
        Queue::fake();
        config(['features.runtime_gemini_gen' => true]);

        $summit = Summit::factory()->create();
        [$funnel, $optinStep] = $this->scaffoldFunnelWithOptinStep($summit);

        $batch = LandingPageBatch::factory()->create([
            'summit_id' => $summit->id,
            'funnel_id' => $funnel->id,
            'status' => 'running',
        ]);

        $draft = LandingPageDraft::factory()->create([
            'batch_id' => $batch->id,
            'status' => 'ready',
            'sections' => [['id' => 'abc', 'type' => 'hero', 'status' => 'ready']],
        ]);

        $this->makePage($funnel)->approveDraft($draft->id);

        $this->assertEquals(['published_draft_id' => $draft->id], $optinStep->fresh()->content);
        $this->assertSame(LandingPageDraftStatus::Publishing, $draft->fresh()->status);
        Queue::assertPushed(PublishLandingPageDraftJob::class, function ($job) use ($draft) {
            return $job->draftId === $draft->id;
        });
    }

    public function test_approve_draft_uses_old_path_when_flag_on_but_no_sections(): void
    {
        Queue::fake();
        config(['features.runtime_gemini_gen' => true]);

        $summit = Summit::factory()->create();
        [$funnel, $optinStep] = $this->scaffoldFunnelWithOptinStep($summit);

        $batch = LandingPageBatch::factory()->create([
            'summit_id' => $summit->id,
            'funnel_id' => $funnel->id,
            'status' => 'running',
        ]);

        $draft = LandingPageDraft::factory()->create([
            'batch_id' => $batch->id,
            'status' => 'ready',
            'blocks' => ['foo' => 'bar'],
        ]);

        $this->makePage($funnel)->approveDraft($draft->id);

        $this->assertEquals(['foo' => 'bar'], $optinStep->fresh()->content);
        $this->assertSame(LandingPageDraftStatus::Shortlisted, $draft->fresh()->status);
        Queue::assertNotPushed(PublishLandingPageDraftJob::class);
    }
}
