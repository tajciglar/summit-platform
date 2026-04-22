<?php

namespace App\Filament\Pages;

use App\Filament\Widgets\LiveSummitsFunnelWidget;
use App\Filament\Widgets\PastSummitsFunnelWidget;
use App\Filament\Widgets\SummitsWidget;
use Filament\Pages\Dashboard as BaseDashboard;

class Dashboard extends BaseDashboard
{
    public function getWidgets(): array
    {
        return [
            SummitsWidget::class,
            LiveSummitsFunnelWidget::class,
            PastSummitsFunnelWidget::class,
        ];
    }

    public function getColumns(): int|array
    {
        return 1;
    }
}
