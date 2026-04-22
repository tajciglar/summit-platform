<?php

use App\Models\Summit;
use App\Services\Anthropic\AnthropicClient;
use App\Services\Templates\TemplateFiller;
use App\Services\Templates\TemplateRegistry;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->schema = [
        'type' => 'object',
        'required' => ['summit', 'hero'],
        'properties' => [
            'summit' => [
                'type' => 'object',
                'required' => ['name'],
                'properties' => ['name' => ['type' => 'string', 'minLength' => 1]],
            ],
            'hero' => [
                'type' => 'object',
                'required' => ['headline'],
                'properties' => ['headline' => ['type' => 'string', 'minLength' => 1]],
            ],
        ],
    ];

    $this->registry = Mockery::mock(TemplateRegistry::class);
    $this->registry->shouldReceive('get')->with('ochre-ink')->andReturn([
        'key' => 'ochre-ink',
        'label' => 'Editorial',
        'thumbnail' => '/x.jpg',
        'tags' => [],
        'jsonSchema' => $this->schema,
    ]);
    // Legacy unit tests exercise the whole-template schema path only.
    $this->registry->shouldReceive('supportsSectionEditing')->with('ochre-ink')->andReturn(false);
});

it('calls anthropic with schema in system prompt and returns validated content', function () {
    $client = Mockery::mock(AnthropicClient::class);
    $client->shouldReceive('complete')
        ->once()
        ->andReturn([
            'text' => '{"summit":{"name":"X"},"hero":{"headline":"H"}}',
            'tokens' => 500,
        ]);

    $summit = Summit::factory()->create(['title' => 'Test Summit']);
    $filler = new TemplateFiller($this->registry, $client);

    $result = $filler->fill(
        summit: $summit,
        templateKey: 'ochre-ink',
        speakers: collect(),
        notes: null,
        styleReferenceUrl: null,
    );

    expect($result['content'])->toBe(['summit' => ['name' => 'X'], 'hero' => ['headline' => 'H']]);
    expect($result['tokens'])->toBe(500);
});

it('retries once when response is invalid JSON', function () {
    $client = Mockery::mock(AnthropicClient::class);
    $client->shouldReceive('complete')
        ->times(2)
        ->andReturn(
            ['text' => 'not json', 'tokens' => 100],
            ['text' => '{"summit":{"name":"OK"},"hero":{"headline":"H"}}', 'tokens' => 400],
        );

    $summit = Summit::factory()->create();
    $filler = new TemplateFiller($this->registry, $client);
    $result = $filler->fill($summit, 'ochre-ink', collect(), null, null);
    expect($result['content']['summit']['name'])->toBe('OK');
});

it('throws after two failed attempts', function () {
    $client = Mockery::mock(AnthropicClient::class);
    $client->shouldReceive('complete')
        ->times(2)
        ->andReturn(['text' => 'not json', 'tokens' => 100]);

    $summit = Summit::factory()->create();
    $filler = new TemplateFiller($this->registry, $client);
    expect(fn () => $filler->fill($summit, 'ochre-ink', collect(), null, null))
        ->toThrow(RuntimeException::class);
});

it('scopes whole-template schema to sales keys when step_type is sales_page', function () {
    // Whole-template schema with both optin keys (required) and sales keys (optional).
    $schema = [
        'type' => 'object',
        'required' => ['hero', 'press'],
        'properties' => [
            'hero' => ['type' => 'object', 'required' => ['headline'], 'properties' => ['headline' => ['type' => 'string', 'minLength' => 1]]],
            'press' => ['type' => 'object', 'required' => ['eyebrow'], 'properties' => ['eyebrow' => ['type' => 'string', 'minLength' => 1]]],
            'salesHero' => ['type' => 'object', 'required' => ['headline'], 'properties' => ['headline' => ['type' => 'string', 'minLength' => 1]]],
            'priceCard' => ['type' => 'object', 'required' => ['ctaLabel'], 'properties' => ['ctaLabel' => ['type' => 'string', 'minLength' => 1]]],
        ],
    ];

    $registry = Mockery::mock(TemplateRegistry::class);
    $registry->shouldReceive('get')->with('test-skin')->andReturn([
        'key' => 'test-skin',
        'label' => 'Test',
        'thumbnail' => '/x.jpg',
        'tags' => [],
        'jsonSchema' => $schema,
    ]);
    $registry->shouldReceive('supportsSectionEditing')->with('test-skin')->andReturn(false);
    $registry->shouldReceive('defaultSalesSections')->with('test-skin')->andReturn(['sales-hero', 'price-card']);

    $captured = null;
    $client = Mockery::mock(AnthropicClient::class);
    $client->shouldReceive('complete')
        ->once()
        ->andReturnUsing(function (string $system) use (&$captured) {
            $captured = $system;

            return ['text' => '{"salesHero":{"headline":"H"},"priceCard":{"ctaLabel":"Buy"}}', 'tokens' => 100];
        });

    $summit = Summit::factory()->create();
    $filler = new TemplateFiller($registry, $client);

    $result = $filler->fill(
        summit: $summit,
        templateKey: 'test-skin',
        speakers: collect(),
        notes: null,
        styleReferenceUrl: null,
        stepType: 'sales_page',
    );

    // The system prompt the AI sees must require ONLY the sales keys.
    expect($captured)->toContain('"required": [')
        ->and($captured)->toContain('salesHero')
        ->and($captured)->toContain('priceCard');

    // And the filler returns the validated sales content, not the optin shape.
    expect($result['content'])->toHaveKey('salesHero');
});

it('throws when schema validation fails twice', function () {
    $client = Mockery::mock(AnthropicClient::class);
    $client->shouldReceive('complete')
        ->times(2)
        ->andReturn(['text' => '{"summit":{"name":""},"hero":{"headline":"H"}}', 'tokens' => 100]);

    $summit = Summit::factory()->create();
    $filler = new TemplateFiller($this->registry, $client);
    expect(fn () => $filler->fill($summit, 'ochre-ink', collect(), null, null))
        ->toThrow(RuntimeException::class, 'schema validation');
});
