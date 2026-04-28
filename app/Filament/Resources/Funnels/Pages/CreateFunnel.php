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
     * For every step type the operator picked in the create form, create the
     * matching FunnelStep and seed its `page_content` with the funnel skin +
     * the registry's default enabled sections. Copywriters fill the sections
     * from the block editor — no AI call, no queue dependency.
     */
    protected function afterCreate(): void
    {
        /** @var Funnel $funnel */
        $funnel = $this->record;

        // No skin picked → nothing to scaffold. Operator can add steps later
        // by hand once they choose a template.
        if (! $funnel->template_key) {
            return;
        }

        $selectedSteps = $this->data['steps_to_create'] ?? array_keys(self::AUTO_STEP_TYPES);
        if (! is_array($selectedSteps) || $selectedSteps === []) {
            return;
        }

        $created = 0;
        $sectionConfigOut = $funnel->section_config ?? [];

        $registry = app(TemplateRegistry::class);
        $filler = app(SectionPlaceholderFiller::class);

        $wholeSchema = $funnel->template_key && $registry->exists($funnel->template_key)
            ? ($registry->get($funnel->template_key)['jsonSchema'] ?? [])
            : [];
        $speakerIds = SectionPlaceholderFiller::speakerIdsFor($funnel->summit_id);
        $speakersByDay = SectionPlaceholderFiller::speakersByDayFor($funnel->summit_id);

        foreach (self::AUTO_STEP_TYPES as $stepType => $defaults) {
            if (! in_array($stepType, $selectedSteps, true)) {
                continue;
            }

            $sections = self::defaultSectionsForStep($registry, $funnel->template_key, $stepType);
            $sectionConfigOut[$stepType] = $sections;

            $pageContent = [];
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
                'is_published' => (bool) $funnel->is_active,
                'page_content' => $pageContent,
            ]);
            $created++;
        }

        if ($sectionConfigOut !== ($funnel->section_config ?? [])) {
            $funnel->update(['section_config' => $sectionConfigOut]);
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
     * Default section list for a given step type, sourced from the template
     * registry. Optin = supportedSections minus the sales sections; sales =
     * defaultSalesSections (or all supported when the skin doesn't split);
     * thank_you = supportedSections.
     *
     * @return list<string>
     */
    private static function defaultSectionsForStep(TemplateRegistry $registry, ?string $templateKey, string $stepType): array
    {
        if (! $templateKey || ! $registry->exists($templateKey) || ! $registry->supportsSections($templateKey)) {
            return [];
        }

        $supported = $registry->supportedSections($templateKey);
        $sales = $registry->defaultSalesSections($templateKey);

        return match ($stepType) {
            'optin' => $sales !== []
                ? array_values(array_diff($supported, $sales))
                : ($registry->defaultEnabledSections($templateKey) ?: $supported),
            'sales_page' => $sales !== [] ? $sales : $supported,
            'thank_you' => $supported,
            default => [],
        };
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
