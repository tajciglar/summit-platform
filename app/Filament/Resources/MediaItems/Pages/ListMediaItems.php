<?php

namespace App\Filament\Resources\MediaItems\Pages;

use App\Enums\MediaCategory;
use App\Filament\Resources\MediaItems\MediaItemResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;
use Filament\Schemas\Components\Tabs\Tab;
use Illuminate\Database\Eloquent\Builder;

class ListMediaItems extends ListRecords
{
    protected static string $resource = MediaItemResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
    }

    /**
     * One tab per MediaCategory + "All" so operators see media grouped by the
     * context it belongs to (Landing page / Product / Speakers / Brand /
     * Downloadables) instead of one flat list.
     *
     * @return array<string, Tab>
     */
    public function getTabs(): array
    {
        $tabs = ['all' => Tab::make('All')];

        foreach (MediaCategory::cases() as $category) {
            $tabs[$category->value] = Tab::make($category->label())
                ->modifyQueryUsing(fn (Builder $query) => $query->where('category', $category->value));
        }

        return $tabs;
    }
}
