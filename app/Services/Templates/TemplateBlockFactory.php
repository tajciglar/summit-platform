<?php

namespace App\Services\Templates;

use App\Models\FunnelStep;
use Filament\Forms\Components\Builder\Block;
use Filament\Forms\Components\ColorPicker;
use Filament\Forms\Components\Select;
use Filament\Schemas\Components\Component;
use Filament\Schemas\Components\Fieldset;

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
     * Per-request memoization for blocksForStep(). The Builder's `blocks()`
     * closure fires repeatedly during one Livewire tick; rebuilding the full
     * 17-section Component tree each time caused OOM on edit pages.
     *
     * @var array<string, list<Block>>
     */
    private static array $blocksForStepCache = [];

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
     * non-content metadata (template_key, enabled_sections)
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

    /**
     * Ordered list of section keys the Builder should render. Block types
     * map 1:1 to the template's jsonSchema top-level properties (camelCase),
     * which is the authoritative shape validated by the Next side's Zod
     * schema. `enabled_sections` stays kebab-case for the renderer's
     * section-toggle and is not used here.
     *
     * @return list<string>
     */
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
            return $this->unwrapValueFromBlock($data['value']);
        }

        if (is_array($data)) {
            return array_map(fn ($v) => $this->unwrapValueFromBlock($v), $data);
        }

        return $data;
    }

    /**
     * Builder blocks keyed by the template's top-level jsonSchema property
     * names (camelCase). Matches the on-disk `page_content.content` shape
     * that the Next side's Zod schema validates.
     *
     * @return list<Block>
     */
    public function blocksForStep(?FunnelStep $step): array
    {
        $pageContent = $step?->page_content;
        $templateKey = is_array($pageContent) ? ($pageContent['template_key'] ?? null) : null;

        if (! is_string($templateKey) || ! $this->registry->exists($templateKey)) {
            return [];
        }

        $summitId = $step?->funnel?->summit_id;
        $cacheKey = ($step?->getKey() ?? 'new').'|'.$templateKey.'|'.($summitId ?? '');
        if (isset(self::$blocksForStepCache[$cacheKey])) {
            return self::$blocksForStepCache[$cacheKey];
        }

        $schema = $this->registry->get($templateKey)['jsonSchema'] ?? null;

        if (! is_array($schema) || ($schema['type'] ?? null) !== 'object') {
            return self::$blocksForStepCache[$cacheKey] = [];
        }

        $blocks = [];
        foreach ($schema['properties'] ?? [] as $name => $propSchema) {
            if (! is_array($propSchema)) {
                continue;
            }

            $name = (string) $name;
            $blocks[] = Block::make($name)
                ->label($this->humanize($name))
                ->icon($this->iconFor($name))
                ->schema(array_merge(
                    $this->fieldsForSection($propSchema, $summitId),
                    [$this->sectionDesignFieldset()],
                ));
        }

        return self::$blocksForStepCache[$cacheKey] = $blocks;
    }

    /**
     * Per-section design-token overrides. Rendered as a collapsed fieldset at
     * the bottom of every block's form. Values write to `data.__design.*`;
     * EditFunnelStep moves them to `page_overrides.sections[type]` on save and
     * injects them back on fill, keeping block `data` pure content (so Zod
     * validation on the Next side is unchanged).
     */
    private function sectionDesignFieldset(): Fieldset
    {
        $fonts = [
            'Fraunces' => 'Fraunces',
            'Cormorant Garamond' => 'Cormorant Garamond',
            'Playfair Display' => 'Playfair Display',
            'Inter' => 'Inter',
            'DM Sans' => 'DM Sans',
            'Poppins' => 'Poppins',
            'Nunito' => 'Nunito',
        ];

        return Fieldset::make('Design (this section)')
            ->columns(6)
            ->schema([
                ColorPicker::make('__design.palette.primary')
                    ->label('Primary')->hex()->live(debounce: 500)->columnSpan(1),
                ColorPicker::make('__design.palette.accent')
                    ->label('Accent')->hex()->live(debounce: 500)->columnSpan(1),
                ColorPicker::make('__design.palette.ink')
                    ->label('Text')->hex()->live(debounce: 500)->columnSpan(1),
                ColorPicker::make('__design.palette.paper')
                    ->label('Background')->hex()->live(debounce: 500)->columnSpan(1),
                Select::make('__design.headingFont')
                    ->label('Heading font')->options($fonts)->native(false)->live()
                    ->placeholder('— inherit —')->columnSpan(1),
                Select::make('__design.bodyFont')
                    ->label('Body font')->options($fonts)->native(false)->live()
                    ->placeholder('— inherit —')->columnSpan(1),
            ]);
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
            'topBar', 'top-bar', 'masthead' => 'heroicon-o-bars-3',
            'hero' => 'heroicon-o-star',
            'press', 'marquee' => 'heroicon-o-megaphone',
            'trustBadges', 'trust-badges' => 'heroicon-o-shield-check',
            'stats', 'figures', 'stats-hero', 'facts-stats' => 'heroicon-o-chart-bar',
            'overview', 'intro', 'summit', 'summit-overview' => 'heroicon-o-document-text',
            'speakersDay', 'speakersByDay', 'speakersSection', 'speakers-by-day' => 'heroicon-o-user-group',
            'outcomes', 'valueProps', 'value-prop' => 'heroicon-o-sparkles',
            'freeGift', 'freeGifts', 'free-gift', 'supplement' => 'heroicon-o-gift',
            'bonuses', 'bonusStack', 'bonus-stack', 'vipBonuses' => 'heroicon-o-squares-plus',
            'founders', 'hosts', 'host-founder' => 'heroicon-o-user-circle',
            'testimonials', 'testimonials-attendees' => 'heroicon-o-chat-bubble-left-right',
            'pullQuote', 'pull-quote' => 'heroicon-o-arrow-right-circle',
            'shifts', 'reasons', 'reasons-to-attend' => 'heroicon-o-check-badge',
            'closing', 'cta', 'closing-cta' => 'heroicon-o-cursor-arrow-rays',
            'faqSection', 'faqs', 'faq' => 'heroicon-o-question-mark-circle',
            'mobileCta' => 'heroicon-o-device-phone-mobile',
            'footer' => 'heroicon-o-minus',
            'priceCard', 'price-card' => 'heroicon-o-currency-dollar',
            'comparisonTable', 'comparison-table' => 'heroicon-o-table-cells',
            'guarantee' => 'heroicon-o-lock-closed',
            'upgradeSection' => 'heroicon-o-arrow-trending-up',
            'whySection' => 'heroicon-o-light-bulb',
            default => 'heroicon-o-square-3-stack-3d',
        };
    }
}
