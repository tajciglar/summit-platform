<?php

namespace App\Filament\Widgets;

use App\Models\Summit;
use Filament\Widgets\Widget;
use Illuminate\Support\Collection;

class SummitComparisonWidget extends Widget
{
    protected static ?int $sort = 4;

    protected int|string|array $columnSpan = 'full';

    protected string $view = 'filament.widgets.summit-comparison';

    public function getData(): Collection
    {
        return Summit::where('status', 'published')
            ->withCount(['optins', 'orders'])
            ->withSum('orders as revenue_cents', 'total_cents')
            ->orderByDesc('pre_summit_starts_at')
            ->limit(10)
            ->get()
            ->map(function (Summit $s) {
                $optinRate = $s->optins_count > 0 && $s->orders_count > 0
                    ? round(($s->orders_count / $s->optins_count) * 100, 2)
                    : 0;
                $aov = $s->orders_count > 0
                    ? round(($s->revenue_cents ?? 0) / $s->orders_count / 100, 2)
                    : 0;

                return [
                    'id' => $s->id,
                    'title' => $s->title,
                    'type' => $s->summit_type,
                    'optins' => $s->optins_count,
                    'orders' => $s->orders_count,
                    'revenue' => ($s->revenue_cents ?? 0) / 100,
                    'conversion' => $optinRate,
                    'aov' => $aov,
                ];
            });
    }
}
