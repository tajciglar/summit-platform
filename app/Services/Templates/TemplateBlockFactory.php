<?php

namespace App\Services\Templates;

use App\Models\FunnelStep;
use Filament\Forms\Components\Builder\Block;
use Filament\Schemas\Components\Component;

/**
 * Bridges Filament Builder ↔ page_content map.
 *
 * page_content shape on disk (canonical, what Next.js reads):
 *   { template_key: 'indigo-gold', content: { hero: {...}, topBar: {...}, ... }, ... }
 *
 * Filament Builder state shape (what the editor wants):
 *   [ {type: 'hero', data: {...}}, {type: 'topBar', data: {...}}, ... ]
 *
 * This class owns the conversions + produces Block definitions whose fields
 * come from the template manifest's per-template jsonSchema.properties[key].
 */
class TemplateBlockFactory
{
    public function __construct(
        private TemplateRegistry $registry,
        private FilamentSchemaMapper $mapper,
    ) {}

    /**
     * @param  array<string, mixed>|null  $pageContent
     * @return list<array{type: string, data: array}>
     */
    public function mapToBuilderList(?array $pageContent): array
    {
        if (! is_array($pageContent)) {
            return [];
        }

        if (array_is_list($pageContent)) {
            return array_values(array_filter(
                $pageContent,
                fn ($item) => is_array($item) && isset($item['type']),
            ));
        }

        $content = $pageContent['content'] ?? null;
        if (! is_array($content)) {
            return [];
        }

        // Walk in template schema order when we can — renders the Builder in
        // the same top-to-bottom order as the live page.
        $templateKey = $pageContent['template_key'] ?? null;
        $schemaKeys = $this->schemaKeysForTemplate(is_string($templateKey) ? $templateKey : null);

        $ordered = [];
        foreach ($schemaKeys as $key) {
            if (array_key_exists($key, $content)) {
                $ordered[$key] = $content[$key];
            }
        }
        foreach ($content as $key => $value) {
            if (! array_key_exists($key, $ordered)) {
                $ordered[$key] = $value;
            }
        }

        $out = [];
        foreach ($ordered as $key => $value) {
            $out[] = [
                'type' => (string) $key,
                'data' => $this->wrapValueForBlock($value),
            ];
        }

        return $out;
    }

    /**
     * Convert Builder list back to canonical page_content map, preserving
     * non-content metadata (template_key, enabled_sections, audience, palette)
     * from the original record.
     *
     * @param  list<array{type: string, data: array}>  $list
     * @param  array<string, mixed>|null  $original
     * @return array<string, mixed>
     */
    public function builderListToMap(array $list, ?array $original): array
    {
        $contentMap = [];
        foreach ($list as $item) {
            if (! is_array($item) || ! isset($item['type'])) {
                continue;
            }
            $contentMap[(string) $item['type']] = $this->unwrapValueFromBlock($item['data'] ?? []);
        }

        // No template_key in the original → this is a legacy/manual list; keep it as a list.
        if (! is_array($original) || ! isset($original['template_key'])) {
            return $list;
        }

        return array_merge($original, ['content' => $contentMap]);
    }

    /** @return list<string> */
    private function schemaKeysForTemplate(?string $templateKey): array
    {
        if ($templateKey === null || ! $this->registry->exists($templateKey)) {
            return [];
        }
        $schema = $this->registry->get($templateKey)['jsonSchema'] ?? null;
        if (! is_array($schema)) {
            return [];
        }

        return array_keys($schema['properties'] ?? []);
    }

    /**
     * Filament Builder expects each block's data to be a field-keyed map.
     * Section schemas that are top-level arrays (e.g. faqs) get wrapped under
     * `value` so they can be rendered via a single Repeater field.
     */
    private function wrapValueForBlock(mixed $value): array
    {
        if (is_array($value) && ! array_is_list($value)) {
            return $value;
        }

        return ['value' => $value];
    }

    private function unwrapValueFromBlock(mixed $data): mixed
    {
        if (is_array($data) && array_keys($data) === ['value']) {
            return $data['value'];
        }

        return $data;
    }

    /**
     * @return list<Block>
     */
    public function blocksForStep(?FunnelStep $step): array
    {
        $pageContent = $step?->page_content;
        $templateKey = is_array($pageContent) ? ($pageContent['template_key'] ?? null) : null;

        if (! is_string($templateKey) || ! $this->registry->exists($templateKey)) {
            return [];
        }

        $template = $this->registry->get($templateKey);
        $schema = $template['jsonSchema'] ?? null;
        $summitId = $step?->funnel?->summit_id;

        if (! is_array($schema) || ($schema['type'] ?? null) !== 'object') {
            return [];
        }

        $properties = $schema['properties'] ?? [];
        $blocks = [];

        foreach ($properties as $name => $propSchema) {
            if (! is_array($propSchema)) {
                continue;
            }

            $name = (string) $name;
            $fields = $this->fieldsForSection($propSchema, $summitId);

            $blocks[] = Block::make($name)
                ->label($this->humanize($name))
                ->icon($this->iconFor($name))
                ->schema($fields);
        }

        return $blocks;
    }

    /**
     * @param  array<string, mixed>  $propSchema
     * @return list<Component>
     */
    private function fieldsForSection(array $propSchema, ?string $summitId): array
    {
        // Scalar or array top-level — wrap in a single field named 'value'.
        if (($propSchema['type'] ?? null) !== 'object') {
            return $this->mapper->map([
                'type' => 'object',
                'properties' => ['value' => $propSchema],
                'required' => [],
            ], $summitId);
        }

        return $this->mapper->map($propSchema, $summitId);
    }

    private function humanize(string $name): string
    {
        $withSpaces = preg_replace('/([a-z0-9])([A-Z])/', '$1 $2', $name) ?? $name;

        return ucwords(strtolower(str_replace(['_', '-'], ' ', $withSpaces)));
    }

    private function iconFor(string $name): string
    {
        return match ($name) {
            'topBar', 'masthead' => 'heroicon-o-bars-3',
            'hero' => 'heroicon-o-star',
            'press', 'marquee' => 'heroicon-o-megaphone',
            'trustBadges' => 'heroicon-o-shield-check',
            'stats', 'figures' => 'heroicon-o-chart-bar',
            'overview', 'intro', 'summit' => 'heroicon-o-document-text',
            'speakersDay', 'speakersSection' => 'heroicon-o-user-group',
            'outcomes', 'valueProps' => 'heroicon-o-sparkles',
            'freeGift', 'freeGifts', 'supplement' => 'heroicon-o-gift',
            'bonuses', 'bonusStack', 'vipBonuses' => 'heroicon-o-squares-plus',
            'founders', 'hosts' => 'heroicon-o-user-circle',
            'testimonials' => 'heroicon-o-chat-bubble-left-right',
            'pullQuote' => 'heroicon-o-arrow-right-circle',
            'shifts', 'reasons' => 'heroicon-o-check-badge',
            'closing', 'cta' => 'heroicon-o-cursor-arrow-rays',
            'faqSection', 'faqs', 'faq' => 'heroicon-o-question-mark-circle',
            'mobileCta' => 'heroicon-o-device-phone-mobile',
            'footer' => 'heroicon-o-minus',
            'priceCard' => 'heroicon-o-currency-dollar',
            'comparisonTable' => 'heroicon-o-table-cells',
            'guarantee' => 'heroicon-o-lock-closed',
            'upgradeSection' => 'heroicon-o-arrow-trending-up',
            'whySection' => 'heroicon-o-light-bulb',
            default => 'heroicon-o-square-3-stack-3d',
        };
    }
}
