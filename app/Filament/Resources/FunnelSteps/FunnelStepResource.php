<?php

namespace App\Filament\Resources\FunnelSteps;

use App\Filament\Resources\FunnelSteps\Pages;
use App\Models\FunnelStep;
use BackedEnum;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use App\Enums\BlockType;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Forms\Components\Builder;
use Filament\Forms\Components\Builder\Block;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

class FunnelStepResource extends Resource
{
    protected static ?string $model = FunnelStep::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static string|\UnitEnum|null $navigationGroup = 'Funnels';

    protected static ?int $navigationSort = 20;

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Step')
                ->columns(2)
                ->components([
                    Select::make('funnel_id')
                        ->label('Funnel')
                        ->relationship('funnel', 'name')
                        ->required()
                        ->searchable()
                        ->preload(),
                    Select::make('step_type')
                        ->options([
                            'optin' => 'Opt-in',
                            'sales_page' => 'Sales page',
                            'checkout' => 'Checkout',
                            'upsell' => 'Upsell',
                            'downsell' => 'Downsell',
                            'thank_you' => 'Thank you',
                        ])
                        ->required()
                        ->native(false),
                    TextInput::make('name')->required()->maxLength(500),
                    TextInput::make('slug')->required()->maxLength(255),
                    Select::make('product_id')
                        ->label('Product (for checkout/upsell)')
                        ->relationship('product', 'name')
                        ->searchable()
                        ->preload()
                        ->placeholder('No product linked'),
                    TextInput::make('sort_order')->numeric()->default(0),
                    Toggle::make('is_published')->default(false),
                ]),

            Section::make('Page content')
                ->description('The block tree rendered at /{summit}/{funnel}/{step}. Reorder, add, and remove blocks inline.')
                ->components([
                    Builder::make('page_content')
                        ->hiddenLabel()
                        ->blocks(self::pageContentBlocks())
                        ->blockNumbers(false)
                        ->collapsible()
                        ->collapsed()
                        ->cloneable()
                        ->addActionLabel('Add block')
                        ->reorderableWithButtons(),
                ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->weight('bold'),
                TextColumn::make('funnel.name')->label('Funnel')->searchable()->toggleable(),
                TextColumn::make('step_type')
                    ->badge()
                    ->formatStateUsing(fn (string $state) => str_replace('_', ' ', $state))
                    ->color(fn (string $state): string => match ($state) {
                        'optin' => 'info',
                        'sales_page' => 'primary',
                        'checkout' => 'success',
                        'upsell', 'downsell' => 'warning',
                        'thank_you' => 'gray',
                        default => 'gray',
                    }),
                TextColumn::make('product.name')->label('Product')->toggleable(),
                TextColumn::make('sort_order')->alignCenter()->sortable(),
                IconColumn::make('is_published')->boolean(),
            ])
            ->filters([
                SelectFilter::make('funnel_id')
                    ->relationship('funnel', 'name')
                    ->label('Funnel')
                    ->preload(),
                SelectFilter::make('step_type')->options([
                    'optin' => 'Opt-in',
                    'sales_page' => 'Sales page',
                    'checkout' => 'Checkout',
                    'upsell' => 'Upsell',
                    'downsell' => 'Downsell',
                    'thank_you' => 'Thank you',
                ]),
                TernaryFilter::make('is_published'),
            ])
            ->recordActions([
                ViewAction::make(),
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->reorderable('sort_order')
            ->defaultSort('sort_order');
    }

    /**
     * FunnelStep has no summit_id of its own — tenant-scope through the funnel.
     */
    public static function scopeEloquentQueryToTenant(
        \Illuminate\Database\Eloquent\Builder $query,
        ?\Illuminate\Database\Eloquent\Model $tenant,
    ): \Illuminate\Database\Eloquent\Builder {
        $tenant ??= \Filament\Facades\Filament::getTenant();

        if (! $tenant) {
            return $query;
        }

        return $query->whereHas('funnel', fn ($q) => $q->whereKey($tenant->getKey()));
    }

    public static function getTenantOwnershipRelationshipName(): string
    {
        return 'funnel';
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListFunnelSteps::route('/'),
            'create' => Pages\CreateFunnelStep::route('/create'),
            'view' => Pages\ViewFunnelStep::route('/{record}'),
            'edit' => Pages\EditFunnelStep::route('/{record}/edit'),
        ];
    }

    /**
     * Build one Filament Builder block per BlockType enum case.
     */
    private static function pageContentBlocks(): array
    {
        return collect(BlockType::cases())
            ->map(fn (BlockType $type) => Block::make($type->value)
                ->label($type->label())
                ->icon($type->icon())
                ->schema($type->filamentFields()))
            ->all();
    }
}
