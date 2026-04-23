<?php

namespace App\Filament\Resources\Domains;

use App\Filament\Forms\Components\MediaPickerInput;
use App\Models\Domain;
use App\Models\User;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Facades\Filament;
use Filament\Forms\Components\ColorPicker;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
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
                    MediaPickerInput::make('logo_media_item_id')
                        ->category('brand')
                        ->subCategory('logo')
                        ->role('logo')
                        ->label('Logo')
                        ->captionUsing(fn (Domain $record): string => $record->name.' — logo')
                        ->altTextUsing(fn (Domain $record): string => $record->name.' logo')
                        ->columnSpanFull(),
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
                // One-click grant: attach the currently logged-in user to this
                // Domain's domain_user pivot so the tenant dropdown starts
                // showing it. Hidden when the user is already attached. Fixes
                // the "I created a domain via SQL but can't switch to it" trap
                // until we finish the CreateDomain-page auto-attach rollout.
                Action::make('joinDomain')
                    ->label('Join')
                    ->icon('heroicon-m-user-plus')
                    ->color('info')
                    ->visible(function (Domain $record): bool {
                        $user = Filament::auth()->user();
                        if (! $user instanceof User) {
                            return false;
                        }

                        return ! $record->users()->whereKey($user->id)->exists();
                    })
                    ->action(function (Domain $record): void {
                        $user = Filament::auth()->user();
                        if (! $user instanceof User) {
                            return;
                        }
                        $record->users()->syncWithoutDetaching([$user->id => ['created_at' => now()]]);
                        Notification::make()
                            ->title('Joined '.$record->name)
                            ->body('This domain will now show up in your tenant switcher.')
                            ->success()
                            ->send();
                    }),
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
            'edit' => Pages\EditDomain::route('/{record}/edit'),
        ];
    }
}
