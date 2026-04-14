<?php

namespace App\Services\FunnelGenerator\Phases;

use App\Services\FunnelGenerator\AnthropicClient;
use App\Services\FunnelGenerator\Exceptions\CopywriterException;
use App\Services\FunnelGenerator\Exceptions\InvalidPropsException;
use App\Services\FunnelGenerator\Tools\ToolBuilder;
use App\Services\FunnelGenerator\Validators\BlockPropsValidator;

class CopywriterPhase
{
    public function __construct(
        private AnthropicClient $client,
        private ToolBuilder $toolBuilder,
        private BlockPropsValidator $validator,
    ) {}

    /**
     * @param  array<int,string>  $sequence  Block types in order from ArchitectPhase
     * @return array<int, array{type:string,version:int,props:array}>
     */
    public function run(array $brief, array $catalog, string $stepType, array $sequence): array
    {
        if ($sequence === []) {
            return [];
        }

        // Index catalog by type for fast lookup
        $blockByType = [];
        foreach ($catalog['blocks'] ?? [] as $b) {
            $blockByType[$b['type']] = $b;
        }

        // Build tools list for blocks in this sequence only
        $allTools = $this->toolBuilder->toolsForStep($catalog, $stepType);
        $toolByName = [];
        foreach ($allTools as $tool) {
            $toolByName[$tool['name']] = $tool;
        }

        $requestedTools = [];
        foreach ($sequence as $type) {
            $toolName = 'emit_'.$type;
            if (! isset($toolByName[$toolName])) {
                throw new CopywriterException("Block type {$type} not in catalog or not valid for {$stepType}.");
            }
            $requestedTools[] = $toolByName[$toolName];
        }

        $response = $this->client->messages([
            'model' => config('anthropic.copywriter_model'),
            'max_tokens' => config('anthropic.max_tokens', 4096),
            'system' => $this->systemPrompt($stepType, $sequence),
            'tools' => $requestedTools,
            'tool_choice' => ['type' => 'any'],
            'messages' => [[
                'role' => 'user',
                'content' => $this->userPrompt($brief, $sequence),
            ]],
        ]);

        $toolUses = array_values(array_filter(
            $response['content'] ?? [],
            fn ($c) => ($c['type'] ?? null) === 'tool_use',
        ));

        if (count($toolUses) !== count($sequence)) {
            throw new CopywriterException(
                'Expected '.count($sequence).' tool calls, got '.count($toolUses)." for step {$stepType}.",
            );
        }

        $blocks = [];
        foreach ($toolUses as $i => $call) {
            $expected = 'emit_'.$sequence[$i];
            if (($call['name'] ?? null) !== $expected) {
                throw new CopywriterException(
                    "Expected tool {$expected} at position {$i}, got {$call['name']} for step {$stepType}.",
                );
            }
            $type = $sequence[$i];
            $props = $call['input'] ?? [];
            $schema = $blockByType[$type]['schema'] ?? ['type' => 'object'];

            try {
                $this->validator->validate($schema, $props);
            } catch (InvalidPropsException $e) {
                $props = $this->retryBlock($brief, $stepType, $type, $schema, $toolByName['emit_'.$type], $e->errors());
                $this->validator->validate($schema, $props);
            }

            $blocks[] = [
                'type' => $type,
                'version' => $blockByType[$type]['version'] ?? 1,
                'props' => $props,
            ];
        }

        return $blocks;
    }

    private function retryBlock(
        array $brief,
        string $stepType,
        string $type,
        array $schema,
        array $tool,
        array $errors,
    ): array {
        $errorList = implode("\n- ", array_column($errors, 'message'));
        $response = $this->client->messages([
            'model' => config('anthropic.copywriter_model'),
            'max_tokens' => 1024,
            'system' => "You are fixing one block that failed schema validation. Emit exactly one tool call for emit_{$type} with corrected props.",
            'tools' => [$tool],
            'tool_choice' => ['type' => 'tool', 'name' => 'emit_'.$type],
            'messages' => [[
                'role' => 'user',
                'content' => "Step: {$stepType}\nBrief: ".json_encode($brief)
                    ."\n\nErrors from the previous attempt:\n- {$errorList}\n\nEmit corrected props now.",
            ]],
        ]);

        foreach ($response['content'] ?? [] as $c) {
            if (($c['type'] ?? null) === 'tool_use' && ($c['name'] ?? null) === 'emit_'.$type) {
                return $c['input'] ?? [];
            }
        }

        throw new CopywriterException("Retry did not return tool_use for {$type}.");
    }

    private function systemPrompt(string $stepType, array $sequence): string
    {
        $list = implode(', ', $sequence);

        return <<<SYS
You are an expert summit copywriter. Your task is to write the copy for the **{$stepType}** step of a summit funnel.

You MUST call the following tools in EXACTLY this order, one call per block, no extra calls, no text:
{$list}

Rules:
- Every tool call must satisfy its input schema — the UI crashes otherwise.
- Copy must match the summit's tone and audience.
- No lorem ipsum. No placeholder text.
- Reuse facts from the brief (dates, prices, speaker count). Do not invent speakers, bonuses, or prices not in the brief.
- Headlines: specific, outcome-oriented, not generic.
SYS;
    }

    private function userPrompt(array $brief, array $sequence): string
    {
        return "Summit brief:\n".json_encode($brief, JSON_PRETTY_PRINT)
            ."\n\nWrite copy for these blocks in order: ".json_encode($sequence);
    }
}
