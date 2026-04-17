<?php

namespace App\Filament\Resources\Summits;

use App\Actions\DuplicateSummit;
use App\Filament\Resources\Summits\Pages;
use App\Filament\Resources\Summits\RelationManagers\FunnelsRelationManager;
use App\Filament\Resources\Summits\RelationManagers\SpeakersRelationManager;
use App\Models\Summit;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Notifications\Notification;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\SpatieMediaLibraryFileUpload;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class SummitResource extends Resource
{
    protected static ?string $model = Summit::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedSparkles;

    protected static string|\UnitEnum|null $navigationGroup = 'Content';

    protected static ?int $navigationSort = 10;

    protected static ?string $recordTitleAttribute = 'title';

    /**
     * Summits ARE the tenant — the list of summits is where admins pick one,
     * so the list itself must not be scoped to the current tenant.
     */
    protected static bool $isScopedToTenant = false;

    public static function getGloballySearchableAttributes(): array
    {
        return ['title', 'slug', 'topic'];
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Basics')
                ->description('The summit identity and marketing copy.')
                ->columns(2)
                ->components([
                    TextInput::make('title')
                        ->required()
                        ->maxLength(500)
                        ->live(onBlur: true)
                        ->afterStateUpdated(function (string $operation, $state, callable $set): void {
                            if ($operation === 'create') {
                                $set('slug', Str::slug((string) $state));
                            }
                        }),
                    TextInput::make('slug')
                        ->required()
                        ->maxLength(255)
                        ->unique(ignoreRecord: true)
                        ->helperText('URL-safe identifier. Auto-filled from title.'),
                    TextInput::make('topic')
                        ->maxLength(255)
                        ->helperText('e.g. ADHD parenting, productivity, mindset'),
                    SpatieMediaLibraryFileUpload::make('hero')
                        ->collection('hero')
                        ->image()
                        ->imageEditor()
                        ->imageCropAspectRatio('16:9')
                        ->maxSize(8192)
                        ->helperText('Recommended 1920×1080. JPEG / PNG / WebP / AVIF.')
                        ->columnSpanFull(),
                    Textarea::make('description')
                        ->rows(3)
                        ->maxLength(2000)
                        ->columnSpanFull(),
                ]),

            Section::make('Status & Timezone')
                ->columns(3)
                ->components([
                    Select::make('status')
                        ->options([
                            'draft' => 'Draft',
                            'published' => 'Published',
                            'archived' => 'Archived',
                        ])
                        ->default('draft')
                        ->required()
                        ->native(false),
                    Select::make('current_phase')
                        ->options([
                            'pre' => 'Pre-summit',
                            'late_pre' => 'Late pre-summit',
                            'during' => 'During summit',
                            'post' => 'Post-summit',
                        ])
                        ->default('pre')
                        ->required()
                        ->native(false)
                        ->helperText('Updated automatically by cron.'),
                    TextInput::make('timezone')
                        ->default('America/New_York')
                        ->required()
                        ->maxLength(100),
                ]),

            Section::make('Phase schedule')
                ->description('Each phase starts at the timestamp below. The cron reads these to update current_phase.')
                ->columns(2)
                ->components([
                    DateTimePicker::make('pre_summit_starts_at')
                        ->label('Pre-summit starts')
                        ->seconds(false),
                    DateTimePicker::make('late_pre_summit_starts_at')
                        ->label('Late pre-summit starts')
                        ->seconds(false),
                    DateTimePicker::make('during_summit_starts_at')
                        ->label('During summit starts')
                        ->seconds(false),
                    DateTimePicker::make('post_summit_starts_at')
                        ->label('Post-summit starts')
                        ->seconds(false),
                    DateTimePicker::make('ends_at')
                        ->label('Ends at')
                        ->seconds(false)
                        ->columnSpanFull(),
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
            SpeakersRelationManager::class,
            FunnelsRelationManager::class,
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
}
