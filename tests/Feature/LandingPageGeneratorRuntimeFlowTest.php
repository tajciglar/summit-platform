<?php

namespace Tests\Feature;

use App\Jobs\GenerateLandingPageVersionJob;
use App\Models\LandingPageDraft;
use App\Services\FunnelGenerator\Phases\BlockDesignPhase;
use App\Services\LandingPageGenerator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class LandingPageGeneratorRuntimeFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_flag_on_stores_sections_on_draft(): void
    {
        config(['features.runtime_gemini_gen' => true]);

        $sections = [[
            'id' => 'x', 'type' => 'hero', 'jsx' => 'j', 'fields' => [],
            'status' => 'ready', 'regeneration_note' => null, 'source_section_id' => null,
        ]];

        $generator = Mockery::mock(LandingPageGenerator::class);
        $generator->shouldReceive('generateSections')->once()->andReturn($sections);
        $this->app->instance(LandingPageGenerator::class, $generator);

        $draft = LandingPageDraft::factory()->create(['status' => 'pending']);
        (new GenerateLandingPageVersionJob($draft))->handle($generator);

        $draft->refresh();
        $this->assertSame('ready', $draft->status);
        $this->assertEquals($sections, $draft->sections);
    }

    public function test_flag_off_falls_through_to_existing_blocks_flow(): void
    {
        config(['features.runtime_gemini_gen' => false]);

        $blocks = [['id' => 'b', 'type' => 'HeroWithCountdown', 'props' => []]];
        $generator = Mockery::mock(LandingPageGenerator::class);
        $generator->shouldReceive('generate')->once()->andReturn($blocks);
        $this->app->instance(LandingPageGenerator::class, $generator);

        $draft = LandingPageDraft::factory()->create(['status' => 'pending']);
        (new GenerateLandingPageVersionJob($draft))->handle($generator);

        $draft->refresh();
        $this->assertSame('ready', $draft->status);
        $this->assertEquals($blocks, $draft->blocks);
    }
}
