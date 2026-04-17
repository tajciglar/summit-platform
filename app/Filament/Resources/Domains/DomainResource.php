<?php

namespace App\Filament\Resources\Domains;

use App\Filament\Resources\Domains\Pages;
use App\Models\Domain;
use BackedEnum;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Forms\Components\ColorPicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\SpatieMediaLibraryImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class DomainResource extends Resource
{
    protected static ?string $model = Domain::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedGlobeAlt;

    protected static string|\UnitEnum|null $navigationGroup = 'Settings';

    protected static ?int $navigationSort = 1;

    protected static ?string $recordTitleAttribute = 'name';

    /** Tenant is Domain — the list itself must not be tenant-scoped. */
    protected static bool $isScopedToTenant = false;

    /** Hidden from sidebar — reachable via "Manage domains" in the tenant menu. */
    protected static bool $shouldRegisterNavigation = false;

    public static function getGloballySearchableAttributes(): array
    {
        return ['name', 'hostname', 'slug'];
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Domain')
                ->columns(2)
                ->components([
                    TextInput::make('name')
                        ->required()
                        ->maxLength(255)
                        ->live(onBlur: true)
                        ->afterStateUpdated(function (string $operation, $state, callable $set): void {
                            if ($operation === 'create') {
                                $set('slug', Str::slug((string) $state));
                            }
                        })
                        ->helperText('Brand / display name. E.g. "Parenting Summits"'),
                    TextInput::make('hostname')
                        ->required()
                        ->maxLength(255)
                        ->unique(ignoreRecord: true)
                        ->placeholder('parenting-summits.com'),
                    TextInput::make('slug')
                        ->required()
                        ->maxLength(255)
                        ->unique(ignoreRecord: true)
                        ->alphaDash()
                        ->helperText('URL slug (appears in the admin path).'),
                    ColorPicker::make('brand_color')
                        ->placeholder('#4F46E5'),
                    Toggle::make('is_active')
                        ->default(true)
                        ->columnSpanFull(),
                    SpatieMediaLibraryFileUpload::make('logo')
                        ->collection('logo')
                        ->image()
                        ->imageEditor()
                        ->maxSize(2048)
                        ->columnSpanFull(),
                ]),

            Section::make('Summits hosted on this domain')
                ->description('Many-to-many. A summit can live on multiple domains.')
                ->components([
                    Select::make('summits')
                        ->relationship('summits', 'title')
                        ->multiple()
                        ->searchable()
                        ->preload()
                        ->hiddenLabel(),
                ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                SpatieMediaLibraryImageColumn::make('logo')
                    ->collection('logo')
                    ->conversion('small')
                    ->label('')
                    ->square()
                    ->size(36),
                TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->weight('bold'),
                TextColumn::make('hostname')
                    ->searchable()
                    ->color('gray')
                    ->icon('heroicon-m-globe-alt'),
                TextColumn::make('summits_count')
                    ->counts('summits')
                    ->label('Summits')
                    ->alignCenter(),
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
            ->defaultSort('name');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListDomains::route('/'),
            'create' => Pages\CreateDomain::route('/create'),
            'view' => Pages\ViewDomain::route('/{record}'),
            'edit' => Pages\EditDomain::route('/{record}/edit'),
        ];
    }
}
