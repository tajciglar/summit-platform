<?php

namespace Tests\Feature;

use App\Jobs\RegenerateSectionJob;
use App\Models\LandingPageDraft;
use App\Services\FunnelGenerator\Phases\BlockDesignPhase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class RegenerateSectionJobTest extends TestCase
{
    use RefreshDatabase;

    public function test_regenerates_single_section_preserving_id(): void
    {
        $draft = LandingPageDraft::factory()->create([
            'sections' => [
                ['id' => 'keep-me', 'type' => 'faq', 'jsx' => 'old', 'fields' => [], 'status' => 'ready', 'regeneration_note' => null, 'source_section_id' => null],
                ['id' => 'other',   'type' => 'hero','jsx' => 'h',   'fields' => [], 'status' => 'ready', 'regeneration_note' => null, 'source_section_id' => null],
            ],
        ]);

        $design = Mockery::mock(BlockDesignPhase::class);
        $design->shouldReceive('regenerate')->once()->andReturn([
            'id' => 'keep-me', 'type' => 'faq', 'jsx' => 'new', 'fields' => [],
            'status' => 'ready', 'regeneration_note' => 'shorter', 'source_section_id' => null,
        ]);
        $this->app->instance(BlockDesignPhase::class, $design);

        (new RegenerateSectionJob($draft->id, 'keep-me', 'shorter'))->handle($design);

        $fresh = $draft->fresh();
        $this->assertSame('new', $fresh->sections[0]['jsx']);
        $this->assertSame('h', $fresh->sections[1]['jsx']);
        $this->assertSame('keep-me', $fresh->sections[0]['id']);
    }
}
