<?php

namespace App\Filament\Resources\Affiliates;

use App\Filament\Resources\Affiliates\Pages;
use App\Models\Affiliate;
use BackedEnum;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

class AffiliateResource extends Resource
{
    protected static ?string $model = Affiliate::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedUserGroup;

    protected static string|\UnitEnum|null $navigationGroup = 'Sales';

    protected static ?int $navigationSort = 40;

    protected static ?string $recordTitleAttribute = 'code';

    public static function getGloballySearchableAttributes(): array
    {
        return ['code', 'first_name', 'last_name', 'email', 'company'];
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Affiliate')
                ->columns(2)
                ->components([
                    TextInput::make('code')
                        ->required()
                        ->maxLength(100)
                        ->unique(ignoreRecord: true)
                        ->alphaDash()
                        ->helperText('Unique referral code. E.g. SARAH2026'),
                    Select::make('user_id')
                        ->label('Linked user')
                        ->relationship('user', 'email')
                        ->searchable()
                        ->preload()
                        ->placeholder('External affiliate (not a user)'),
                    TextInput::make('first_name')->required()->maxLength(255),
                    TextInput::make('last_name')->required()->maxLength(255),
                    TextInput::make('email')->email()->required()->maxLength(255)
                        ->unique(ignoreRecord: true),
                    TextInput::make('company')->maxLength(255),
                ]),

            Section::make('Payout')
                ->columns(3)
                ->components([
                    TextInput::make('commission_rate')
                        ->numeric()
                        ->step('0.0001')
                        ->minValue(0)
                        ->maxValue(1)
                        ->default(0.3)
                        ->helperText('Decimal: 0.3 = 30%.'),
                    TextInput::make('payment_email')->email()->maxLength(255)
                        ->helperText('PayPal/bank email for payouts.'),
                    Toggle::make('is_active')->default(true),
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
                TextColumn::make('first_name')
                    ->label('Name')
                    ->formatStateUsing(fn (Affiliate $r) => trim("{$r->first_name} {$r->last_name}"))
                    ->searchable(['first_name', 'last_name']),
                TextColumn::make('email')->searchable()->toggleable(),
                TextColumn::make('company')->toggleable(),
                TextColumn::make('commission_rate')
                    ->label('Rate')
                    ->formatStateUsing(fn ($state) => number_format($state * 100, 1).'%')
                    ->alignEnd(),
                TextColumn::make('commissions_count')
                    ->counts('commissions')
                    ->label('Commissions')
                    ->alignCenter()
                    ->toggleable(),
                IconColumn::make('is_active')->boolean(),
            ])
            ->filters([
                TernaryFilter::make('is_active'),
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
            ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListAffiliates::route('/'),
            'create' => Pages\CreateAffiliate::route('/create'),
            'view' => Pages\ViewAffiliate::route('/{record}'),
            'edit' => Pages\EditAffiliate::route('/{record}/edit'),
        ];
    }
}
