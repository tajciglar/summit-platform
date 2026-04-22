<?php

namespace App\Filament\Resources\Speakers\Pages;

use App\Filament\Resources\Speakers\SpeakerResource;
use App\Models\Summit;
use Filament\Actions\CreateAction;
use Filament\Facades\Filament;
use Filament\Resources\Pages\ListRecords;
use Filament\Schemas\Components\Tabs\Tab;
use Illuminate\Database\Eloquent\Builder;

class ListSpeakers extends ListRecords
{
    protected static string $resource = SpeakerResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make()
                ->url(fn (): string => SpeakerResource::getUrl('create')),
        ];
    }

    public function getTabs(): array
    {
        $domain = Filament::getTenant();

        $summitsQuery = Summit::query()->orderBy('title');
        if ($domain) {
            $summitsQuery->where('domain_id', $domain->getKey());
        }
        $summits = $summitsQuery->withCount('speakers')->get();

        $tabs = [
            'all' => Tab::make('All speakers')
                ->icon('heroicon-o-user-group')
                ->badge($summits->sum('speakers_count') ?: null),
        ];

        foreach ($summits as $summit) {
            $summitId = $summit->id;
            $tabs[(string) $summitId] = Tab::make($summit->title)
                ->icon('heroicon-o-calendar-days')
                ->badge($summit->speakers_count ?: null)
                ->modifyQueryUsing(fn (Builder $query) => $query->where('summit_id', $summitId));
        }

        return $tabs;
    }
}
