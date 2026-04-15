<?php

namespace App\Jobs;

use App\Models\LandingPageDraft;
use App\Services\FunnelGenerator\Phases\BlockDesignPhase;
use App\Services\StyleBrief\StyleBriefResolver;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

class RegenerateSectionJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    // Enough for Stage 1 + Stage 2 with one retry each.
    public int $timeout = 360;

    public function __construct(
        public readonly string $draftId,
        public readonly string $sectionId,
        public readonly ?string $note,
    ) {}

    public function handle(BlockDesignPhase $phase, StyleBriefResolver $resolver): void
    {
        $draft = LandingPageDraft::with('batch.funnel.summit')->findOrFail($this->draftId);
        $sections = $draft->sections ?? [];
        $idx = collect($sections)->search(fn ($s) => ($s['id'] ?? null) === $this->sectionId);
        if ($idx === false) return;

        $current = $sections[$idx];
        $sections[$idx] = array_merge($current, ['status' => 'regenerating']);
        $draft->update(['sections' => $sections]);

        $summit = $draft->batch->summit;
        $funnel = $draft->batch->funnel;
        $context = $summit->buildSummitContext();
        $styleBrief = $resolver->resolveForFunnel($funnel);

        $referencePath = "style-briefs/{$summit->id}/reference.png";
        if (! Storage::disk('public')->exists($referencePath)) {
            $referencePath = null;
        }

        $replacement = $phase->regenerate(
            currentSection: $current,
            summitContext: $context,
            styleBrief: $styleBrief,
            referencePath: $referencePath,
            draftId: (string) $draft->id,
            note: $this->note,
        );
        $replacement['id'] = $current['id'];

        // Preserve operator-edited field values by matching on path. The AST
        // from a fresh regen may reshuffle fields but most paths are stable
        // (e.g. props.headline). If the path still exists in the new fields,
        // we keep the operator's last-saved value.
        $editedValues = collect($current['fields'] ?? [])
            ->mapWithKeys(fn ($f) => [($f['path'] ?? '') => $f['value'] ?? null])
            ->filter(fn ($v) => $v !== null && $v !== '')
            ->all();

        if (! empty($replacement['fields']) && is_array($replacement['fields'])) {
            $replacement['fields'] = array_map(function ($f) use ($editedValues) {
                if (isset($editedValues[$f['path'] ?? ''])) {
                    $f['value'] = $editedValues[$f['path']];
                }
                return $f;
            }, $replacement['fields']);
        }

        $sections[$idx] = $replacement;
        $draft->update(['sections' => $sections]);
    }
}
