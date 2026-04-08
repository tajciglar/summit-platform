<?php

namespace App\Filament\Resources\Products\RelationManagers;

use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class ProductPricesRelationManager extends RelationManager
{
    protected static string $relationship = 'prices';

    protected static ?string $title = 'Phase Pricing';

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('summit_phase')
                    ->options([
                        'pre_summit' => 'Pre-Summit',
                        'late_pre_summit' => 'Late Pre-Summit',
                        'during_summit' => 'During Summit',
                        'post_summit' => 'Post-Summit',
                    ])
                    ->required(),
                TextInput::make('amount_cents')
                    ->label('Price (cents)')
                    ->helperText('e.g. 4700 = $47.00')
                    ->required()
                    ->numeric()
                    ->minValue(0),
                TextInput::make('compare_at_cents')
                    ->label('Compare At (cents)')
                    ->helperText('Strikethrough price for urgency')
                    ->numeric(),
                TextInput::make('stripe_price_id')
                    ->label('Stripe Price ID'),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('summit_phase')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => str_replace('_', ' ', ucfirst($state))),
                TextColumn::make('amount_cents')
                    ->money('usd', divideBy: 100)
                    ->label('Price'),
                TextColumn::make('compare_at_cents')
                    ->money('usd', divideBy: 100)
                    ->label('Compare At')
                    ->placeholder('—'),
                TextColumn::make('stripe_price_id')->label('Stripe ID')->limit(20),
            ])
            ->headerActions([CreateAction::make()])
            ->recordActions([EditAction::make(), DeleteAction::make()]);
    }
}
