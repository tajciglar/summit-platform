<?php

namespace Tests\Unit;

use App\Services\FunnelGenerator\Phases\BlockDesignPhase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class BlockDesignPhaseTest extends TestCase
{
    public function test_fans_out_parallel_requests_and_collects_sections(): void
    {
        config(['services.next_app.url' => 'http://next.test', 'services.next_app.token' => 'tok']);
        Http::fake([
            'http://next.test/api/sections/generate' => Http::response([
                'id' => 'a', 'type' => 'hero', 'jsx' => 'x', 'fields' => [],
                'status' => 'ready', 'regeneration_note' => null, 'source_section_id' => null,
            ]),
        ]);

        $phase = new BlockDesignPhase();
        $sections = $phase->run(
            sectionBriefs: [
                ['type' => 'hero', 'purpose' => 'p1', 'position' => 1, 'total' => 2],
                ['type' => 'faq',  'purpose' => 'p2', 'position' => 2, 'total' => 2],
            ],
            summitContext: ['name' => 'X', 'date' => '', 'brandColors' => [], 'mode' => 'light', 'speakers' => [], 'toneBrief' => '', 'product' => null],
        );

        $this->assertCount(2, $sections);
        $this->assertSame('ready', $sections[0]['status']);
    }
}
