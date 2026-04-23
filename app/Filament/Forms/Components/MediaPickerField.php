<?php

namespace App\Filament\Forms\Components;

use App\Services\Media\MediaItemCreator;
use Filament\Forms\Components\Field;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;

/**
 * JSON-backed media picker. Unlike MediaPickerInput (which binds to a model
 * via setMediaFor), this field writes the selected MediaItem UUID directly
 * into its state path — suitable for nested content JSON like
 * `data.content.hero.backgroundImageId`.
 */
class MediaPickerField extends Field
{
    protected string $view = 'filament.forms.components.media-picker-field';

    protected string $category = 'hero';

    protected string $role = 'image';

    protected ?string $subCategoryFilter = null;

    protected bool $allowUpload = true;

    public function category(string $category): static
    {
        $this->category = $category;

        return $this;
    }

    public function role(string $role): static
    {
        $this->role = $role;

        return $this;
    }

    public function subCategory(string $subCategory): static
    {
        $this->subCategoryFilter = $subCategory;

        return $this;
    }

    public function allowUpload(bool $allow = true): static
    {
        $this->allowUpload = $allow;

        return $this;
    }

    public function getCategory(): string
    {
        return $this->category;
    }

    public function getRole(): string
    {
        return $this->role;
    }

    public function getSubCategoryFilter(): ?string
    {
        return $this->subCategoryFilter;
    }

    public function isUploadAllowed(): bool
    {
        return $this->allowUpload;
    }

    /**
     * State path Livewire writes a TemporaryUploadedFile to when the operator
     * uploads via the inline dropzone. Lives alongside the main id state path.
     */
    public function getUploadStatePath(bool $absolute = true): string
    {
        return $this->getStatePath($absolute).'_upload';
    }

    protected function setUp(): void
    {
        parent::setUp();

        // Unlike MediaPickerInput, this field *is* dehydrated so its state
        // persists directly into the surrounding content JSON.
        $this->saveRelationshipsUsing(function (MediaPickerField $component): void {
            $livewire = $component->getLivewire();
            $uploadKey = $component->getUploadStatePath(false);
            $data = $livewire->data ?? [];

            $uploaded = data_get($data, $uploadKey);
            $uploadedFile = is_array($uploaded) ? ($uploaded[0] ?? null) : $uploaded;

            if ($uploadedFile instanceof TemporaryUploadedFile) {
                $newItem = app(MediaItemCreator::class)->fromUpload(
                    source: $uploadedFile,
                    category: $component->getCategory(),
                    subCategory: $component->getSubCategoryFilter(),
                );
                data_set($data, $uploadKey, null);
                data_set($data, $component->getStatePath(false), $newItem->getKey());
                $livewire->data = $data;
                $component->state($newItem->getKey());
            }
        });
    }
}
