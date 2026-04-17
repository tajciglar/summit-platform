<?php

namespace App\Filament\Resources\Summits\RelationManagers;

use App\Filament\Resources\Orders\OrderResource;
use App\Models\Order;
use Filament\Actions\Action;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class OrdersRelationManager extends RelationManager
{
    protected static string $relationship = 'orders';

    protected static ?string $title = 'Orders';

    protected static ?string $recordTitleAttribute = 'order_number';

    public function form(Schema $schema): Schema
    {
        // Orders are created by checkout, never by hand.
        return $schema->components([]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('order_number')
                    ->label('Order #')
                    ->searchable()
                    ->weight('bold')
                    ->copyable(),
                TextColumn::make('user.email')
                    ->label('Customer')
                    ->searchable()
                    ->description(fn (Order $record): ?string => trim(($record->user?->first_name ?? '').' '.($record->user?->last_name ?? '')) ?: null),
                TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'completed' => 'success',
                        'pending' => 'warning',
                        'refunded' => 'gray',
                        'partial_refund' => 'warning',
                        'failed' => 'danger',
                        default => 'gray',
                    }),
                TextColumn::make('phase_at_purchase')
                    ->label('Phase')
                    ->badge()
                    ->formatStateUsing(fn (?string $state) => $state ? str_replace('_', ' ', $state) : '—')
                    ->color('gray')
                    ->toggleable(),
                TextColumn::make('total_cents')
                    ->label('Total')
                    ->money('USD', divideBy: 100)
                    ->alignEnd()
                    ->sortable(),
                TextColumn::make('completed_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('status')->options([
                    'pending' => 'Pending',
                    'completed' => 'Completed',
                    'refunded' => 'Refunded',
                    'partial_refund' => 'Partial refund',
                    'failed' => 'Failed',
                ]),
            ])
            ->headerActions([])
            ->recordActions([
                Action::make('view')
                    ->icon('heroicon-o-eye')
                    ->url(fn (Order $record) => OrderResource::getUrl('view', ['record' => $record])),
            ])
            ->defaultSort('created_at', 'desc')
            ->emptyStateHeading('No orders yet')
            ->emptyStateDescription('Completed checkouts will appear here.')
            ->emptyStateIcon('heroicon-o-banknotes');
    }
}
