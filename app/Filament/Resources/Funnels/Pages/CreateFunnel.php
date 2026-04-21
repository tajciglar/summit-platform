<?php

namespace App\Filament\Resources\Funnels\Pages;

use App\Filament\Pages\Concerns\InjectsCurrentSummitOnCreate;
use App\Filament\Resources\Funnels\FunnelResource;
use App\Jobs\GenerateLandingPageBatchJob;
use App\Models\Funnel;
use App\Models\LandingPageBatch;
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
     * create the matching FunnelStep. If a skin was picked, also dispatch
     * a landing-page batch per step so operators land on a funnel that
     * already has steps + pages queued, not an empty shell.
     */
    protected function afterCreate(): void
    {
        /** @var Funnel $funnel */
        $funnel = $this->record;

        $sectionConfig = $funnel->section_config ?? [];
        $dispatched = 0;

        foreach (self::AUTO_STEP_TYPES as $stepType => $defaults) {
            $sections = $sectionConfig[$stepType] ?? [];
            if (! is_array($sections) || count($sections) === 0) {
                continue;
            }

            $step = $funnel->steps()->create([
                'step_type' => $stepType,
                'slug' => $defaults['slug'],
                'name' => $defaults['name'],
                'sort_order' => $defaults['sort_order'],
                'is_published' => false,
            ]);

            if ($funnel->template_key) {
                $batch = LandingPageBatch::create([
                    'summit_id' => $funnel->summit_id,
                    'funnel_id' => $funnel->id,
                    'funnel_step_id' => $step->id,
                    'status' => 'queued',
                    'template_pool' => [$funnel->template_key],
                    'versions_per_template' => [$funnel->template_key => 1],
                    'version_count' => 1,
                    'auto_publish' => true,
                    'published_by_user_id' => auth()->id(),
                ]);
                GenerateLandingPageBatchJob::dispatch($batch->id);
                $dispatched++;
            }
        }

        if ($dispatched > 0) {
            Notification::make()
                ->title('Generating '.$dispatched.' step'.($dispatched === 1 ? '' : 's'))
                ->body('Pages appear under each step when ready.')
                ->success()
                ->send();
        }
    }
}
