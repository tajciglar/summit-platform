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
    $this->registry->shouldReceive('get')->with('opus-v1')->andReturn([
        'key' => 'opus-v1',
        'label' => 'Editorial',
        'thumbnail' => '/x.jpg',
        'tags' => [],
        'jsonSchema' => $this->schema,
    ]);
    // Legacy unit tests exercise the whole-template schema path only.
    $this->registry->shouldReceive('supportsSections')->with('opus-v1')->andReturn(false);
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
        templateKey: 'opus-v1',
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
    $result = $filler->fill($summit, 'opus-v1', collect(), null, null);
    expect($result['content']['summit']['name'])->toBe('OK');
});

it('throws after two failed attempts', function () {
    $client = Mockery::mock(AnthropicClient::class);
    $client->shouldReceive('complete')
        ->times(2)
        ->andReturn(['text' => 'not json', 'tokens' => 100]);

    $summit = Summit::factory()->create();
    $filler = new TemplateFiller($this->registry, $client);
    expect(fn () => $filler->fill($summit, 'opus-v1', collect(), null, null))
        ->toThrow(RuntimeException::class);
});

it('throws when schema validation fails twice', function () {
    $client = Mockery::mock(AnthropicClient::class);
    $client->shouldReceive('complete')
        ->times(2)
        ->andReturn(['text' => '{"summit":{"name":""},"hero":{"headline":"H"}}', 'tokens' => 100]);

    $summit = Summit::factory()->create();
    $filler = new TemplateFiller($this->registry, $client);
    expect(fn () => $filler->fill($summit, 'opus-v1', collect(), null, null))
        ->toThrow(RuntimeException::class, 'schema validation');
});
