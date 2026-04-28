<?php

namespace App\Filament\Resources\MediaItems\Pages;

use App\Enums\MediaCategory;
use App\Filament\Resources\MediaItems\MediaItemResource;
use App\Models\MediaItem;
use App\Services\Media\MediaItemCreator;
use App\Support\MediaTitle;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Hidden;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\CreateRecord;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Schema;
use Illuminate\Database\Eloquent\Model;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;

/**
 * Bulk upload + per-file categorization.
 *
 * Step 1 (top section): operator selects N files via a multiple FileUpload.
 *   `live()` + `afterStateUpdated` hydrates Step 2.
 * Step 2 (bottom Repeater): one row per uploaded file, each with title +
 *   required category + dependent sub_category. Thumbnails shown in section.
 *
 * On submit `handleRecordCreation()` iterates the uploaded files paired with
 * repeater rows and creates one MediaItem per pair via MediaItemCreator.
 */
class CreateMediaItem extends CreateRecord
{
    protected static string $resource = MediaItemResource::class;

    public function form(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Upload files')
                ->description('Pick one or many images. After upload each file gets its own row below.')
                ->components([
                    FileUpload::make('uploads')
                        ->label('Files')
                        ->disk('local')
                        ->directory('media-uploads')
                        ->multiple()
                        ->reorderable()
                        ->appendFiles()
                        ->image()
                        ->imagePreviewHeight('120')
                        ->acceptedFileTypes([
                            'image/jpeg', 'image/png', 'image/webp', 'image/avif',
                            'image/svg+xml', 'application/pdf',
                        ])
                        ->preserveFilenames()
                        ->required()
                        ->live()
                        ->dehydrated(false)
                        ->afterStateUpdated(function ($state, callable $set): void {
                            $files = is_array($state) ? array_values($state) : [];
                            $rows = [];

                            foreach ($files as $key => $file) {
                                $name = $file instanceof TemporaryUploadedFile
                                    ? $file->getClientOriginalName()
                                    : basename((string) $file);

                                $rows[] = [
                                    'file_key' => (string) $key,
                                    'file_name' => $name,
                                    'title' => MediaTitle::fromFilename($name),
                                    'category' => null,
                                    'sub_category' => null,
                                ];
                            }

                            $set('items', $rows);
                        }),
                ]),

            Section::make('Categorize')
                ->description('Each uploaded file needs a category. Sub-category is required once a category is picked.')
                ->visible(fn (Get $get): bool => filled($get('items')))
                ->components([
                    Repeater::make('items')
                        ->label('')
                        ->addable(false)
                        ->deletable(false)
                        ->reorderable(false)
                        ->columns(12)
                        ->itemLabel(fn (array $state): ?string => $state['title'] ?? $state['file_name'] ?? null)
                        ->schema([
                            Hidden::make('file_key'),
                            Hidden::make('file_name'),
                            TextInput::make('title')
                                ->label('Title')
                                ->required()
                                ->maxLength(255)
                                ->columnSpan(4),
                            Select::make('category')
                                ->label('Category')
                                ->options(MediaCategory::options())
                                ->required()
                                ->live()
                                ->afterStateUpdated(fn (callable $set) => $set('sub_category', null))
                                ->columnSpan(4),
                            Select::make('sub_category')
                                ->label('Sub-category')
                                ->options(fn (Get $get): array => ($cat = $get('category'))
                                    ? MediaCategory::from($cat)->subCategoryOptions()
                                    : [])
                                ->required()
                                ->columnSpan(4),
                        ]),
                ]),
        ]);
    }

    /**
     * Build N MediaItem rows by zipping the multi-file upload state with the
     * repeater rows. Returns the first row so the parent CreateRecord can
     * resolve a redirect target.
     *
     * @param  array<string, mixed>  $data
     */
    protected function handleRecordCreation(array $data): Model
    {
        $files = is_array($this->data['uploads'] ?? null)
            ? array_values($this->data['uploads'])
            : [];
        $rows = $data['items'] ?? [];

        if (empty($files) || empty($rows)) {
            Notification::make()
                ->title('No files to save')
                ->danger()
                ->send();

            $this->halt();
        }

        $creator = app(MediaItemCreator::class);
        $created = [];

        foreach (array_values($rows) as $i => $row) {
            $file = $files[$i] ?? null;
            if (! $file) {
                continue;
            }

            $created[] = $creator->fromUpload(
                source: $file instanceof TemporaryUploadedFile
                    ? $file
                    : (string) $file,
                category: (string) $row['category'],
                subCategory: $row['sub_category'] ?? null,
                caption: $row['title'] ?? null,
                title: $row['title'] ?? null,
            );
        }

        if (empty($created)) {
            Notification::make()
                ->title('No files saved')
                ->body('Each row needs a category before saving.')
                ->danger()
                ->send();

            $this->halt();
        }

        Notification::make()
            ->title('Uploaded '.count($created).' '.str('item')->plural(count($created)).' to the library')
            ->success()
            ->send();

        // Return the first created MediaItem so CreateRecord has a record to
        // resolve the redirect URL from.
        return $created[0];
    }

    /**
     * Bypass the default mutate-data hook — we don't fill MediaItem columns
     * directly; everything routes through MediaItemCreator above.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    protected function mutateFormDataBeforeCreate(array $data): array
    {
        return $data;
    }

    protected function getRedirectUrl(): string
    {
        return MediaItemResource::getUrl('index');
    }

    /** @return array<MediaItem> */
    protected function getCreatedItems(): array
    {
        return [];
    }
}
