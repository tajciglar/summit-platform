<?php

namespace App\Services\Templates;

use App\Models\Speaker;
use App\Models\Summit;
use App\Services\Anthropic\AnthropicClient;
use Illuminate\Support\Collection;
use Opis\JsonSchema\Errors\ErrorFormatter;
use Opis\JsonSchema\Validator;

class TemplateFiller
{
    public function __construct(
        private TemplateRegistry $registry,
        private AnthropicClient $anthropic,
    ) {}

    /**
     * @param  Collection<int, Speaker>  $speakers
     * @return array{content: array, tokens: int}
     *
     * @throws \RuntimeException when two attempts fail
     */
    public function fill(
        Summit $summit,
        string $templateKey,
        Collection $speakers,
        ?string $notes,
        ?string $styleReferenceUrl,
    ): array {
        $template = $this->registry->get($templateKey);
        $schema = $template['jsonSchema'];

        $systemPrompt = $this->buildSystemPrompt($schema);
        $userPrompt = $this->buildUserPrompt($summit, $speakers, $notes, $styleReferenceUrl);

        $lastError = null;
        $totalTokens = 0;

        for ($attempt = 1; $attempt <= 2; $attempt++) {
            $effectiveUser = $attempt === 1
                ? $userPrompt
                : "{$userPrompt}\n\nPrevious attempt failed with: {$lastError}\nReturn only valid JSON matching the schema.";

            $response = $this->anthropic->complete($systemPrompt, $effectiveUser);
            $totalTokens += $response['tokens'];

            $json = $this->extractJson($response['text']);
            if ($json === null) {
                $lastError = 'response was not valid JSON';

                continue;
            }

            // opis/json-schema validates against a decoded object graph, not an assoc array.
            // Re-encode/decode to object form.
            $objectGraph = json_decode(json_encode($json));
            $schemaJson = json_encode($schema);

            $validator = new Validator();
            $result = $validator->validate($objectGraph, $schemaJson);

            if ($result->isValid()) {
                return ['content' => $json, 'tokens' => $totalTokens];
            }

            $errors = (new ErrorFormatter())->format($result->error());
            $lastError = 'schema validation failed: '.json_encode($errors);
        }

        throw new \RuntimeException("TemplateFiller: {$lastError}");
    }

    private function buildSystemPrompt(array $schema): string
    {
        $schemaJson = json_encode($schema, JSON_PRETTY_PRINT);

        return <<<PROMPT
You are a landing-page copywriter for online summits. Given a summit's data, you fill in the slots of a pre-designed template by returning a JSON object that matches this JSON Schema exactly:

{$schemaJson}

Requirements:
- Return ONLY the JSON object. No prose, no markdown fences.
- Every required field must be present and non-empty.
- Do not invent speakers — use only the IDs provided in the user message.
- Keep copy specific, human, and on-brand. No generic marketing speak ("revolutionize", "game-changer").
- Headlines should be 6-14 words. Subheadings 10-20.
PROMPT;
    }

    private function buildUserPrompt(
        Summit $summit,
        Collection $speakers,
        ?string $notes,
        ?string $styleReferenceUrl,
    ): string {
        $speakersJson = json_encode($speakers->map(fn (Speaker $s) => [
            'id' => $s->id,
            'firstName' => $s->first_name,
            'lastName' => $s->last_name,
            'title' => $s->title,
            'masterclassTitle' => $s->masterclass_title,
            'goesLiveAt' => $s->goes_live_at?->toIso8601String(),
        ])->values(), JSON_PRETTY_PRINT);

        $summitJson = json_encode([
            'title' => $summit->title,
            'description' => $summit->description,
            'topic' => $summit->topic,
            'timezone' => $summit->timezone,
            'preSummitStartsAt' => $summit->pre_summit_starts_at?->toIso8601String(),
            'duringSummitStartsAt' => $summit->during_summit_starts_at?->toIso8601String(),
            'endsAt' => $summit->ends_at?->toIso8601String(),
        ], JSON_PRETTY_PRINT);

        $notesBlock = $notes ? "\n\nOperator notes: {$notes}" : '';
        $styleBlock = $styleReferenceUrl
            ? "\n\nStyle / voice reference: match the tone and cadence of {$styleReferenceUrl}."
            : '';

        return <<<PROMPT
Summit:
{$summitJson}

Speakers (use only these IDs):
{$speakersJson}
{$notesBlock}{$styleBlock}

Fill the template slots for this summit.
PROMPT;
    }

    /** Extract the first JSON object from a string that may have surrounding text. */
    private function extractJson(string $text): ?array
    {
        $text = trim($text);
        $first = strpos($text, '{');
        $last = strrpos($text, '}');
        if ($first === false || $last === false || $last <= $first) {
            return null;
        }

        $candidate = substr($text, $first, $last - $first + 1);
        $decoded = json_decode($candidate, true);

        return is_array($decoded) ? $decoded : null;
    }
}
