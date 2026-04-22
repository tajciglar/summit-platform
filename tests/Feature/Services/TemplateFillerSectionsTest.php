<?php

use App\Models\Summit;
use App\Services\Anthropic\AnthropicClient;
use App\Services\Templates\TemplateFiller;
use App\Services\Templates\TemplateRegistry;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

/**
 * These tests exercise TemplateFiller against the REAL TemplateRegistry (loaded
 * from next-app/public/template-manifest.json) so we validate that the
 * section-aware schema is built correctly from the manifest — not just from a
 * hand-rolled mock. AnthropicClient is mocked to capture the system prompt.
 */
beforeEach(function () {
    $this->registry = app(TemplateRegistry::class);

    // Capture everything passed to complete() so tests can inspect the prompt.
    $this->captured = ['system' => null, 'user' => null];

    $this->client = Mockery::mock(AnthropicClient::class);
    $this->client->shouldReceive('complete')
        ->andReturnUsing(function (string $system, string $user) {
            $this->captured['system'] = $system;
            $this->captured['user'] = $user;

            // Return a shape that will fail schema validation — we don't care
            // about the response, only what was SENT. fill() will throw after
            // two attempts, which the test catches.
            return ['text' => '{}', 'tokens' => 1];
        });
});

/**
 * Extract the JSON schema block from the system prompt. The prompt embeds it
 * verbatim between the preamble and "Requirements:" list.
 */
function extractSchemaFromSystemPrompt(string $prompt): array
{
    $first = strpos($prompt, '{');
    $last = strrpos($prompt, "\n\nRequirements:");
    if ($first === false || $last === false) {
        throw new RuntimeException('could not locate schema in system prompt');
    }
    $json = trim(substr($prompt, $first, $last - $first));
    $decoded = json_decode($json, true);
    if (! is_array($decoded)) {
        throw new RuntimeException('schema block was not valid JSON: '.substr($json, 0, 200));
    }

    return $decoded;
}

it('builds a section-keyed schema for ochre-ink (section-aware template)', function () {
    $summit = Summit::factory()->create();
    $filler = new TemplateFiller($this->registry, $this->client);

    try {
        $filler->fill($summit, 'ochre-ink', collect(), null, null);
    } catch (RuntimeException) {
        // Expected — the mocked response fails validation. We only care about
        // the schema sent to Claude.
    }

    expect($this->captured['system'])->not->toBeNull();
    $schema = extractSchemaFromSystemPrompt($this->captured['system']);

    expect($schema['type'])->toBe('object');
    expect($schema['additionalProperties'])->toBeFalse();

    $props = $schema['properties'];

    // Expect every catalog-backed section (20 total: 17 optin + 3 shared sales keys)
    // as a top-level key.
    expect($props)->toHaveKey('hero');
    expect($props)->toHaveKey('masthead');
    expect($props)->toHaveKey('marquee');
    expect($props)->toHaveKey('summit-overview');
    expect($props)->toHaveKey('speakers-by-day');
    expect($props)->toHaveKey('faq');
    expect($props)->toHaveKey('footer');
    expect($props)->toHaveKey('price-card');
    expect($props)->toHaveKey('comparison-table');
    expect($props)->toHaveKey('guarantee');
    expect($props)->toHaveCount(20);

    // Template-private sales keys (not in the shared catalog) must NOT appear
    // in the AI-facing schema — they are template-only placeholders.
    expect($props)->not->toHaveKey('sales-hero');
    expect($props)->not->toHaveKey('vip-bonuses');

    // Legacy whole-template wrapper keys must not leak in — `summit` was the
    // summit-metadata wrapper in the old OchreInkContent shape, and is NOT a
    // catalog section.
    expect($props)->not->toHaveKey('summit');

    // Required should mirror the catalog-backed subset of supportedSections.
    expect($schema['required'])->toBe(array_keys($props));

    // Section prompt hint should also be present.
    expect($this->captured['system'])->toContain('top-level keys are each section name');
});

it('uses legacy whole-template schema for templates without sections (lime-ink)', function () {
    $summit = Summit::factory()->create();
    $filler = new TemplateFiller($this->registry, $this->client);

    try {
        $filler->fill($summit, 'lime-ink', collect(), null, null);
    } catch (RuntimeException) {
        // Expected — mocked response fails validation.
    }

    expect($this->captured['system'])->not->toBeNull();
    $schema = extractSchemaFromSystemPrompt($this->captured['system']);

    $props = $schema['properties'];

    // Legacy LimeInk shape has `summit` as a top-level metadata wrapper, not a
    // section-keyed map.
    expect($props)->toHaveKey('summit');

    // And no section-mode hint in the system prompt.
    expect($this->captured['system'])->not->toContain('top-level keys are each section name');
});
