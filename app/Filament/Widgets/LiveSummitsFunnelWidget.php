<?php

namespace App\Filament\Widgets;

use App\Models\Domain;
use App\Models\Summit;
use App\Services\Analytics\FunnelMetrics;
use Filament\Facades\Filament;
use Filament\Widgets\Widget;
use Illuminate\Support\Collection;

class LiveSummitsFunnelWidget extends Widget
{
    protected string $view = 'filament.widgets.live-summits-funnel';

    protected int|string|array $columnSpan = 'full';

    /**
     * @return Collection<int, array{summit: Summit, report: array}>
     */
    public function getData(): Collection
    {
        $domain = Filament::getTenant();
        if (! $domain instanceof Domain) {
            return collect();
        }

        $summits = Summit::query()
            ->withoutGlobalScopes()
            ->where('domain_id', $domain->getKey())
            ->where('pre_summit_starts_at', '<=', now())
            ->where('ends_at', '>=', now())
            ->orderBy('title')
            ->get();

        $metrics = app(FunnelMetrics::class);

        return $summits->map(fn (Summit $summit) => [
            'summit' => $summit,
            'report' => $metrics->cachedReportForSummit($summit),
        ]);
    }
}
