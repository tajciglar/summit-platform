<?php

namespace App\Filament\Resources\Contacts;

use App\Models\Summit;
use Filament\Actions\BulkAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class ContactsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn (Builder $query) => $query->withCount([
                'orders as paid_orders_count' => fn (Builder $q) => $q->whereIn('status', ['completed', 'partial_refund']),
            ]))
            ->columns([
                TextColumn::make('email')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('first_name')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('country')
                    ->label('Country')
                    ->placeholder('—')
                    ->sortable()
                    ->toggleable(),
                TextColumn::make('summits')
                    ->label('Summits')
                    ->badge()
                    ->state(function ($record) {
                        return Summit::query()
                            ->whereIn('id', $record->optins()->whereNotNull('summit_id')->pluck('summit_id')->unique())
                            ->pluck('title')
                            ->all();
                    })
                    ->wrap(),
                IconColumn::make('is_buyer')
                    ->label('Buyer')
                    ->boolean()
                    ->getStateUsing(fn ($record): bool => ($record->paid_orders_count ?? 0) > 0)
                    ->sortable(query: fn (Builder $query, string $direction) => $query->orderBy('paid_orders_count', $direction)),
                TextColumn::make('optins_count')
                    ->counts('optins')
                    ->label('Optins')
                    ->sortable()
                    ->toggleable(),
                TextColumn::make('ac_contact_id')
                    ->label('AC ID')
                    ->placeholder('—')
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('failed_optins_count')
                    ->counts(['optins as failed_optins_count' => fn (Builder $q) => $q->where('ac_sync_status', 'failed')])
                    ->label('Failed syncs')
                    ->badge()
                    ->color(fn (int $state): string => $state > 0 ? 'danger' : 'gray')
                    ->placeholder('0')
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->since(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                SelectFilter::make('summits')
                    ->label('Summit')
                    ->placeholder('All summits')
                    ->options(fn () => Summit::query()->orderBy('title')->pluck('title', 'id')->all())
                    ->query(function (Builder $query, array $data): Builder {
                        if (empty($data['value'])) {
                            return $query;
                        }

                        return $query->whereHas('optins', fn (Builder $q) => $q->where('summit_id', $data['value']));
                    }),
                Filter::make('created_at')
                    ->schema([
                        DatePicker::make('from')->label('Created from'),
                        DatePicker::make('to')->label('Created to'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when($data['from'] ?? null, fn (Builder $q, $from) => $q->whereDate('created_at', '>=', $from))
                            ->when($data['to'] ?? null, fn (Builder $q, $to) => $q->whereDate('created_at', '<=', $to));
                    })
                    ->columns(2),
                TernaryFilter::make('is_buyer')
                    ->label('Buyer')
                    ->placeholder('All contacts')
                    ->trueLabel('Buyers')
                    ->falseLabel('Non-buyers')
                    ->queries(
                        true: fn (Builder $q) => $q->whereHas('orders', fn (Builder $o) => $o->whereIn('status', ['completed', 'partial_refund'])),
                        false: fn (Builder $q) => $q->whereDoesntHave('orders', fn (Builder $o) => $o->whereIn('status', ['completed', 'partial_refund'])),
                        blank: fn (Builder $q) => $q,
                    ),
            ])
            ->deferFilters(false)
            ->filtersTriggerAction(
                fn ($action) => $action
                    ->label('Filters')
                    ->icon('heroicon-o-funnel')
            )
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                    BulkAction::make('editCommon')
                        ->label('Edit selected')
                        ->schema([
                            TextInput::make('first_name')->label('First name'),
                            Select::make('country')
                                ->label('Country (ISO-2)')
                                ->options(self::countryOptions())
                                ->searchable(),
                        ])
                        ->action(function (array $data, Collection $records): void {
                            $payload = array_filter($data, fn ($v) => filled($v));
                            if (empty($payload)) {
                                return;
                            }
                            foreach ($records as $record) {
                                $record->update($payload);
                            }
                        })
                        ->deselectRecordsAfterCompletion(),
                ]),
            ]);
    }

    /**
     * @return array<string, string>
     */
    private static function countryOptions(): array
    {
        $codes = ['US', 'CA', 'GB', 'AU', 'NZ', 'IE', 'DE', 'FR', 'ES', 'IT', 'NL', 'SE', 'NO', 'DK', 'FI', 'CH', 'AT', 'BE', 'PT', 'PL'];

        return array_combine($codes, $codes);
    }
}
