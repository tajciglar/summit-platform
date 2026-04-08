<?php

namespace App\Filament\Resources\FunnelSteps\RelationManagers;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class BumpsRelationManager extends RelationManager
{
    protected static string $relationship = 'bumps';

    protected static ?string $title = 'Order Bumps';

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('product_id')
                    ->relationship('product', 'name')
                    ->searchable()
                    ->preload()
                    ->required(),
                TextInput::make('headline')->maxLength(500),
                Textarea::make('description')->rows(2),
                TextInput::make('checkbox_label')
                    ->placeholder('Yes! Add this to my order'),
                Repeater::make('bullets')
                    ->schema([
                        TextInput::make('text')->required(),
                    ])
                    ->itemLabel(fn (array $state): ?string => $state['text'] ?? null)
                    ->collapsible()
                    ->defaultItems(0),
                TextInput::make('image_url')->label('Image URL')->url(),
                TextInput::make('sort_order')->numeric()->default(0),
                Toggle::make('is_active')->default(true),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->reorderable('sort_order')
            ->defaultSort('sort_order')
            ->columns([
                TextColumn::make('headline')->limit(40),
                TextColumn::make('product.name')->label('Product'),
                IconColumn::make('is_active')->boolean(),
                TextColumn::make('sort_order')->numeric(),
            ])
            ->headerActions([CreateAction::make()])
            ->recordActions([EditAction::make()])
            ->toolbarActions([
                BulkActionGroup::make([DeleteBulkAction::make()]),
            ]);
    }
}
