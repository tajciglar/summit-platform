<?php

namespace App\Filament\Resources\Summits;

use App\Actions\DuplicateSummit;
use App\Enums\SummitAudience;
use App\Filament\Forms\Components\MediaPickerInput;
use App\Filament\Resources\Summits\RelationManagers\FunnelsRelationManager;
use App\Filament\Resources\Summits\RelationManagers\SpeakersRelationManager;
use App\Models\Summit;
use App\Support\CurrentSummit;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Facades\Filament;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class SummitResource extends Resource
{
    protected static ?string $model = Summit::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedSparkles;

    protected static string|\UnitEnum|null $navigationGroup = 'Content';

    protected static ?int $navigationSort = 10;

    protected static ?string $recordTitleAttribute = 'title';

    /**
     * Tenant is Domain — scope summits to those hosted on the active domain
     * via the `domain_id` foreign key (see scopeEloquentQueryToTenant at the
     * bottom of this file). A summit belongs to exactly one domain.
     */

    /**
     * Hidden from sidebar — reached via the "Manage summits" link in the
     * tenant picker menu (top-right).
     */
    protected static bool $shouldRegisterNavigation = false;

    public static function getGloballySearchableAttributes(): array
    {
        return ['title', 'slug', 'topic'];
    }

    /**
     * Form layout mirrors the ViewSummit infolist so clicking Edit keeps
     * the exact same visual structure — only the fields become interactive.
     */
    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Basics')
                ->description('Summit identity, lifecycle status, and phase schedule.')
                ->columnSpanFull()
                ->components([
                    Grid::make(12)
                        ->schema([
                            TextInput::make('title')
                                ->required()
                                ->maxLength(500)
                                ->live(onBlur: true)
                                ->afterStateUpdated(function (string $operation, $state, callable $set): void {
                                    if ($operation === 'create') {
                                        $set('slug', Str::slug((string) $state));
                                    }
                                })
                                ->columnSpan(6),
                            Select::make('status')
                                ->options([
                                    'draft' => 'Draft',
                                    'published' => 'Published',
                                    'archived' => 'Archived',
                                ])
                                ->default('draft')
                                ->required()
                                ->native(false)
                                ->columnSpan(2),
                            Select::make('current_phase')
                                ->label('Current phase')
                                ->options([
                                    'pre' => 'Pre-summit',
                                    'late_pre' => 'Late pre-summit',
                                    'during' => 'During summit',
                                    'post' => 'Post-summit',
                                ])
                                ->default('pre')
                                ->required()
                                ->native(false)
                                ->helperText('Updated automatically by cron.')
                                ->columnSpan(2),
                            TextInput::make('timezone')
                                ->label('Timezone')
                                ->default('America/New_York')
                                ->required()
                                ->maxLength(100)
                                ->columnSpan(2),
                            TextInput::make('slug')
                                ->required()
                                ->maxLength(255)
                                ->unique(ignoreRecord: true)
                                ->prefix('/')
                                ->helperText('URL-safe identifier. Auto-filled from title.')
                                ->columnSpan(6),
                            TextInput::make('topic')
                                ->maxLength(255)
                                ->helperText('e.g. ADHD parenting, productivity, mindset')
                                ->columnSpan(6),
                            Select::make('audience')
                                ->label('Audience')
                                ->options(SummitAudience::options())
                                ->native(false)
                                ->placeholder('— neutral / none —')
                                ->helperText('Controls the palette colors applied to every generated landing page.')
                                ->columnSpan(6),
                            Textarea::make('description')
                                ->rows(3)
                                ->maxLength(2000)
                                ->columnSpanFull(),
                        ]),

                    Grid::make(5)
                        ->schema([
                            DateTimePicker::make('pre_summit_starts_at')
                                ->label('Pre-summit starts')
                                ->seconds(false),
                            DateTimePicker::make('late_pre_summit_starts_at')
                                ->label('Late pre-summit')
                                ->seconds(false),
                            DateTimePicker::make('during_summit_starts_at')
                                ->label('During summit')
                                ->seconds(false),
                            DateTimePicker::make('post_summit_starts_at')
                                ->label('Post-summit')
                                ->seconds(false),
                            DateTimePicker::make('ends_at')
                                ->label('Ends')
                                ->seconds(false),
                        ]),

                    MediaPickerInput::make('hero_media_item_id')
                        ->category('hero')
                        ->role('hero')
                        ->label('Hero image')
                        ->columnSpanFull(),

                    Select::make('domain_id')
                        ->label('Published on domain')
                        ->relationship('domain', 'name')
                        ->required()
                        ->preload()
                        ->searchable()
                        ->default(fn () => Filament::getTenant()?->getKey())
                        ->columnSpanFull()
                        ->helperText('Which brand site hosts this summit. One summit belongs to exactly one domain.'),
                ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('title')
                    ->searchable()
                    ->sortable()
                    ->weight('bold'),
                TextColumn::make('slug')
                    ->searchable()
                    ->toggleable()
                    ->color('gray'),
                TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'published' => 'success',
                        'draft' => 'gray',
                        'archived' => 'warning',
                        default => 'gray',
                    }),
                TextColumn::make('current_phase')
                    ->badge()
                    ->formatStateUsing(fn (?string $state) => $state ? str_replace('_', ' ', $state) : '—')
                    ->color(fn (?string $state): string => match ($state) {
                        'during' => 'success',
                        'late_pre' => 'warning',
                        'pre' => 'info',
                        'post' => 'gray',
                        default => 'gray',
                    }),
                TextColumn::make('speakers_count')
                    ->counts('speakers')
                    ->label('Speakers')
                    ->alignCenter()
                    ->toggleable(),
                TextColumn::make('funnels_count')
                    ->counts('funnels')
                    ->label('Funnels')
                    ->alignCenter()
                    ->toggleable(),
                TextColumn::make('ends_at')
                    ->label('Ends')
                    ->date()
                    ->sortable()
                    ->toggleable(),
            ])
            ->filters([
                SelectFilter::make('status')->options([
                    'draft' => 'Draft',
                    'published' => 'Published',
                    'archived' => 'Archived',
                ]),
                SelectFilter::make('current_phase')->options([
                    'pre' => 'Pre-summit',
                    'late_pre' => 'Late pre-summit',
                    'during' => 'During summit',
                    'post' => 'Post-summit',
                ]),
            ])
            ->recordActions([
                ViewAction::make(),
                EditAction::make(),
                Action::make('duplicate')
                    ->label('Duplicate')
                    ->icon(Heroicon::OutlinedDocumentDuplicate)
                    ->color('gray')
                    ->requiresConfirmation()
                    ->modalHeading('Duplicate this summit?')
                    ->modalDescription('Copies the summit with all speakers, products, funnels, steps, and order bumps. The copy starts as a draft with phase dates shifted forward by one year.')
                    ->modalSubmitActionLabel('Duplicate')
                    ->action(function (Summit $record): void {
                        $clone = app(DuplicateSummit::class)->handle($record);

                        Notification::make()
                            ->title('Summit duplicated')
                            ->body('Created '.$clone->title.'.')
                            ->success()
                            ->actions([
                                \Filament\Notifications\Actions\Action::make('view')
                                    ->label('Open copy')
                                    ->url(self::getUrl('edit', ['record' => $clone])),
                            ])
                            ->send();
                    }),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getRelations(): array
    {
        return [
            FunnelsRelationManager::class,
            SpeakersRelationManager::class,
            RelationManagers\OrdersRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListSummits::route('/'),
            'create' => Pages\CreateSummit::route('/create'),
            'view' => Pages\ViewSummit::route('/{record}'),
            'edit' => Pages\EditSummit::route('/{record}/edit'),
        ];
    }

    /**
     * Summit scopes to domain via its `domain_id` FK. Also narrows to the
     * picked summit when one is selected in the tenant dropdown.
     */
    public static function scopeEloquentQueryToTenant(
        Builder $query,
        ?Model $tenant,
    ): Builder {
        $tenant ??= Filament::getTenant();
        if (! $tenant) {
            return $query;
        }

        $query->where('domain_id', $tenant->getKey());

        if ($summitId = CurrentSummit::getId()) {
            $query->whereKey($summitId);
        }

        return $query;
    }

    public static function getTenantOwnershipRelationshipName(): string
    {
        return 'domain';
    }
}
