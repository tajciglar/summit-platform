<?php

namespace App\Filament\Resources\Products;

use App\Filament\Forms\Components\MediaPickerInput;
use App\Filament\Resources\Concerns\ScopesTenantViaSummitDomains;
use App\Models\Product;
use App\Support\CurrentSummit;
use BackedEnum;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Facades\Filament;
use Filament\Forms\Components\Placeholder;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Fieldset;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Support\HtmlString;
use Illuminate\Support\Str;

class ProductResource extends Resource
{
    use ScopesTenantViaSummitDomains;

    protected static ?string $model = Product::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedShoppingBag;

    protected static string|\UnitEnum|null $navigationGroup = 'Sales';

    protected static ?int $navigationSort = 10;

    protected static ?string $recordTitleAttribute = 'name';

    public static function getGloballySearchableAttributes(): array
    {
        return ['name', 'slug', 'category'];
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Basics')
                ->description('Name, URL slug, copy, and thumbnail. This is what buyers see.')
                ->icon(Heroicon::OutlinedCube)
                ->columns(2)
                ->components([
                    Select::make('summit_id')
                        ->label('Summit')
                        ->relationship(
                            'summit',
                            'title',
                            modifyQueryUsing: function ($query) {
                                $domain = Filament::getTenant();
                                if ($domain) {
                                    $query->where('domain_id', $domain->getKey());
                                }
                            },
                        )
                        ->default(fn () => CurrentSummit::getId())
                        ->hidden(fn (): bool => CurrentSummit::getId() !== null)
                        ->searchable()
                        ->preload()
                        ->placeholder('Cross-summit product')
                        ->helperText('Leave empty if this product is sold across multiple summits.')
                        ->columnSpanFull(),
                    TextInput::make('name')
                        ->required()->maxLength(500)
                        ->live(onBlur: true)
                        ->afterStateUpdated(function (string $operation, $state, callable $set): void {
                            if ($operation === 'create') {
                                $set('slug', Str::slug((string) $state));
                            }
                        }),
                    TextInput::make('slug')->required()->maxLength(255),
                    TextInput::make('category')
                        ->maxLength(100)
                        ->datalist(['vip_pass', 'bundle', 'recording', 'masterclass', 'coaching'])
                        ->placeholder('vip_pass')
                        ->helperText('Free-text tag. Common values: vip_pass, bundle, recording, masterclass.'),
                    TextInput::make('tier')
                        ->maxLength(100)
                        ->datalist(['basic', 'vip'])
                        ->placeholder('basic')
                        ->helperText('Access tier. Usually basic or vip.'),
                    Textarea::make('description')->rows(3)->columnSpanFull(),
                    MediaPickerInput::make('image_media_item_id')
                        ->category('product')
                        ->role('image')
                        ->label('Product image')
                        ->columnSpanFull(),
                ]),

            Section::make('How it sells')
                ->description("The product's role in the funnel and how it's billed.")
                ->icon(Heroicon::OutlinedShoppingCart)
                ->columns(2)
                ->components([
                    Select::make('kind')
                        ->label('Product kind')
                        ->options([
                            'standalone' => 'Standalone — sold on its own',
                            'bump' => 'Order bump — added at checkout',
                            'upsell' => 'Upsell — offered after purchase',
                            'combo' => 'Combo — bundles multiple products',
                        ])
                        ->default('standalone')
                        ->required()
                        ->native(false)
                        ->live(),
                    Select::make('product_type')
                        ->label('Billing')
                        ->options([
                            'one_time' => 'One-time purchase',
                            'subscription' => 'Subscription',
                        ])
                        ->default('one_time')
                        ->required()
                        ->native(false)
                        ->live(),
                    Select::make('billing_interval')
                        ->options([
                            'month' => 'Monthly',
                            'year' => 'Yearly',
                        ])
                        ->native(false)
                        ->visible(fn (callable $get): bool => $get('product_type') === 'subscription'),
                    Toggle::make('is_active')
                        ->default(true)
                        ->helperText('When off, the product is hidden everywhere.')
                        ->inline(false),
                    Toggle::make('grants_vip_access')
                        ->label('Grants VIP access')
                        ->helperText('Buyer unlocks VIP videos on purchase.')
                        ->inline(false),
                ]),

            Section::make('Combo contents')
                ->description('Bundle two or more products. Stripe still charges one line item per child at checkout.')
                ->icon(Heroicon::OutlinedSquares2x2)
                ->visible(fn (callable $get): bool => $get('kind') === 'combo')
                ->components([
                    Select::make('bundled_product_ids')
                        ->label('Products in this combo')
                        ->helperText('Pick 2+ products to bundle. At checkout, Stripe receives one line item per child product using its own stripe_price_id.')
                        ->multiple()
                        ->searchable()
                        ->preload()
                        ->live()
                        ->options(function () {
                            return Product::query()
                                ->where('kind', '!=', 'combo')
                                ->orderBy('name')
                                ->pluck('name', 'id')
                                ->all();
                        }),
                    self::dollarInput('combo_discount_cents', 'Combo discount')
                        ->helperText("Optional. Subtracted from the sum of children's current-phase prices.")
                        ->live(onBlur: true),
                    Placeholder::make('combo_pricing_preview')
                        ->label('Pricing preview')
                        ->content(function (callable $get): HtmlString {
                            $ids = (array) ($get('bundled_product_ids') ?? []);
                            if (empty($ids)) {
                                return new HtmlString('<span class="text-sm text-gray-500 italic">Pick products to see live totals per phase.</span>');
                            }
                            $children = Product::query()->whereIn('id', $ids)->get();
                            $discount = (int) ($get('combo_discount_cents') ?? 0);
                            $phases = ['pre' => 'Pre-summit', 'late_pre' => 'Late pre', 'during' => 'During', 'post' => 'Post-summit'];

                            $rows = '';
                            foreach ($phases as $phase => $label) {
                                $base = (int) $children->sum(fn ($c) => (int) ($c->priceCentsForPhase($phase) ?? 0));
                                $total = max(0, $base - $discount);
                                $baseUsd = '$'.number_format($base / 100, 2);
                                $discUsd = '−$'.number_format($discount / 100, 2);
                                $totalUsd = '$'.number_format($total / 100, 2);

                                $rows .= <<<HTML
                                    <tr class="border-b border-gray-100 dark:border-white/5 last:border-0">
                                        <td class="py-1.5 pr-4 text-sm text-gray-600 dark:text-gray-400">{$label}</td>
                                        <td class="py-1.5 pr-4 text-right text-sm tabular-nums text-gray-500">{$baseUsd}</td>
                                        <td class="py-1.5 pr-4 text-right text-sm tabular-nums text-gray-500">{$discUsd}</td>
                                        <td class="py-1.5 text-right text-sm font-semibold tabular-nums text-gray-950 dark:text-white">{$totalUsd}</td>
                                    </tr>
                                HTML;
                            }

                            $childrenList = $children->map(fn ($c) => "<li class=\"text-sm text-gray-700 dark:text-gray-300\">{$c->name}</li>")->implode('');

                            return new HtmlString(<<<HTML
                                <div class="space-y-3">
                                    <div>
                                        <div class="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Children ({$children->count()})</div>
                                        <ul class="list-disc list-inside space-y-0.5">{$childrenList}</ul>
                                    </div>
                                    <table class="w-full">
                                        <thead>
                                            <tr class="border-b border-gray-200 dark:border-white/10">
                                                <th class="py-1.5 pr-4 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">Phase</th>
                                                <th class="py-1.5 pr-4 text-right text-[11px] font-semibold uppercase tracking-wide text-gray-400">Sum of children</th>
                                                <th class="py-1.5 pr-4 text-right text-[11px] font-semibold uppercase tracking-wide text-gray-400">Discount</th>
                                                <th class="py-1.5 text-right text-[11px] font-semibold uppercase tracking-wide text-gray-400">Combo total</th>
                                            </tr>
                                        </thead>
                                        <tbody>{$rows}</tbody>
                                    </table>
                                </div>
                            HTML);
                        }),
                ]),

            Section::make('Phase pricing')
                ->description('Price per summit phase. Leave blank to skip selling during that phase. "Compare" is the strike-through price buyers see.')
                ->icon(Heroicon::OutlinedTag)
                ->columns(2)
                ->visible(fn (callable $get): bool => $get('kind') !== 'combo')
                ->components([
                    Fieldset::make('Pre-summit')
                        ->columns(2)
                        ->schema([
                            self::dollarInput('price_pre_summit_cents', 'Price'),
                            self::dollarInput('compare_pre_summit_cents', 'Compare at'),
                        ]),
                    Fieldset::make('Late pre-summit')
                        ->columns(2)
                        ->schema([
                            self::dollarInput('price_late_pre_cents', 'Price'),
                            self::dollarInput('compare_late_pre_cents', 'Compare at'),
                        ]),
                    Fieldset::make('During summit')
                        ->columns(2)
                        ->schema([
                            self::dollarInput('price_during_cents', 'Price'),
                            self::dollarInput('compare_during_cents', 'Compare at'),
                        ]),
                    Fieldset::make('Post-summit')
                        ->columns(2)
                        ->schema([
                            self::dollarInput('price_post_summit_cents', 'Price'),
                            self::dollarInput('compare_post_summit_cents', 'Compare at'),
                        ]),
                ]),

            Section::make('Subscription intro pricing')
                ->description('Optional promotional pricing for the first N months.')
                ->icon(Heroicon::OutlinedSparkles)
                ->collapsed()
                ->columns(2)
                ->visible(fn (callable $get): bool => $get('product_type') === 'subscription')
                ->components([
                    self::dollarInput('intro_price_cents', 'Intro price')
                        ->helperText('Promotional intro price.'),
                    TextInput::make('intro_period_months')
                        ->label('Intro period (months)')
                        ->numeric()
                        ->minValue(1)
                        ->helperText('Months the intro price applies.'),
                ]),

            Section::make('Stripe integration')
                ->description('Product and price IDs from Stripe. Leave phases blank if you don\'t sell during that phase.')
                ->icon(Heroicon::OutlinedCreditCard)
                ->collapsed()
                ->visible(fn (callable $get): bool => $get('kind') !== 'combo')
                ->components([
                    TextInput::make('stripe_product_id')
                        ->label('Stripe product ID')
                        ->maxLength(255)
                        ->placeholder('prod_...'),
                    Fieldset::make('Stripe price IDs')
                        ->columns(4)
                        ->schema([
                            TextInput::make('stripe_price_pre_id')->label('Pre')->maxLength(255)->placeholder('price_...'),
                            TextInput::make('stripe_price_late_id')->label('Late pre')->maxLength(255)->placeholder('price_...'),
                            TextInput::make('stripe_price_during_id')->label('During')->maxLength(255)->placeholder('price_...'),
                            TextInput::make('stripe_price_post_id')->label('Post')->maxLength(255)->placeholder('price_...'),
                        ]),
                ]),
        ]);
    }

    /**
     * Money input that stores cents but shows dollars to the operator.
     */
    private static function dollarInput(string $name, string $label): TextInput
    {
        return TextInput::make($name)
            ->label($label)
            ->numeric()
            ->prefix('$')
            ->step('0.01')
            ->minValue(0)
            ->placeholder('0.00')
            ->formatStateUsing(
                fn (?int $state): ?string => $state !== null
                    ? number_format($state / 100, 2, '.', '')
                    : null,
            )
            ->dehydrateStateUsing(
                fn ($state): ?int => ($state === null || $state === '')
                    ? null
                    : (int) round(((float) $state) * 100),
            );
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->weight('bold')
                    ->description(fn (Product $record): ?string => $record->kind === 'combo'
                        ? count($record->bundled_product_ids ?? []).' bundled products'
                        : null),
                TextColumn::make('kind')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'combo' => 'primary',
                        'upsell' => 'warning',
                        'bump' => 'info',
                        default => 'gray',
                    })
                    ->icon(fn (string $state): string => match ($state) {
                        'combo' => 'heroicon-m-squares-2x2',
                        'upsell' => 'heroicon-m-arrow-trending-up',
                        'bump' => 'heroicon-m-plus-circle',
                        default => 'heroicon-m-cube',
                    }),
                TextColumn::make('summit.title')->label('Summit')->searchable()->toggleable(),
                TextColumn::make('category')->badge()->color('gray')->toggleable(),
                TextColumn::make('tier')
                    ->badge()
                    ->color(fn (?string $state): string => $state === 'vip' ? 'warning' : 'gray')
                    ->toggleable(),
                TextColumn::make('product_type')
                    ->badge()
                    ->formatStateUsing(fn (string $state) => str_replace('_', ' ', $state))
                    ->color(fn (string $state): string => $state === 'subscription' ? 'info' : 'success'),
                TextColumn::make('price_during_display')
                    ->label('Price (during)')
                    ->state(fn (Product $record): ?int => $record->displayPriceCentsForPhase('during'))
                    ->money('USD', divideBy: 100)
                    ->placeholder('—')
                    ->alignEnd()
                    ->description(fn (Product $record): ?string => $record->kind === 'combo' && $record->combo_discount_cents
                        ? '−$'.number_format($record->combo_discount_cents / 100, 2).' off'
                        : null),
                IconColumn::make('grants_vip_access')->boolean()->toggleable(),
                IconColumn::make('is_active')->boolean()->toggleable(),
            ])
            ->filters([
                SelectFilter::make('kind')->options([
                    'standalone' => 'Standalone',
                    'bump' => 'Order bump',
                    'upsell' => 'Upsell',
                    'combo' => 'Combo',
                ]),
                SelectFilter::make('summit_id')
                    ->relationship('summit', 'title')
                    ->label('Summit')
                    ->preload(),
                SelectFilter::make('product_type')->options([
                    'one_time' => 'One-time',
                    'subscription' => 'Subscription',
                ]),
                TernaryFilter::make('is_active'),
                TernaryFilter::make('grants_vip_access'),
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
            ->defaultSort('name');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListProducts::route('/'),
            'create' => Pages\CreateProduct::route('/create'),
            'view' => Pages\ViewProduct::route('/{record}'),
            'edit' => Pages\EditProduct::route('/{record}/edit'),
        ];
    }
}
