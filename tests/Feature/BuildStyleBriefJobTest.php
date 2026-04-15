<?php

namespace Tests\Feature;

use App\Jobs\BuildStyleBriefJob;
use App\Models\Summit;
use App\Services\StyleBrief\StyleBriefClient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class BuildStyleBriefJobTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        config()->set('services.next_app.url', 'http://next.test');
        config()->set('services.next_app.token', 'test-token');
    }

    public function test_happy_path_saves_brief_and_screenshot(): void
    {
        Http::fake([
            'http://next.test/api/style-briefs/build' => Http::response([
                'status' => 'ready',
                'brief' => ['palette' => ['primary' => '#abcdef']],
                'reference_png_base64' => base64_encode('fakepng'),
                'reference_png_mime' => 'image/png',
            ], 200),
        ]);

        $summit = Summit::factory()->create(['style_reference_url' => 'https://example.com']);
        (new BuildStyleBriefJob($summit->id))->handle(app(StyleBriefClient::class));

        $summit->refresh();
        $this->assertSame('ready', $summit->style_brief_status);
        $this->assertSame('#abcdef', $summit->style_brief['palette']['primary']);
        Storage::disk('public')->assertExists("style-briefs/{$summit->id}/reference.png");
    }

    public function test_failed_screenshot_marks_failed(): void
    {
        Http::fake([
            'http://next.test/api/style-briefs/build' => Http::response([
                'status' => 'failed_screenshot',
                'error' => 'timeout',
            ], 200),
        ]);

        $summit = Summit::factory()->create(['style_reference_url' => 'https://bad']);
        (new BuildStyleBriefJob($summit->id))->handle(app(StyleBriefClient::class));
        $this->assertSame('failed', $summit->fresh()->style_brief_status);
    }

    public function test_missing_url_short_circuits_to_failed(): void
    {
        $summit = Summit::factory()->create(['style_reference_url' => null]);
        (new BuildStyleBriefJob($summit->id))->handle(app(StyleBriefClient::class));
        $this->assertSame('failed', $summit->fresh()->style_brief_status);
    }
}
