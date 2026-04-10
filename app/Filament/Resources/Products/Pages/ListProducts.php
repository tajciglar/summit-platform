<?php

namespace App\Filament\Resources\Products\Pages;

use App\Filament\Resources\Products\ProductResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;
use Filament\Schemas\Components\Tabs\Tab;
use Illuminate\Database\Eloquent\Builder;

class ListProducts extends ListRecords
{
    protected static string $resource = ProductResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }

    public function getTabs(): array
    {
        return [
            'all' => Tab::make('All'),

            'summit' => Tab::make('Summit Products')
                ->modifyQueryUsing(fn (Builder $query) => $query->whereHas('steps', fn (Builder $q) => $q->whereIn('step_type', ['optin', 'sales_page', 'checkout']))),

            'bump' => Tab::make('Bump Products')
                ->modifyQueryUsing(fn (Builder $query) => $query->whereHas('stepBumps')),

            'upsell' => Tab::make('Upsell Products')
                ->modifyQueryUsing(fn (Builder $query) => $query->whereHas('steps', fn (Builder $q) => $q->whereIn('step_type', ['upsell', 'downsell']))),
        ];
    }
}
