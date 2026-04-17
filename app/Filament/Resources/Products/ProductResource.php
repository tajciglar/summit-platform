<?php

namespace App\Filament\Resources\Products;

use App\Filament\Resources\Products\Pages;
use App\Models\Product;
use BackedEnum;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Forms\Components\Placeholder;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Illuminate\Support\HtmlString;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\SpatieMediaLibraryImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class ProductResource extends Resource
{
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
            Section::make('Product')
                ->columns(2)
                ->components([
                    Select::make('summit_id')
                        ->label('Summit')
                        ->relationship('summit', 'title')
                        ->searchable()
                        ->preload()
                        ->placeholder('Cross-summit product')
                        ->helperText('Leave empty if this product is sold across multiple summits.'),
                    TextInput::make('category')
                        ->maxLength(100)
                        ->datalist(['vip_pass', 'bundle', 'recording', 'masterclass', 'coaching'])
                        ->helperText('Free-text: vip_pass, bundle, recording, etc.'),
                    TextInput::make('name')
                        ->required()->maxLength(500)
                        ->live(onBlur: true)
                        ->afterStateUpdated(function (string $operation, $state, callable $set): void {
                            if ($operation === 'create') {
                                $set('slug', Str::slug((string) $state));
                            }
                        }),
                    TextInput::make('slug')->required()->maxLength(255),
                    Textarea::make('description')->rows(3)->columnSpanFull(),
                    SpatieMediaLibraryFileUpload::make('image')
                        ->collection('image')
                        ->image()
                        ->imageEditor()
                        ->imageCropAspectRatio('1:1')
                        ->maxSize(5120)
                        ->helperText('Square thumbnail, shown in cards and order bumps.')
                        ->columnSpanFull(),
                ]),

            Section::make('Role in the funnel')
                ->description('How this product is sold.')
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
                        ->live()
                        ->columnSpanFull(),
                    Select::make('bundled_product_ids')
                        ->label('Products in this combo')
                        ->helperText('Pick 2+ products to bundle. At checkout, Stripe receives one line item per child product using its own stripe_price_id.')
                        ->multiple()
                        ->searchable()
                        ->preload()
                        ->live()
                        ->columnSpanFull()
                        ->visible(fn (callable $get): bool => $get('kind') === 'combo')
                        ->options(function () {
                            return \App\Models\Product::query()
                                ->where('kind', '!=', 'combo')
                                ->orderBy('name')
                                ->pluck('name', 'id')
                                ->all();
                        }),
                    TextInput::make('combo_discount_cents')
                        ->label('Combo discount (cents)')
                        ->helperText('Optional. Subtracted from the sum of children\'s current-phase prices.')
                        ->numeric()
                        ->prefix('¢')
                        ->minValue(0)
                        ->live(onBlur: true)
                        ->columnSpan(1)
                        ->visible(fn (callable $get): bool => $get('kind') === 'combo'),
                    Placeholder::make('combo_pricing_preview')
                        ->label('Pricing preview')
                        ->columnSpanFull()
                        ->visible(fn (callable $get): bool => $get('kind') === 'combo')
                        ->content(function (callable $get): HtmlString {
                            $ids = (array) ($get('bundled_product_ids') ?? []);
                            if (empty($ids)) {
                                return new HtmlString('<span class="text-sm text-gray-500 italic">Pick products to see live totals per phase.</span>');
                            }
                            $children = \App\Models\Product::query()->whereIn('id', $ids)->get();
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

            Section::make('Type & access')
                ->columns(3)
                ->components([
                    Select::make('product_type')
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
                    TextInput::make('tier')
                        ->maxLength(100)
                        ->datalist(['basic', 'vip'])
                        ->helperText('basic, vip, etc.'),
                    Toggle::make('grants_vip_access')
                        ->label('Grants VIP access')
                        ->helperText('Buyer unlocks VIP videos on purchase.'),
                    Toggle::make('is_active')->default(true),
                    TextInput::make('stripe_product_id')
                        ->maxLength(255)
                        ->prefix('prod_')
                        ->visible(fn (callable $get): bool => $get('kind') !== 'combo')
                        ->helperText(fn (callable $get): ?string => $get('kind') === 'combo'
                            ? 'Combos have no Stripe product of their own.'
                            : null),
                ]),

            Section::make('Phase pricing (USD cents)')
                ->description('Leave a phase blank if the product isn\'t sold during that phase.')
                ->columns(4)
                ->visible(fn (callable $get): bool => $get('kind') !== 'combo')
                ->components([
                    TextInput::make('price_pre_summit_cents')->label('Pre-summit')->numeric()->prefix('¢'),
                    TextInput::make('price_late_pre_cents')->label('Late pre-summit')->numeric()->prefix('¢'),
                    TextInput::make('price_during_cents')->label('During summit')->numeric()->prefix('¢'),
                    TextInput::make('price_post_summit_cents')->label('Post-summit')->numeric()->prefix('¢'),
                    TextInput::make('compare_pre_summit_cents')->label('Compare pre')->numeric()->prefix('¢')
                        ->helperText('Strikethrough price (optional).'),
                    TextInput::make('compare_late_pre_cents')->label('Compare late')->numeric()->prefix('¢'),
                    TextInput::make('compare_during_cents')->label('Compare during')->numeric()->prefix('¢'),
                    TextInput::make('compare_post_summit_cents')->label('Compare post')->numeric()->prefix('¢'),
                ]),

            Section::make('Stripe price IDs')
                ->collapsed()
                ->columns(4)
                ->visible(fn (callable $get): bool => $get('kind') !== 'combo')
                ->components([
                    TextInput::make('stripe_price_pre_id')->label('Pre')->maxLength(255),
                    TextInput::make('stripe_price_late_id')->label('Late')->maxLength(255),
                    TextInput::make('stripe_price_during_id')->label('During')->maxLength(255),
                    TextInput::make('stripe_price_post_id')->label('Post')->maxLength(255),
                ]),

            Section::make('Subscription intro pricing (optional)')
                ->collapsed()
                ->columns(2)
                ->visible(fn (callable $get): bool => $get('product_type') === 'subscription')
                ->components([
                    TextInput::make('intro_price_cents')->numeric()->prefix('¢')->helperText('Promotional intro price.'),
                    TextInput::make('intro_period_months')->numeric()->helperText('Months the intro price applies.'),
                ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                SpatieMediaLibraryImageColumn::make('image')
                    ->collection('image')
                    ->conversion('thumb')
                    ->label('')
                    ->square()
                    ->size(40),
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
