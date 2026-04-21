<?php

namespace App\Filament\Resources\MediaItems\Pages;

use App\Filament\Resources\MediaItems\MediaItemResource;
use Filament\Facades\Filament;
use Filament\Resources\Pages\CreateRecord;

class CreateMediaItem extends CreateRecord
{
    protected static string $resource = MediaItemResource::class;

    /**
     * Inject tenant, owner, and sentinel path/file_name so the NOT NULL
     * columns pass the DB insert. Real values are written in afterCreate().
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $data['domain_id'] = Filament::getTenant()?->getKey();
        $data['created_by_user_id'] = auth()->id();
        $data['path'] = '';
        $data['file_name'] = '';
        $data['size'] = 0;

        return $data;
    }

    /**
     * After the MediaItem row exists, attach the uploaded file via
     * addMediaFromDisk and back-fill path / file_name / size / mime_type
     * from the resulting Spatie Media instance.
     */
    protected function afterCreate(): void
    {
        /**
         * Use the raw Livewire component state instead of $this->form->getState()
         * because `->dehydrated(false)` excludes file_upload from the dehydrated
         * output. After form validation, saveUploadedFiles() has already moved the
         * temp file to the target disk and updated $this->data in place.
         *
         * @var string|null $uploadedPath
         */
        $raw = $this->data['file_upload'] ?? null;

        // FileUpload stores state as an array of paths, even for single-file uploads.
        $uploadedPath = is_array($raw) ? (array_values($raw)[0] ?? null) : $raw;

        if (! $uploadedPath) {
            return;
        }

        $disk = config('media-library.disk_name');

        $media = $this->record
            ->addMediaFromDisk($uploadedPath, $disk)
            ->toMediaCollection('file');

        $this->record->update([
            'disk' => $media->disk,
            'path' => $media->getPathRelativeToRoot(),
            'file_name' => $media->file_name,
            'size' => $media->size,
            'mime_type' => $media->mime_type,
        ]);
    }
}
