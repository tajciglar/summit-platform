<?php

namespace App\Filament\Resources\ChecklistTemplates\RelationManagers;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Grouping\Group;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;

class TemplateItemsRelationManager extends RelationManager
{
    protected static string $relationship = 'items';

    protected static ?string $title = 'Template Items';

    public static function getBadge(Model $ownerRecord, string $pageClass): ?string
    {
        return (string) $ownerRecord->items()->count();
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('category')
                    ->options([
                        'core_pages' => 'Core Pages',
                        'program_pages' => 'Program Pages',
                        'upgrade_pages' => 'Upgrade Pages',
                        'checkout_pages' => 'Checkout Pages',
                        'circle_links' => 'Circle Links',
                    ])
                    ->required(),
                TextInput::make('name')->required()->maxLength(500),
                Select::make('page_type')
                    ->options([
                        'optin' => 'Opt-in',
                        'upsell' => 'Upsell',
                        'checkout' => 'Checkout',
                        'bump' => 'Bump',
                        'thank_you' => 'Thank You',
                        'bonuses' => 'Bonuses',
                        'program' => 'Program Page',
                        'upgrade' => 'Upgrade',
                        'downsell' => 'Downsell',
                    ]),
                TextInput::make('sort_order')->numeric()->default(0),
                Textarea::make('notes')->rows(2),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->groups([
                Group::make('category')
                    ->label('Category')
                    ->getTitleFromRecordUsing(fn ($record): string => match ($record->category) {
                        'core_pages' => 'Core Pages',
                        'program_pages' => 'Program Pages',
                        'upgrade_pages' => 'Upgrade Pages',
                        'checkout_pages' => 'Checkout Pages',
                        'circle_links' => 'Circle Links',
                        default => $record->category,
                    }),
            ])
            ->defaultGroup('category')
            ->reorderable('sort_order')
            ->columns([
                TextColumn::make('name')->searchable(),
                TextColumn::make('page_type')->badge()->placeholder('—'),
                TextColumn::make('sort_order')->sortable(),
                TextColumn::make('notes')->limit(40)->placeholder('—'),
            ])
            ->headerActions([CreateAction::make()])
            ->recordActions([EditAction::make(), DeleteAction::make()])
            ->toolbarActions([
                BulkActionGroup::make([DeleteBulkAction::make()]),
            ]);
    }
}
