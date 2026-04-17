<?php

namespace App\Filament\Resources\Coupons;

use App\Filament\Resources\Coupons\Pages;
use App\Models\Coupon;
use BackedEnum;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\DateTimePicker;
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

class CouponResource extends Resource
{
    protected static ?string $model = Coupon::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedTicket;

    protected static string|\UnitEnum|null $navigationGroup = 'Sales';

    protected static ?int $navigationSort = 30;

    protected static ?string $recordTitleAttribute = 'code';

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Coupon')
                ->columns(2)
                ->components([
                    TextInput::make('code')
                        ->required()
                        ->maxLength(100)
                        ->unique(ignoreRecord: true)
                        ->alphaDash()
                        ->helperText('Unique, case-sensitive. E.g. VIP25'),
                    Select::make('coupon_type')
                        ->options([
                            'percentage' => 'Percentage off',
                            'fixed_amount' => 'Fixed amount off',
                        ])
                        ->required()
                        ->native(false)
                        ->default('percentage'),
                    TextInput::make('amount')
                        ->numeric()
                        ->required()
                        ->helperText('For percentage: 1-100. For fixed amount: cents.'),
                    Toggle::make('is_active')->default(true),
                    TextInput::make('max_uses')
                        ->numeric()
                        ->placeholder('Unlimited')
                        ->helperText('Leave blank for unlimited.'),
                    TextInput::make('times_used')
                        ->numeric()
                        ->default(0)
                        ->disabled()
                        ->dehydrated(false),
                ]),

            Section::make('Scope')
                ->columns(2)
                ->components([
                    Select::make('summit_id')
                        ->label('Summit')
                        ->relationship('summit', 'title')
                        ->searchable()
                        ->preload()
                        ->placeholder('All summits'),
                    Select::make('product_id')
                        ->label('Product')
                        ->relationship('product', 'name')
                        ->searchable()
                        ->preload()
                        ->placeholder('All products'),
                ]),

            Section::make('Validity window')
                ->columns(2)
                ->components([
                    DateTimePicker::make('starts_at')->seconds(false)->placeholder('Available immediately'),
                    DateTimePicker::make('expires_at')->seconds(false)->placeholder('Never expires'),
                ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('code')
                    ->searchable()
                    ->weight('bold')
                    ->copyable(),
                TextColumn::make('coupon_type')
                    ->badge()
                    ->formatStateUsing(fn (string $state) => $state === 'percentage' ? '%' : '$'),
                TextColumn::make('amount')
                    ->formatStateUsing(function (Coupon $record): string {
                        return $record->coupon_type === 'percentage'
                            ? "{$record->amount}%"
                            : '$'.number_format($record->amount / 100, 2);
                    })
                    ->alignEnd(),
                TextColumn::make('times_used')
                    ->label('Used')
                    ->formatStateUsing(fn (Coupon $record): string => $record->max_uses
                        ? "{$record->times_used} / {$record->max_uses}"
                        : (string) $record->times_used)
                    ->alignCenter(),
                TextColumn::make('summit.title')->label('Summit')->toggleable()->placeholder('All'),
                TextColumn::make('product.name')->label('Product')->toggleable()->placeholder('All'),
                TextColumn::make('expires_at')->dateTime()->sortable()->toggleable()->placeholder('Never'),
                IconColumn::make('is_active')->boolean(),
            ])
            ->filters([
                SelectFilter::make('coupon_type')->options([
                    'percentage' => 'Percentage',
                    'fixed_amount' => 'Fixed amount',
                ]),
                TernaryFilter::make('is_active'),
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
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListCoupons::route('/'),
            'create' => Pages\CreateCoupon::route('/create'),
            'edit' => Pages\EditCoupon::route('/{record}/edit'),
        ];
    }
}
