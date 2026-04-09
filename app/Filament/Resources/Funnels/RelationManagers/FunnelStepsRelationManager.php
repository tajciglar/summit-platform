<?php

namespace App\Filament\Resources\Funnels\RelationManagers;

use App\Enums\BlockType;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Get;
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
                    ->required(),
                Select::make('product_id')
                    ->relationship('product', 'name')
                    ->searchable()
                    ->preload()
                    ->placeholder('No product'),
                TextInput::make('sort_order')->numeric()->default(0),
                Toggle::make('is_published')->default(true),

                Section::make('Page Blocks')
                    ->description('Compose your page from blocks')
                    ->schema([
                        Repeater::make('content.blocks')
                            ->label('')
                            ->schema([
                                Select::make('type')
                                    ->options(BlockType::options())
                                    ->required()
                                    ->reactive()
                                    ->columnSpanFull(),
                                ...self::blockDataFields(),
                            ])
                            ->itemLabel(fn (array $state): ?string => isset($state['type']) ? BlockType::tryFrom($state['type'])?->label() : 'New Block')
                            ->addActionLabel('Add Block')
                            ->reorderable()
                            ->collapsible()
                            ->cloneable()
                            ->defaultItems(0),
                    ]),
            ]);
    }

    /** Generate conditionally visible block fields. */
    private static function blockDataFields(): array
    {
        $allFields = [];

        foreach (BlockType::cases() as $blockType) {
            foreach ($blockType->filamentFields() as $field) {
                $fieldName = $field->getName();
                $field = $field->statePath("data.{$fieldName}");
                $field = $field->visible(fn (Get $get): bool => $get('type') === $blockType->value);
                $allFields[$blockType->value.'.'.$fieldName] = $field;
            }
        }

        return array_values($allFields);
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
