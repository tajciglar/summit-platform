<?php

namespace App\Filament\Resources\Funnels\RelationManagers;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;

class FunnelStepsRelationManager extends RelationManager
{
    protected static string $relationship = 'steps';

    protected static ?string $title = 'Pages';

    public static function getBadge(Model $ownerRecord, string $pageClass): ?string
    {
        return (string) $ownerRecord->steps()->count();
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('title')
                    ->required(),
                TextInput::make('slug')
                    ->required(),
                Select::make('type')
                    ->options([
                        'optin' => 'Opt-in',
                        'checkout' => 'Checkout',
                        'upsell' => 'Upsell',
                        'thank_you' => 'Thank You',
                    ])
                    ->required(),
                TextInput::make('sort_order')
                    ->numeric()
                    ->default(0),
                Toggle::make('is_active')
                    ->default(true),
                Toggle::make('is_published')
                    ->default(false),
                TextInput::make('headline'),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->reorderable('sort_order')
            ->defaultSort('sort_order')
            ->columns([
                TextColumn::make('title')
                    ->searchable(),
                TextColumn::make('slug'),
                TextColumn::make('type')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'optin' => 'info',
                        'checkout' => 'success',
                        'upsell' => 'warning',
                        'thank_you' => 'gray',
                        default => 'gray',
                    }),
                TextColumn::make('sort_order')
                    ->numeric()
                    ->sortable(),
                IconColumn::make('is_active')
                    ->boolean(),
                ToggleColumn::make('is_published'),
            ])
            ->headerActions([
                CreateAction::make(),
            ])
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
