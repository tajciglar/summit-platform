<?php

namespace App\Filament\Resources\Funnels\RelationManagers;

use App\Enums\StepTemplate;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Get;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
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
                TextInput::make('name')->required()->maxLength(500),
                TextInput::make('slug')->required()->maxLength(255),
                Select::make('step_type')
                    ->options([
                        'optin' => 'Opt-in',
                        'sales_page' => 'Sales Page',
                        'checkout' => 'Checkout',
                        'upsell' => 'Upsell',
                        'downsell' => 'Downsell',
                        'thank_you' => 'Thank You',
                    ])
                    ->required()
                    ->reactive(),
                Select::make('template')
                    ->options(fn (Get $get) => StepTemplate::optionsForType($get('step_type')))
                    ->default('default')
                    ->reactive(),
                Select::make('product_id')
                    ->relationship('product', 'name')
                    ->searchable()
                    ->preload()
                    ->placeholder('No product'),
                TextInput::make('sort_order')->numeric()->default(0),
                Toggle::make('is_published')->default(true),

                Section::make('Page Content')
                    ->schema(fn (Get $get) => StepTemplate::filamentFields($get('template')))
                    ->collapsible(),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->reorderable('sort_order')
            ->defaultSort('sort_order')
            ->columns([
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
            ->headerActions([CreateAction::make()])
            ->recordActions([EditAction::make()])
            ->toolbarActions([
                BulkActionGroup::make([DeleteBulkAction::make()]),
            ]);
    }
}
