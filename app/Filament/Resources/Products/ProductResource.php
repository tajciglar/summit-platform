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
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
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
                        ->prefix('prod_'),
                ]),

            Section::make('Phase pricing (USD cents)')
                ->description('Leave a phase blank if the product isn\'t sold during that phase.')
                ->columns(4)
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
                TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->weight('bold'),
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
                TextColumn::make('price_during_cents')
                    ->label('Price (during)')
                    ->money('USD', divideBy: 100)
                    ->placeholder('—')
                    ->alignEnd()
                    ->sortable(),
                IconColumn::make('grants_vip_access')->boolean()->toggleable(),
                IconColumn::make('is_active')->boolean()->toggleable(),
            ])
            ->filters([
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
