<?php

namespace App\Jobs;

use App\Models\LandingPageDraft;
use App\Services\FunnelGenerator\Phases\BlockDesignPhase;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class RegenerateSectionJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public readonly string $draftId,
        public readonly string $sectionId,
        public readonly ?string $note,
    ) {}

    public function handle(BlockDesignPhase $phase): void
    {
        $draft = LandingPageDraft::findOrFail($this->draftId);
        $sections = $draft->sections ?? [];
        $idx = collect($sections)->search(fn ($s) => $s['id'] === $this->sectionId);
        if ($idx === false) return;

        $current = $sections[$idx];
        $sections[$idx] = array_merge($current, ['status' => 'regenerating']);
        $draft->update(['sections' => $sections]);

        $replacement = $phase->regenerate(
            currentSection: $current,
            summitContext: $draft->buildSummitContext(),
            note: $this->note,
        );
        $replacement['id'] = $current['id'];
        $sections[$idx] = $replacement;
        $draft->update(['sections' => $sections]);
    }
}
