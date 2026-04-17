<?php

namespace App\Filament\Resources\Users;

use App\Filament\Resources\Users\Pages;
use App\Models\User;
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
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

class UserResource extends Resource
{
    protected static ?string $model = User::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedUsers;

    protected static string|\UnitEnum|null $navigationGroup = 'Settings';

    protected static ?int $navigationSort = 10;

    protected static ?string $recordTitleAttribute = 'email';

    protected static bool $isScopedToTenant = false;

    public static function getGloballySearchableAttributes(): array
    {
        return ['email', 'first_name', 'last_name', 'stripe_customer_id'];
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('User')
                ->columns(2)
                ->components([
                    TextInput::make('email')->email()->required()->maxLength(255)
                        ->unique(ignoreRecord: true),
                    Select::make('role')
                        ->options([
                            'admin' => 'Admin',
                            'buyer' => 'Buyer',
                        ])
                        ->default('buyer')
                        ->required()
                        ->native(false),
                    TextInput::make('first_name')->maxLength(255),
                    TextInput::make('last_name')->maxLength(255),
                    TextInput::make('phone')->tel()->maxLength(50),
                    TextInput::make('country')->maxLength(2)->helperText('ISO 3166-1 alpha-2, e.g. US'),
                    Toggle::make('is_active')->default(true),
                ]),

            Section::make('Password')
                ->visible(fn (string $operation): bool => $operation === 'create')
                ->components([
                    TextInput::make('password')
                        ->password()
                        ->revealable()
                        ->required(fn (string $operation): bool => $operation === 'create')
                        ->dehydrated(fn ($state): bool => filled($state))
                        ->minLength(8),
                ]),

            Section::make('Integrations')
                ->columns(2)
                ->collapsed()
                ->components([
                    TextInput::make('stripe_customer_id')->maxLength(255)->prefix('cus_'),
                    TextInput::make('activecampaign_id')->maxLength(255),
                ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('email')
                    ->searchable()
                    ->sortable()
                    ->weight('bold'),
                TextColumn::make('first_name')
                    ->label('Name')
                    ->formatStateUsing(fn (User $r) => trim("{$r->first_name} {$r->last_name}"))
                    ->searchable(['first_name', 'last_name']),
                TextColumn::make('role')
                    ->badge()
                    ->color(fn (string $state): string => $state === 'admin' ? 'warning' : 'info'),
                TextColumn::make('orders_count')
                    ->counts('orders')
                    ->label('Orders')
                    ->alignCenter()
                    ->toggleable(),
                IconColumn::make('is_active')->boolean(),
                TextColumn::make('last_login_at')->dateTime()->sortable()->toggleable(),
                TextColumn::make('created_at')->dateTime()->sortable()->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('role')->options([
                    'admin' => 'Admin',
                    'buyer' => 'Buyer',
                ]),
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
            'index' => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            'view' => Pages\ViewUser::route('/{record}'),
            'edit' => Pages\EditUser::route('/{record}/edit'),
        ];
    }
}
