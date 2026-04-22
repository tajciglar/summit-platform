<?php

namespace App\Filament\Widgets;

use App\Models\Domain;
use App\Models\Summit;
use App\Services\Analytics\FunnelMetrics;
use Filament\Facades\Filament;
use Filament\Widgets\Widget;
use Illuminate\Support\Collection;

class PastSummitsFunnelWidget extends Widget
{
    protected string $view = 'filament.widgets.past-summits-funnel';

    protected int|string|array $columnSpan = 'full';

    /** @var array<string, bool> Keyed by summit ID. */
    public array $expanded = [];

    public function toggleExpanded(string $summitId): void
    {
        $this->expanded[$summitId] = ! ($this->expanded[$summitId] ?? false);
    }

    /**
     * @return Collection<int, Summit>
     */
    public function getSummits(): Collection
    {
        $domain = Filament::getTenant();
        if (! $domain instanceof Domain) {
            return collect();
        }

        return Summit::query()
            ->withoutGlobalScopes()
            ->where('domain_id', $domain->getKey())
            ->where('ends_at', '<', now())
            ->orderByDesc('ends_at')
            ->get();
    }

    /**
     * @return array{counts:array, conversions:array, leaks:list<string>}
     */
    public function getReport(Summit $summit): array
    {
        return app(FunnelMetrics::class)->cachedReportForSummit($summit, ttl: 86400);
    }
}
