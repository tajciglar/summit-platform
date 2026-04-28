<?php

namespace App\Filament\Resources\MediaItems;

use App\Enums\MediaCategory;
use App\Filament\Resources\MediaItems\Pages\CreateMediaItem;
use App\Filament\Resources\MediaItems\Pages\ListMediaItems;
use App\Models\MediaItem;
use Filament\Actions\DeleteAction;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class MediaItemResource extends Resource
{
    protected static ?string $model = MediaItem::class;

    protected static string|\BackedEnum|null $navigationIcon = Heroicon::Photo;

    protected static string|\UnitEnum|null $navigationGroup = 'Media';

    protected static ?string $navigationLabel = 'Media library';

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Select::make('category')
                ->options(MediaCategory::options())
                ->required()
                ->live()
                ->afterStateUpdated(fn (callable $set) => $set('sub_category', null)),
            Select::make('sub_category')
                ->label('Sub-category')
                ->options(fn (Get $get): array => ($cat = $get('category'))
                    ? MediaCategory::from($cat)->subCategoryOptions()
                    : [])
                ->disabled(fn (Get $get): bool => blank($get('category')))
                ->required(),
            TextInput::make('caption')->maxLength(255),
            TextInput::make('alt_text')->maxLength(500),
            FileUpload::make('file_upload')
                ->label('File')
                ->disk('local')
                ->directory('media-uploads')
                ->image()
                ->acceptedFileTypes([
                    'image/jpeg', 'image/png', 'image/webp', 'image/avif',
                    'image/svg+xml', 'application/pdf',
                ])
                ->preserveFilenames()
                ->required()
                ->dehydrated(false),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('thumb')
                    ->state(fn (MediaItem $r) => $r->thumbUrl()),
                TextColumn::make('category')->badge()->sortable(),
                TextColumn::make('sub_category')->toggleable(),
                TextColumn::make('caption')->searchable(),
                TextColumn::make('attachments_count')
                    ->counts('attachments')
                    ->label('Used in')
                    ->formatStateUsing(fn (int $state): string => $state.' places'),
                TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->filters([
                SelectFilter::make('category')->options(MediaCategory::options()),
            ])
            ->recordActions([
                DeleteAction::make()
                    ->before(function (MediaItem $record, DeleteAction $action) {
                        if ($record->attachments()->count() > 0) {
                            Notification::make()
                                ->title('In use')
                                ->body('This item is attached to one or more records. Detach it first.')
                                ->danger()
                                ->send();
                            $action->cancel();
                        }
                    }),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListMediaItems::route('/'),
            'create' => CreateMediaItem::route('/create'),
        ];
    }
}
