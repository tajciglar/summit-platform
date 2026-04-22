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
        ?string $stepType = null,
    ): array {
        $template = $this->registry->get($templateKey);

        // Section-aware templates build the effective schema from per-section schemas
        // keyed by section name; legacy templates use the whole-template jsonSchema.
        // When a catalog-backed template has sections outside the shared catalog
        // (e.g. template-specific sales sections), we limit the AI-facing schema
        // to the catalog-backed subset so `required` always references keys that
        // have a schema under `properties`.
        //
        // Sales pages are the exception: the shared catalog only covers a
        // handful of sales sections (price-card, comparison-table, guarantee),
        // so a catalog-scoped schema would leave the AI unable to populate
        // salesHero/vipBonuses/etc. We fall back to the whole jsonSchema for
        // sales_page steps across every template and scope `required` to the
        // sales keys so the AI fills the sales body.
        $useSectionMode = $this->registry->supportsSectionEditing($templateKey)
            && $stepType !== 'sales_page';

        if ($useSectionMode) {
            $sectionSchemas = $this->registry->sectionSchemas($templateKey);
            $schema = [
                'type' => 'object',
                'properties' => $sectionSchemas,
                'required' => array_values(array_intersect(
                    $this->registry->supportedSections($templateKey),
                    array_keys($sectionSchemas),
                )),
                'additionalProperties' => false,
            ];
        } else {
            $schema = $template['jsonSchema'];
        }

        // Whole-schema templates carry both optin and sales keys in one schema.
        // Without scoping, the AI fills required (optin) and skips optional
        // (sales) — so sales_page steps render empty. For sales_page we flip
        // which keys are required so the AI populates the sales sections.
        if ($stepType === 'sales_page') {
            $schema = $this->scopeWholeSchemaForSales($schema, $templateKey);
        }

        $sectionMode = $useSectionMode;

        $systemPrompt = $this->buildSystemPrompt($schema, $sectionMode);
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

            $validator = new Validator;
            $result = $validator->validate($objectGraph, $schemaJson);

            if ($result->isValid()) {
                return ['content' => $json, 'tokens' => $totalTokens];
            }

            $errors = (new ErrorFormatter)->format($result->error());
            $lastError = 'schema validation failed: '.json_encode($errors);
        }

        throw new \RuntimeException("TemplateFiller: {$lastError}");
    }

    private function buildSystemPrompt(array $schema, bool $sectionMode = false): string
    {
        $schemaJson = json_encode($schema, JSON_PRETTY_PRINT);

        $sectionHint = $sectionMode
            ? "\n- Return a single JSON object whose top-level keys are each section name (hero, marquee, summit-overview, etc.). Fill every section with realistic content consistent with the summit context."
            : '';

        return <<<PROMPT
You are a landing-page copywriter for online summits. Given a summit's data, you fill in the slots of a pre-designed template by returning a JSON object that matches this JSON Schema exactly:

{$schemaJson}

Requirements:
- Return ONLY the JSON object. No prose, no markdown fences.
- Every required field must be present and non-empty.
- Do not invent speakers — use only the IDs provided in the user message.
- Keep copy specific, human, and on-brand. No generic marketing speak ("revolutionize", "game-changer").
- Headlines should be 6-14 words. Subheadings 10-20.{$sectionHint}
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

    /**
     * Rewrite a whole-template jsonSchema so only sales-section keys are
     * required. Keeps the full property set so operators can still hand-edit
     * optin copy later; the AI just knows to fill the sales body.
     *
     * @param  array<string, mixed>  $schema
     * @return array<string, mixed>
     */
    private function scopeWholeSchemaForSales(array $schema, string $templateKey): array
    {
        $salesKebab = $this->registry->defaultSalesSections($templateKey);
        if ($salesKebab === []) {
            return $schema;
        }

        $salesCamel = array_map(
            static fn (string $key): string => lcfirst(str_replace(' ', '', ucwords(str_replace('-', ' ', $key)))),
            $salesKebab,
        );
        $properties = array_keys($schema['properties'] ?? []);
        $required = array_values(array_intersect($properties, $salesCamel));

        if ($required === []) {
            return $schema;
        }

        $schema['required'] = $required;

        return $schema;
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
