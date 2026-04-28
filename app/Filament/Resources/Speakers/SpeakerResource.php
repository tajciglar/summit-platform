<?php

namespace App\Filament\Resources\Speakers;

use App\Filament\Forms\Components\MediaPickerInput;
use App\Models\Speaker;
use App\Models\Summit;
use App\Support\CurrentSummit;
use BackedEnum;
use Filament\Actions\BulkAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Facades\Filament;
use Filament\Forms\Components\KeyValue;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Panel;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

class SpeakerResource extends Resource
{
    protected static ?string $model = Speaker::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedMicrophone;

    protected static string|\UnitEnum|null $navigationGroup = 'Content';

    protected static ?int $navigationSort = 20;

    protected static ?string $recordTitleAttribute = 'last_name';

    public static function getGloballySearchableAttributes(): array
    {
        return ['first_name', 'last_name', 'slug'];
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Tabs::make('Speaker')
                ->columnSpanFull()
                ->persistTabInQueryString()
                ->tabs([
                    Tab::make('Identity & bio')
                        ->icon(Heroicon::OutlinedUser)
                        ->schema([
                            Section::make()
                                ->columns(2)
                                ->components([
                                    TextInput::make('first_name')->required()->maxLength(255),
                                    TextInput::make('last_name')->required()->maxLength(255),
                                    TextInput::make('email')->email()->maxLength(255),
                                    TextInput::make('title')
                                        ->label('Professional title')
                                        ->maxLength(500)
                                        ->helperText('e.g. CEO of Company X'),
                                    MediaPickerInput::make('photo_media_item_id')
                                        ->category('speakers')
                                        ->subCategory('headshot')
                                        ->role('photo')
                                        ->label('Speaker photo')
                                        ->captionUsing(fn (Speaker $record): string => trim("{$record->first_name} {$record->last_name}"))
                                        ->altTextUsing(fn (Speaker $record): string => trim("{$record->first_name} {$record->last_name}").' — speaker photo')
                                        ->columnSpanFull(),
                                    TextInput::make('website_url')->url()->maxLength(1000)->columnSpanFull(),
                                    Textarea::make('short_bio')->rows(3)->columnSpanFull(),
                                    Textarea::make('long_bio')->rows(6)->columnSpanFull(),
                                    KeyValue::make('social_links')
                                        ->keyLabel('Platform')
                                        ->valueLabel('URL')
                                        ->columnSpanFull()
                                        ->helperText('e.g. twitter, linkedin, instagram'),
                                ]),
                        ]),

                    Tab::make('Summits')
                        ->icon(Heroicon::OutlinedCalendarDays)
                        ->badge(fn (?Speaker $record): ?int => $record?->summits()->count() ?: null)
                        ->schema([
                            Section::make()
                                ->description('Which summits this speaker appears on. Per-summit day, display order, masterclass title and talk title live here — the same speaker can sit on Day 2 of one summit and Day 5 of another with different titles in each.')
                                ->components([
                                    Repeater::make('speakerSummits')
                                        ->relationship()
                                        ->label('')
                                        ->addActionLabel('Attach to another summit')
                                        ->minItems(1)
                                        ->mutateRelationshipDataBeforeCreateUsing(function (array $data): array {
                                            $data['sort_order'] ??= 0;

                                            return $data;
                                        })
                                        ->mutateRelationshipDataBeforeSaveUsing(function (array $data): array {
                                            $data['sort_order'] ??= 0;

                                            return $data;
                                        })
                                        ->columns(6)
                                        ->itemLabel(function (array $state): ?string {
                                            $summitId = $state['summit_id'] ?? null;
                                            if (! $summitId) {
                                                return null;
                                            }
                                            $title = Summit::query()->whereKey($summitId)->value('title');
                                            $day = $state['day_number'] ?? null;

                                            return $title
                                                ? ($day ? "{$title} — Day {$day}" : $title)
                                                : null;
                                        })
                                        ->collapsible()
                                        ->schema([
                                            Select::make('summit_id')
                                                ->label('Summit')
                                                ->options(function () {
                                                    $query = Summit::query()->orderBy('title');
                                                    $domain = Filament::getTenant();
                                                    if ($domain) {
                                                        $query->where('domain_id', $domain->getKey());
                                                    }

                                                    return $query->pluck('title', 'id')->all();
                                                })
                                                ->required()
                                                ->searchable()
                                                ->preload()
                                                ->distinct()
                                                ->live()
                                                ->columnSpan(6)
                                                ->validationMessages(['distinct' => 'This speaker is already attached to that summit.']),
                                            Select::make('day_number')
                                                ->label('Day')
                                                ->options([
                                                    1 => 'Day 1',
                                                    2 => 'Day 2',
                                                    3 => 'Day 3',
                                                    4 => 'Day 4',
                                                    5 => 'Day 5',
                                                    6 => 'Day 6',
                                                    7 => 'Day 7',
                                                ])
                                                ->placeholder('Unassigned')
                                                ->live()
                                                ->columnSpan(2)
                                                ->helperText('Which day of this summit.'),
                                            TextInput::make('sort_order')
                                                ->label('Order')
                                                ->numeric()
                                                ->default(0)
                                                ->columnSpan(1)
                                                ->helperText('Sort position.'),
                                            TextInput::make('masterclass_title')
                                                ->label('Masterclass title')
                                                ->maxLength(500)
                                                ->columnSpan(3)
                                                ->helperText('Per-summit masterclass title.'),
                                            TextInput::make('talk_title')
                                                ->label('Talk title')
                                                ->maxLength(500)
                                                ->columnSpan(6)
                                                ->helperText('Optional short talk title for this summit.'),
                                        ]),
                                ]),
                        ]),

                    Tab::make('Masterclass')
                        ->icon(Heroicon::OutlinedPlayCircle)
                        ->schema([
                            Section::make()
                                ->description('Masterclass title is per-summit (set in the Summits tab). These fields are global to the speaker.')
                                ->columns(2)
                                ->components([
                                    Textarea::make('masterclass_description')->rows(3)->columnSpanFull(),
                                    TextInput::make('free_video_url')->url()->maxLength(1000),
                                    TextInput::make('vip_video_url')->url()->maxLength(1000),
                                    TextInput::make('free_access_window_hours')
                                        ->numeric()->default(24)->minValue(1)->maxValue(168)
                                        ->helperText('Free viewing window after a user clicks play.'),
                                ]),
                        ]),
                ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('last_name')
                    ->label('Name')
                    ->formatStateUsing(fn (Speaker $record): string => $record->fullName())
                    ->searchable(['first_name', 'last_name'])
                    ->sortable()
                    ->weight('bold'),
                TextColumn::make('summits.title')
                    ->label('Summits')
                    ->badge()
                    ->separator(',')
                    ->wrap(),
            ])
            ->filters([
                SelectFilter::make('summits')
                    ->label('Summit')
                    ->relationship('summits', 'title')
                    ->multiple()
                    ->preload(),
            ])
            ->recordActions([
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    BulkAction::make('attachToSummit')
                        ->label('Attach to summit…')
                        ->icon(Heroicon::OutlinedCalendarDays)
                        ->schema([
                            Select::make('summit_id')
                                ->label('Summit')
                                ->options(function () {
                                    $query = Summit::query()->orderBy('title');
                                    $domain = Filament::getTenant();
                                    if ($domain) {
                                        $query->where('domain_id', $domain->getKey());
                                    }

                                    return $query->pluck('title', 'id')->all();
                                })
                                ->required()
                                ->searchable()
                                ->preload(),
                            Select::make('day_number')
                                ->label('Day')
                                ->options([
                                    1 => 'Day 1',
                                    2 => 'Day 2',
                                    3 => 'Day 3',
                                    4 => 'Day 4',
                                    5 => 'Day 5',
                                    6 => 'Day 6',
                                    7 => 'Day 7',
                                ])
                                ->placeholder('Unassigned'),
                        ])
                        ->action(function (array $data, Collection $records): void {
                            $summitId = $data['summit_id'];
                            $day = $data['day_number'] ?? null;
                            foreach ($records as $speaker) {
                                /** @var Speaker $speaker */
                                $speaker->summits()->syncWithoutDetaching([
                                    $summitId => [
                                        'day_number' => $day,
                                        'sort_order' => 0,
                                        // masterclass_title + talk_title intentionally
                                        // left blank — operator fills per-pivot.
                                    ],
                                ]);
                            }
                        })
                        ->deselectRecordsAfterCompletion(),
                    DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('last_name');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListSpeakers::route('/'),
            'create' => Pages\CreateSpeaker::route('/create'),
            'edit' => Pages\EditSpeaker::route('/{record}/edit'),
        ];
    }

    /**
     * Tenant scoping for a many-to-many model. Speakers aren't owned by a
     * summit anymore — they're attached via the `speaker_summit` pivot.
     * Show any speaker that has at least one attachment to a summit under
     * the current tenant (domain); if an admin has picked a specific
     * summit, narrow to speakers attached to that summit.
     */
    public static function scopeEloquentQueryToTenant(Builder $query, ?Model $tenant): Builder
    {
        if ($summitId = CurrentSummit::getId()) {
            $query->whereHas(
                'summits',
                fn (Builder $q) => $q->where('summits.id', $summitId),
            );
        }

        return $query;
    }

    public static function getTenantOwnershipRelationshipName(): string
    {
        return 'summits';
    }

    /**
     * Tenant is a Domain (not a Summit); creation scoping via the default
     * Filament tenancy hooks would misfire. See
     * ScopesTenantViaSummitDomains for the parallel reasoning used on
     * summit-owned resources.
     */
    public static function observeTenancyModelCreation(Panel $panel): void {}
}
