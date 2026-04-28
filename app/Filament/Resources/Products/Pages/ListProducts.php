<?php

namespace App\Filament\Resources\Products\Pages;

use App\Filament\Resources\Products\ProductResource;
use App\Models\Product;
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
            CreateAction::make()
                ->url(fn (): string => ProductResource::getUrl('create')),
        ];
    }

    public function getTabs(): array
    {
        $counts = Product::query()
            ->selectRaw('kind, COUNT(*) as c')
            ->groupBy('kind')
            ->pluck('c', 'kind');

        $badge = fn (?int $n): ?string => $n ? (string) $n : null;

        return [
            'all' => Tab::make('All products')
                ->icon('heroicon-o-squares-2x2')
                ->badge(Product::query()->count() ?: null),

            'main' => Tab::make('Main products')
                ->icon('heroicon-o-cube')
                ->badge($badge($counts['main'] ?? 0))
                ->modifyQueryUsing(fn (Builder $query) => $query->where('kind', 'main')),

            'bumps' => Tab::make('Order bumps')
                ->icon('heroicon-o-plus-circle')
                ->badge($badge($counts['bump'] ?? 0))
                ->modifyQueryUsing(fn (Builder $query) => $query->where('kind', 'bump')),

            'upsells' => Tab::make('Upsells')
                ->icon('heroicon-o-arrow-trending-up')
                ->badge($badge($counts['upsell'] ?? 0))
                ->modifyQueryUsing(fn (Builder $query) => $query->where('kind', 'upsell')),

            'combos' => Tab::make('Combos')
                ->icon('heroicon-o-squares-plus')
                ->badge($badge($counts['combo'] ?? 0))
                ->modifyQueryUsing(fn (Builder $query) => $query->where('kind', 'combo')),
        ];
    }
}
