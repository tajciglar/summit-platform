<?php

namespace App\Filament\Resources\MediaItems\Pages;

use App\Filament\Resources\MediaItems\MediaItemResource;
use Filament\Facades\Filament;
use Filament\Resources\Pages\CreateRecord;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;

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
     * Hand the uploaded file to Spatie (via MediaItem::addMedia) with an
     * explicit filename, then back-fill the NOT NULL columns from the
     * resulting Media row. Uploads go to the `media-library.disk_name` disk
     * via MediaItemPathGenerator → `<category>/<media-item-uuid>/<filename>`.
     */
    protected function afterCreate(): void
    {
        $raw = $this->data['file_upload'] ?? null;
        $file = is_array($raw) ? (array_values($raw)[0] ?? null) : $raw;

        if (! $file) {
            return;
        }

        if ($file instanceof TemporaryUploadedFile) {
            $realPath = $file->getRealPath();
            $clientName = $file->getClientOriginalName();
        } else {
            $realPath = \Storage::disk('local')->path((string) $file);
            $clientName = basename((string) $file);
        }

        $media = $this->record
            ->addMedia($realPath)
            ->usingName(pathinfo($clientName, PATHINFO_FILENAME))
            ->usingFileName($clientName)
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
