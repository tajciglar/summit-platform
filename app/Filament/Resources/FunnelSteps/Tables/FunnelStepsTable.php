<?php

namespace App\Filament\Resources\FunnelSteps\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Table;

class FunnelStepsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('funnel.name')->searchable(),
                TextColumn::make('name')->searchable(),
                TextColumn::make('slug'),
                TextColumn::make('step_type')
                    ->label('Type')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'optin' => 'info',
                        'sales_page' => 'primary',
                        'checkout' => 'success',
                        'upsell' => 'warning',
                        'downsell' => 'danger',
                        'thank_you' => 'gray',
                        default => 'gray',
                    }),
                TextColumn::make('template')->badge()->color('gray'),
                TextColumn::make('sort_order')->numeric()->sortable(),
                ToggleColumn::make('is_published'),
            ])
            ->recordActions([EditAction::make()])
            ->toolbarActions([
                BulkActionGroup::make([DeleteBulkAction::make()]),
            ]);
    }
}
