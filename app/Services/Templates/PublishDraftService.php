<?php

namespace App\Services\Templates;

use App\Enums\LandingPageDraftStatus;
use App\Models\FunnelStep;
use App\Models\FunnelStepRevision;
use App\Models\LandingPageDraft;
use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;

class PublishDraftService
{
    public function publish(LandingPageDraft $draft, User $user): void
    {
        DB::transaction(function () use ($draft, $user) {
            $batch = $draft->batch;
            $step = $batch->funnelStep;

            if (! $step) {
                throw (new ModelNotFoundException)
                    ->setModel(FunnelStep::class, [$batch->funnel_step_id]);
            }

            if (! empty($step->page_content)) {
                FunnelStepRevision::create([
                    'funnel_step_id' => $step->id,
                    'page_content_snapshot' => $step->page_content,
                    'published_at' => now(),
                    'published_by' => $user->id,
                ]);
            }

            $step->update([
                'page_content' => [
                    'template_key' => $draft->template_key,
                    'content' => $draft->sections,
                    'enabled_sections' => $draft->enabled_sections,
                ],
            ]);

            // Archive any other published drafts on this same batch so each batch
            // has a single live version. Other batches (other steps) are untouched.
            LandingPageDraft::query()
                ->where('batch_id', $batch->id)
                ->where('status', LandingPageDraftStatus::Published)
                ->where('id', '!=', $draft->id)
                ->update(['status' => LandingPageDraftStatus::Archived]);

            $draft->update(['status' => LandingPageDraftStatus::Published]);
        });
    }
}
