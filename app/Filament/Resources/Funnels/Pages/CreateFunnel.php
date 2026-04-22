<?php

namespace App\Filament\Resources\Funnels\Pages;

use App\Filament\Pages\Concerns\InjectsCurrentSummitOnCreate;
use App\Filament\Resources\Funnels\FunnelResource;
use App\Models\Funnel;
use App\Services\Templates\SectionPlaceholderFiller;
use App\Services\Templates\TemplateRegistry;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\CreateRecord;

class CreateFunnel extends CreateRecord
{
    use InjectsCurrentSummitOnCreate;

    protected static string $resource = FunnelResource::class;

    /**
     * Step types that get auto-generated from `section_config` on funnel
     * creation. Keys double as default slugs and drive sort order.
     *
     * @var array<string, array{slug: string, name: string, sort_order: int}>
     */
    private const AUTO_STEP_TYPES = [
        'optin' => ['slug' => 'optin', 'name' => 'Optin', 'sort_order' => 1],
        'sales_page' => ['slug' => 'sales', 'name' => 'Sales Page', 'sort_order' => 2],
        'thank_you' => ['slug' => 'thanks', 'name' => 'Thank You', 'sort_order' => 3],
    ];

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('view', ['record' => $this->record]);
    }

    /**
     * For every step type that has sections selected in `section_config`,
     * create the matching FunnelStep and seed its `page_content` with the
     * funnel skin + enabled sections and empty content. Copywriters fill the
     * sections from the block editor — no AI call, no queue dependency.
     */
    protected function afterCreate(): void
    {
        /** @var Funnel $funnel */
        $funnel = $this->record;

        $sectionConfig = $funnel->section_config ?? [];
        $created = 0;

        $registry = app(TemplateRegistry::class);
        $filler = app(SectionPlaceholderFiller::class);

        // The whole-template jsonSchema is authoritative — Next's Zod
        // validates `content` against every top-level (camelCase) property,
        // so we fill the full schema. `enabled_sections` (kebab) is a
        // separate render-time toggle and lives alongside `content`.
        $wholeSchema = $funnel->template_key && $registry->exists($funnel->template_key)
            ? ($registry->get($funnel->template_key)['jsonSchema'] ?? [])
            : [];
        $speakerIds = SectionPlaceholderFiller::speakerIdsFor($funnel->summit_id);
        $speakersByDay = SectionPlaceholderFiller::speakersByDayFor($funnel->summit_id);

        foreach (self::AUTO_STEP_TYPES as $stepType => $defaults) {
            $sections = $sectionConfig[$stepType] ?? [];
            if (! is_array($sections) || count($sections) === 0) {
                continue;
            }

            $pageContent = null;
            if ($funnel->template_key) {
                $enabled = array_values($sections);
                $stepSchema = $this->scopeSchemaForStepType(
                    $wholeSchema,
                    $stepType,
                    $enabled,
                    $registry,
                    $funnel->template_key,
                );
                $content = is_array($stepSchema) && ($stepSchema['type'] ?? null) === 'object'
                    ? $filler->fill($stepSchema, $speakerIds, $speakersByDay)
                    : [];

                $pageContent = [
                    'template_key' => $funnel->template_key,
                    'enabled_sections' => $enabled,
                    'content' => $content === [] ? (object) [] : $content,
                ];
            }

            $funnel->steps()->create([
                'step_type' => $stepType,
                'slug' => $defaults['slug'],
                'name' => $defaults['name'],
                'sort_order' => $defaults['sort_order'],
                'is_published' => false,
                'page_content' => $pageContent,
            ]);
            $created++;
        }

        if ($created > 0) {
            Notification::make()
                ->title('Created '.$created.' step'.($created === 1 ? '' : 's'))
                ->body('Open a step to add or edit section content.')
                ->success()
                ->send();
        }
    }

    /**
     * The whole-template jsonSchema's `required` list is the optin body. A
     * sales_page step needs placeholder content for the sales sections
     * (salesHero, priceCard, guarantee, ...) but skins routinely cross-
     * reference optin data like `content.topBar.brandName`, so we keep the
     * optin required list and APPEND the enabled sales camelCase keys. That
     * way placeholder content covers every key any sales skin might read.
     *
     * @param  array<string, mixed>  $schema
     * @param  list<string>  $enabledKebab
     * @return array<string, mixed>
     */
    private function scopeSchemaForStepType(
        array $schema,
        string $stepType,
        array $enabledKebab,
        TemplateRegistry $registry,
        string $templateKey,
    ): array {
        if ($stepType !== 'sales_page') {
            return $schema;
        }

        $salesKebab = $registry->defaultSalesSections($templateKey);
        if ($salesKebab === []) {
            return $schema;
        }

        $enabledSales = array_values(array_intersect($enabledKebab, $salesKebab));
        if ($enabledSales === []) {
            return $schema;
        }

        $salesCamel = array_map(
            static fn (string $key): string => lcfirst(str_replace(' ', '', ucwords(str_replace('-', ' ', $key)))),
            $enabledSales,
        );
        $properties = array_keys($schema['properties'] ?? []);
        $salesRequired = array_values(array_intersect($properties, $salesCamel));

        if ($salesRequired === []) {
            return $schema;
        }

        $existing = is_array($schema['required'] ?? null) ? $schema['required'] : [];
        $schema['required'] = array_values(array_unique([...$existing, ...$salesRequired]));

        return $schema;
    }
}
