<?php

namespace Tests\Feature;

use App\Models\LandingPageDraft;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LandingPageDraftSectionsSchemaTest extends TestCase
{
    use RefreshDatabase;

    public function test_draft_stores_sections_as_json_array(): void
    {
        $draft = LandingPageDraft::factory()->create([
            'sections' => [
                ['id' => 'a', 'type' => 'hero', 'jsx' => '...', 'fields' => [], 'status' => 'ready', 'regeneration_note' => null, 'source_section_id' => null],
            ],
        ]);
        $this->assertIsArray($draft->fresh()->sections);
        $this->assertSame('hero', $draft->fresh()->sections[0]['type']);
    }

    public function test_published_html_and_manifest_store(): void
    {
        $draft = LandingPageDraft::factory()->create([
            'published_html' => '<html>hi</html>',
            'published_hydration_manifest' => ['countdown' => 1],
        ]);
        $fresh = $draft->fresh();
        $this->assertSame('<html>hi</html>', $fresh->published_html);
        $this->assertSame(['countdown' => 1], $fresh->published_hydration_manifest);
    }
}
