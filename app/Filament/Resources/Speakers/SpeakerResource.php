<?php

namespace App\Filament\Resources\Speakers;

use App\Filament\Forms\Components\MediaPickerInput;
use App\Filament\Resources\Concerns\ScopesTenantViaSummitDomains;
use App\Models\Speaker;
use App\Support\CurrentSummit;
use BackedEnum;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Facades\Filament;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\KeyValue;
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

class SpeakerResource extends Resource
{
    use ScopesTenantViaSummitDomains;

    protected static ?string $model = Speaker::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedMicrophone;

    protected static string|\UnitEnum|null $navigationGroup = 'Content';

    protected static ?int $navigationSort = 20;

    protected static ?string $recordTitleAttribute = 'last_name';

    public static function getGloballySearchableAttributes(): array
    {
        return ['first_name', 'last_name', 'slug', 'masterclass_title'];
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Identity')
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
                        ->placeholder('Unassigned')
                        ->helperText('Which day of the summit this speaker presents on.'),
                    TextInput::make('slug')
                        ->required()
                        ->maxLength(255)
                        ->helperText('URL slug within this summit.'),
                    TextInput::make('first_name')->required()->maxLength(255)
                        ->live(onBlur: true)
                        ->afterStateUpdated(function (string $operation, $state, callable $set, callable $get): void {
                            if ($operation === 'create' && ! $get('slug')) {
                                $set('slug', Str::slug((string) $state.'-'.(string) $get('last_name')));
                            }
                        }),
                    TextInput::make('last_name')->required()->maxLength(255),
                    TextInput::make('email')->email()->maxLength(255),
                    TextInput::make('title')
                        ->label('Professional title')
                        ->maxLength(500)
                        ->helperText('e.g. CEO of Company X'),
                ]),

            Section::make('Media & bio')
                ->columns(2)
                ->components([
                    MediaPickerInput::make('photo_media_item_id')
                        ->category('people')
                        ->role('photo')
                        ->label('Speaker photo')
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

            Section::make('Masterclass')
                ->columns(2)
                ->components([
                    TextInput::make('masterclass_title')->maxLength(500)->columnSpanFull(),
                    Textarea::make('masterclass_description')->rows(3)->columnSpanFull(),
                    TextInput::make('free_video_url')->url()->maxLength(1000),
                    TextInput::make('vip_video_url')->url()->maxLength(1000),
                    DateTimePicker::make('goes_live_at')
                        ->seconds(false)
                        ->helperText('When the video becomes available.'),
                    TextInput::make('free_access_window_hours')
                        ->numeric()->default(24)->minValue(1)->maxValue(168)
                        ->helperText('Free viewing window after a user clicks play.'),
                ]),

            Section::make('Display')
                ->columns(3)
                ->components([
                    TextInput::make('sort_order')->numeric()->default(0),
                    Select::make('rating')
                        ->options([1 => 1, 2 => 2, 3 => 3, 4 => 4, 5 => 5])
                        ->placeholder('Unrated')
                        ->helperText('Internal quality rating.'),
                    Toggle::make('is_featured'),
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
                TextColumn::make('summit.title')->label('Summit')->searchable()->toggleable(),
                TextColumn::make('day_number')
                    ->label('Day')
                    ->formatStateUsing(fn (?int $state): string => $state === null ? '—' : "Day {$state}")
                    ->badge()
                    ->color('gray')
                    ->sortable()
                    ->toggleable(),
                TextColumn::make('masterclass_title')
                    ->label('Masterclass')
                    ->limit(40)
                    ->toggleable(),
                TextColumn::make('rating')
                    ->badge()
                    ->color(fn (?int $state): string => match (true) {
                        $state === null => 'gray',
                        $state >= 4 => 'success',
                        $state >= 3 => 'warning',
                        default => 'danger',
                    })
                    ->toggleable(),
                IconColumn::make('is_featured')->boolean()->toggleable(),
                TextColumn::make('goes_live_at')->dateTime()->sortable()->toggleable(),
                TextColumn::make('sort_order')->sortable()->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('summit_id')
                    ->label('Summit')
                    ->relationship('summit', 'title')
                    ->preload(),
                TernaryFilter::make('is_featured'),
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
            ->reorderable('sort_order')
            ->defaultSort('sort_order');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListSpeakers::route('/'),
            'create' => Pages\CreateSpeaker::route('/create'),
            'view' => Pages\ViewSpeaker::route('/{record}'),
            'edit' => Pages\EditSpeaker::route('/{record}/edit'),
        ];
    }
}
