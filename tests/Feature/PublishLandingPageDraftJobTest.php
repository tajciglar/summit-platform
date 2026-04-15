<?php

namespace Tests\Feature;

use App\Jobs\PublishLandingPageDraftJob;
use App\Models\LandingPageDraft;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class PublishLandingPageDraftJobTest extends TestCase
{
    use RefreshDatabase;

    public function test_stores_published_html_on_success(): void
    {
        config(['services.next_app.url' => 'http://next.test', 'services.next_app.token' => 'tok']);
        $draft = LandingPageDraft::factory()->create([
            'sections' => [['id' => 'a', 'type' => 'h', 'jsx' => 'x', 'fields' => [], 'status' => 'ready', 'regeneration_note' => null, 'source_section_id' => null]],
        ]);
        Http::fake([
            "http://next.test/api/drafts/{$draft->id}/publish" => Http::response([
                'draftId' => $draft->id, 'html' => '<html>ok</html>', 'manifest' => ['accordion' => 1],
            ]),
        ]);

        (new PublishLandingPageDraftJob($draft->id))->handle();

        $fresh = $draft->fresh();
        $this->assertSame('<html>ok</html>', $fresh->published_html);
        $this->assertSame(['accordion' => 1], $fresh->published_hydration_manifest);
        $this->assertSame('published', $fresh->status);
    }

    public function test_blocks_publish_if_any_section_failed(): void
    {
        $draft = LandingPageDraft::factory()->create([
            'sections' => [['id' => 'a', 'type' => 'h', 'jsx' => '', 'fields' => [], 'status' => 'failed', 'regeneration_note' => null, 'source_section_id' => null]],
        ]);
        $this->expectException(\RuntimeException::class);
        (new PublishLandingPageDraftJob($draft->id))->handle();
    }
}
