<?php

namespace Tests\Feature;

use App\Models\Funnel;
use App\Models\FunnelStep;
use App\Models\LandingPageBatch;
use App\Models\LandingPageDraft;
use App\Models\Summit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FunnelPublishedHtmlTest extends TestCase
{
    use RefreshDatabase;

    private function scaffoldFunnel(): array
    {
        $summit = Summit::factory()->create([
            'slug'   => 'test-summit',
            'status' => 'published',
        ]);

        $funnel = Funnel::factory()->create([
            'summit_id' => $summit->id,
            'slug'      => 'main',
            'is_active' => true,
        ]);

        $step = FunnelStep::factory()->create([
            'funnel_id'   => $funnel->id,
            'slug'        => 'optin',
            'step_type'   => 'optin',
            'is_published' => true,
            'content'     => [],
        ]);

        return [$summit, $funnel, $step];
    }

    private function makeDraft(string $status, string $html = ''): LandingPageDraft
    {
        return LandingPageDraft::factory()->create([
            'status'       => $status,
            'published_html' => $html,
            'sections'     => [['id' => 'a', 'type' => 'hero', 'status' => 'ready']],
        ]);
    }

    public function test_serves_published_html_when_flag_on_and_draft_published(): void
    {
        config(['features.runtime_gemini_gen' => true]);

        [, , $step] = $this->scaffoldFunnel();

        $draft = $this->makeDraft('published', '<html><body>GEMINI_PAGE</body></html>');

        $step->update(['content' => ['published_draft_id' => (string) $draft->id]]);

        $response = $this->get('/test-summit/main/optin');

        $response->assertOk();
        $response->assertSee('GEMINI_PAGE');
        // Should NOT be an Inertia response
        $this->assertNull($response->headers->get('X-Inertia'));
    }

    public function test_falls_through_to_inertia_when_flag_off(): void
    {
        config(['features.runtime_gemini_gen' => false]);

        [, , $step] = $this->scaffoldFunnel();

        $draft = $this->makeDraft('published', '<html><body>GEMINI_PAGE</body></html>');

        $step->update(['content' => ['published_draft_id' => (string) $draft->id]]);

        $response = $this->get('/test-summit/main/optin');

        $response->assertOk();
        // Inertia renders a full-page HTML shell with a JSON script tag containing the page data
        $response->assertDontSee('GEMINI_PAGE');
        $this->assertStringContainsString('data-page="app"', $response->getContent());
        $this->assertStringContainsString('Funnel\\/Optin', $response->getContent());
    }

    public function test_falls_through_to_inertia_when_draft_status_not_published(): void
    {
        config(['features.runtime_gemini_gen' => true]);

        [, , $step] = $this->scaffoldFunnel();

        $draft = $this->makeDraft('publishing', '<html><body>GEMINI_PAGE</body></html>');

        $step->update(['content' => ['published_draft_id' => (string) $draft->id]]);

        $response = $this->get('/test-summit/main/optin');

        $response->assertOk();
        $response->assertDontSee('GEMINI_PAGE');
        $this->assertStringContainsString('data-page="app"', $response->getContent());
        $this->assertStringContainsString('Funnel\\/Optin', $response->getContent());
    }

    public function test_falls_through_to_inertia_when_no_published_draft_id_in_content(): void
    {
        config(['features.runtime_gemini_gen' => true]);

        [, , $step] = $this->scaffoldFunnel();

        $step->update(['content' => ['some_other_key' => 'value']]);

        $response = $this->get('/test-summit/main/optin');

        $response->assertOk();
        $this->assertStringContainsString('data-page="app"', $response->getContent());
        $this->assertStringContainsString('Funnel\\/Optin', $response->getContent());
    }
}
