<?php

namespace App\Filament\Resources\FunnelSteps;

use App\Enums\BlockType;
use App\Filament\Resources\FunnelSteps\RelationManagers\BumpsRelationManager;
use App\Models\FunnelStep;
use App\Services\Templates\TemplateBlockFactory;
use App\Support\CurrentSummit;
use BackedEnum;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Facades\Filament;
use Filament\Forms\Components\Builder;
use Filament\Forms\Components\Builder\Block;
use Filament\Forms\Components\ColorPicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Components\ViewField;
use Filament\Panel;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Grid;
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
        return $schema->columns(1)->components([
            self::metaSection(),
            self::designSection(),
            self::pageContentRow(),
        ]);
    }

    /**
     * Phase 1 visual-editor "Brand" panel — a compact collapsible section
     * exposing the design-token override knobs (colors + fonts). Values are
     * written to the `page_overrides.tokens` JSON and consumed by the
     * template's root via CSS custom properties.
     */
    protected static function designSection(): Section
    {
        $fontOptions = [
            'Fraunces' => 'Fraunces',
            'Cormorant Garamond' => 'Cormorant Garamond',
            'Playfair Display' => 'Playfair Display',
            'Inter' => 'Inter',
            'DM Sans' => 'DM Sans',
            'Poppins' => 'Poppins',
            'Nunito' => 'Nunito',
        ];

        return Section::make('Design')
            ->description('Brand colors and typography — live updates the preview')
            ->collapsible()
            ->collapsed()
            ->columnSpanFull()
            ->columns(['default' => 1, 'md' => 6])
            ->components([
                ColorPicker::make('page_overrides.tokens.palette.primary')
                    ->label('Primary')
                    ->hex()
                    ->live(debounce: 500)
                    ->columnSpan(1),
                ColorPicker::make('page_overrides.tokens.palette.accent')
                    ->label('Accent')
                    ->hex()
                    ->live(debounce: 500)
                    ->columnSpan(1),
                ColorPicker::make('page_overrides.tokens.palette.ink')
                    ->label('Text')
                    ->hex()
                    ->live(debounce: 500)
                    ->columnSpan(1),
                ColorPicker::make('page_overrides.tokens.palette.paper')
                    ->label('Background')
                    ->hex()
                    ->live(debounce: 500)
                    ->columnSpan(1),
                Select::make('page_overrides.tokens.headingFont')
                    ->label('Heading font')
                    ->options($fontOptions)
                    ->native(false)
                    ->live()
                    ->placeholder('Template default')
                    ->columnSpan(1),
                Select::make('page_overrides.tokens.bodyFont')
                    ->label('Body font')
                    ->options($fontOptions)
                    ->native(false)
                    ->live()
                    ->placeholder('Template default')
                    ->columnSpan(1),
            ]);
    }

    /**
     * Meta row: Name / URL slug / Step type / Order.
     * `is_published` rides along here too (rendered compactly) so we don't
     * need a separate publish-section chrome — the live URL pill is rendered
     * in the page blade above the form.
     */
    protected static function metaSection(): Section
    {
        return Section::make()
            ->key('meta')
            ->columnSpanFull()
            ->columns(['default' => 1, 'md' => 4])
            ->components([
                TextInput::make('name')
                    ->required()
                    ->maxLength(500)
                    ->columnSpan(1),
                TextInput::make('slug')
                    ->label('URL slug')
                    ->required()
                    ->maxLength(255)
                    ->prefix(fn (?FunnelStep $record): string => $record?->funnel ? '/'.$record->funnel->slug.'/' : '/')
                    ->columnSpan(1),
                Select::make('step_type')
                    ->options(self::stepTypeOptions())
                    ->required()
                    ->native(false)
                    ->live()
                    ->columnSpan(1),
                TextInput::make('sort_order')
                    ->label('Order')
                    ->numeric()
                    ->default(0)
                    ->columnSpan(1),
                Toggle::make('is_published')
                    ->label('Published')
                    ->inline(false)
                    ->default(false)
                    ->columnSpan(['default' => 1, 'md' => 4]),
                // Product linkage is optional per step_type. Hidden for
                // optin / thank-you; shown for any step that actually
                // sells something: checkout (the main offer), sales_page
                // (e.g. a VIP upgrade page), upsell, downsell.
                Select::make('product_id')
                    ->label('Product')
                    ->helperText('Checkout = main offer. Sales page = VIP upgrade. Upsell / downsell = the single product being offered.')
                    ->relationship('product', 'name')
                    ->searchable()
                    ->preload()
                    ->placeholder('No product linked')
                    ->visible(fn (Get $get): bool => in_array($get('step_type'), ['checkout', 'sales_page', 'upsell', 'downsell'], true))
                    ->columnSpan(['default' => 1, 'md' => 4]),
            ]);
    }

    protected static function pageContentRow(): Grid
    {
        return Grid::make(2)
            ->columnSpanFull()
            ->schema([
                Section::make('Page content blocks')
                    ->key('page-content-blocks')
                    ->columnSpan(1)
                    ->description(fn (Get $get): string => is_array($get('page_content'))
                        ? count($get('page_content')).' blocks'
                        : '0 blocks')
                    ->components([
                        ViewField::make('blocks_empty_state')
                            ->view('filament.components.step-blocks-empty-state')
                            ->visible(fn (Get $get): bool => ! is_array($get('page_content')) || count($get('page_content')) === 0),

                        Builder::make('page_content')
                            ->label('')
                            ->blocks(fn (?FunnelStep $record) => self::builderBlocks($record))
                            ->addActionLabel('Add block')
                            ->collapsible()
                            ->blockNumbers(false)
                            ->visible(fn (Get $get): bool => is_array($get('page_content')) && count($get('page_content')) > 0),
                    ]),

                ViewField::make('step_preview')
                    ->view('filament.components.step-preview-iframe')
                    ->columnSpan(1),
            ]);
    }

    /** @return array<string, string> */
    protected static function stepTypeOptions(): array
    {
        return [
            'optin' => 'Opt-in',
            'sales_page' => 'Sales page',
            'checkout' => 'Checkout',
            'upsell' => 'Upsell',
            'downsell' => 'Downsell',
            'thank_you' => 'Thank you',
        ];
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
                SelectFilter::make('step_type')->options(self::stepTypeOptions()),
                TernaryFilter::make('is_published'),
            ])
            ->recordActions([
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
            'funnel.summit',
            fn ($q) => $q->where('domain_id', $tenant->getKey()),
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

    /**
     * Default Filament behavior fires `funnel()->associate($tenant)` on create.
     * Our tenant is a Domain (not a Funnel), so that would overwrite `funnel_id`
     * with the domain's UUID and trip the FK. We keep the read scoping above
     * and rely on the form's `funnel_id` field to set the correct value.
     */
    public static function observeTenancyModelCreation(Panel $panel): void {}

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListFunnelSteps::route('/'),
            'create' => Pages\CreateFunnelStep::route('/create'),
            'view' => Pages\ViewFunnelStep::route('/{record}'),
            'edit' => Pages\EditFunnelStep::route('/{record}/edit'),
        ];
    }

    public static function getRelations(): array
    {
        return [
            BumpsRelationManager::class,
        ];
    }

    /**
     * Builder blocks for a given step:
     *   - Generated content (has template_key): one block per top-level section
     *     in that template's jsonSchema, with fields auto-built from the schema.
     *   - Legacy / hand-built: fall back to the generic BlockType enum.
     */
    public static function builderBlocks(?FunnelStep $record): array
    {
        $pageContent = $record?->page_content;
        $templateKey = is_array($pageContent) ? ($pageContent['template_key'] ?? null) : null;

        if (is_string($templateKey)) {
            return app(TemplateBlockFactory::class)->blocksForStep($record);
        }

        return collect(BlockType::cases())
            ->map(fn (BlockType $type) => Block::make($type->value)
                ->label($type->label())
                ->icon($type->icon())
                ->schema($type->filamentFields()))
            ->all();
    }
}
