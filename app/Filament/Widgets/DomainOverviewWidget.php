<?php

namespace App\Filament\Widgets;

use App\Models\Domain;
use Filament\Widgets\Widget;
use Illuminate\Support\Collection;

class DomainOverviewWidget extends Widget
{
    protected static ?int $sort = -2;

    protected int | string | array $columnSpan = 'full';

    protected string $view = 'filament.widgets.domain-overview-widget';

    public function getDomains(): Collection
    {
        return Domain::withCount([
            'funnels',
            'funnels as active_funnels_count' => fn ($query) => $query->where('is_active', true),
        ])->get();
    }
}
