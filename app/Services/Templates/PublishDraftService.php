<?php

namespace App\Services\Templates;

use App\Models\{FunnelStep, FunnelStepRevision, LandingPageDraft, User};
use Illuminate\Support\Facades\DB;

class PublishDraftService
{
    public function publish(LandingPageDraft $draft, User $user): void
    {
        DB::transaction(function () use ($draft, $user) {
            $batch = $draft->batch;
            $step = FunnelStep::where('funnel_id', $batch->funnel_id)
                ->where('step_type', 'optin')
                ->firstOrFail();

            // Snapshot previous content if non-empty
            if (!empty($step->page_content)) {
                FunnelStepRevision::create([
                    'funnel_step_id' => $step->id,
                    'page_content_snapshot' => $step->page_content,
                    'published_at' => now(),
                    'published_by' => $user->id,
                ]);
            }

            // Write new content
            $step->update([
                'page_content' => [
                    'template_key' => $draft->template_key,
                    'content' => $draft->sections,
                ],
            ]);

            // Archive previously-published drafts for this funnel
            LandingPageDraft::query()
                ->whereHas('batch', fn ($q) => $q->where('funnel_id', $batch->funnel_id))
                ->where('status', 'published')
                ->where('id', '!=', $draft->id)
                ->update(['status' => 'archived']);

            $draft->update(['status' => 'published']);
        });
    }
}
