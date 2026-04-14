<?php

namespace App\Services\FunnelGenerator;

use App\Models\Funnel;
use App\Models\FunnelStep;
use App\Models\Summit;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class FunnelBlockMapper
{
    private const STEP_NAMES = [
        'optin' => 'Opt-in',
        'sales_page' => 'Sales Page',
        'upsell' => 'Upsell',
        'thank_you' => 'Thank You',
    ];

    /**
     * @param  array<string, array<int, array{type:string,version:int,props:array}>>  $output
     */
    public function persist(Summit $summit, string $name, array $output): Funnel
    {
        return DB::transaction(function () use ($summit, $name, $output) {
            $funnel = Funnel::create([
                'summit_id' => $summit->id,
                'slug' => Str::slug($name.'-'.now()->format('YmdHis')),
                'name' => $name,
                'description' => 'AI-generated '.now()->toDateString(),
                'target_phase' => 'pre_summit',
                'is_active' => false,
                'theme' => [],
            ]);

            $sort = 0;
            foreach (self::STEP_NAMES as $stepType => $label) {
                $blocks = $output[$stepType] ?? [];
                if ($blocks === []) {
                    continue;
                }

                FunnelStep::create([
                    'funnel_id' => $funnel->id,
                    'step_type' => $stepType,
                    'template' => 'default',
                    'slug' => $stepType === 'optin' ? 'optin' : str_replace('_', '-', $stepType),
                    'name' => $label,
                    'content' => ['blocks' => $blocks],
                    'sort_order' => $sort++,
                    'is_published' => false,
                ]);
            }

            return $funnel->load('steps');
        });
    }
}
