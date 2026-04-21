<?php

namespace App\Filament\Resources\FunnelSteps;

use App\Enums\BlockType;
use App\Models\FunnelStep;
use App\Support\CurrentSummit;
use BackedEnum;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Facades\Filament;
use Filament\Forms\Components\Builder;
use Filament\Forms\Components\Builder\Block;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Components\ViewField;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;

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
            Section::make('Live landing page')
                ->description('What visitors see right now')
                ->visible(fn (Get $get): bool => $get('step_type') === 'optin')
                ->components([
                    ViewField::make('live_landing_card')
                        ->view('filament.components.live-landing-card'),
                ]),

            Section::make('Step details')
                ->description('Identity, type, and product link')
                ->columns(3)
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
                        ->native(false)
                        ->live(),
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

            Section::make('Generated landing page')
                ->description('This page was built by the AI landing-page pipeline. Edit sections in the draft editor.')
                ->visible(fn (?FunnelStep $record): bool => $record !== null && self::isGeneratedContent($record->page_content))
                ->components([
                    ViewField::make('generated_content_card')
                        ->view('filament.components.step-generated-content-card'),
                ]),

            Section::make('Page content blocks')
                ->description(fn (Get $get): string => is_array($get('page_content'))
                    ? count($get('page_content')).' blocks'
                    : 'empty')
                ->visible(fn (?FunnelStep $record): bool => $record === null || ! self::isGeneratedContent($record->page_content))
                ->collapsed()
                ->components([
                    Builder::make('page_content')
                        ->blocks(self::pageContentBlocks())
                        ->addActionLabel('Add block')
                        ->collapsible()
                        ->dehydrateStateUsing(fn ($state) => self::coerceToBuilderState($state))
                        ->afterStateHydrated(fn ($component, $state) => $component->state(self::coerceToBuilderState($state))),
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
     * FunnelStep → Funnel → Summit → Domains. Tenant is Domain. When a
     * specific summit is picked in the tenant dropdown, further narrow to
     * that summit's funnels.
     */
    public static function scopeEloquentQueryToTenant(
        \Illuminate\Database\Eloquent\Builder $query,
        ?Model $tenant,
    ): \Illuminate\Database\Eloquent\Builder {
        $tenant ??= Filament::getTenant();

        if (! $tenant) {
            return $query;
        }

        $query->whereHas(
            'funnel.summit.domains',
            fn ($q) => $q->whereKey($tenant->getKey()),
        );

        if ($summitId = CurrentSummit::getId()) {
            $query->whereHas('funnel', fn ($q) => $q->where('summit_id', $summitId));
        }

        return $query;
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

    /**
     * Filament Builder expects a sequential list of {type, data} entries.
     * Landing-page-generator output stores a different shape (e.g.
     * {"content": {...}}). For legacy shapes we start the Builder empty
     * rather than crashing — the operator can rebuild from scratch or
     * regenerate via the Landing Pages UI.
     *
     * @param  mixed  $state
     * @return array<int, array{type: string, data: array}>
     */
    public static function coerceToBuilderState($state): array
    {
        if (! is_array($state) || empty($state)) {
            return [];
        }

        // Already a sequential list
        if (array_is_list($state)) {
            return array_values(array_filter(
                $state,
                fn ($item) => is_array($item) && isset($item['type']),
            ));
        }

        // Associative map → not Builder-compatible (likely generator output)
        return [];
    }

    /**
     * Generator-published pages store `page_content` as an associative array
     * with a `template_key`. Hand-built pages use a sequential Builder list.
     * This lets the form swap the Builder out for an info card + link to the
     * draft editor so operators get the rich per-section editing experience.
     *
     * @param  mixed  $state
     */
    public static function isGeneratedContent($state): bool
    {
        return is_array($state) && ! empty($state) && isset($state['template_key']);
    }
}
