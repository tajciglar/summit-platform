<?php

namespace App\Filament\Pages;

use App\Filament\Widgets\LiveSummitsFunnelWidget;
use Filament\Pages\Dashboard as BaseDashboard;

class Dashboard extends BaseDashboard
{
    public function getWidgets(): array
    {
        return [
            LiveSummitsFunnelWidget::class,
        ];
    }

    public function getColumns(): int|array
    {
        return 1;
    }
}
