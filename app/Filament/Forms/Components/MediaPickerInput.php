<?php

namespace App\Filament\Forms\Components;

use App\Models\MediaItem;
use App\Services\Media\MediaItemCreator;
use Filament\Forms\Components\Field;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;

class MediaPickerInput extends Field
{
    protected string $view = 'filament.forms.components.media-picker-input';

    protected string $category = 'product';

    protected string $role = 'image';

    protected ?string $subCategoryFilter = null;

    protected bool $allowUpload = true;

    /** @var \Closure|null fn (Model): ?string */
    public ?\Closure $captionUsing = null;

    /** @var \Closure|null fn (Model): ?string */
    public ?\Closure $altTextUsing = null;

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

    /**
     * Narrow the picker list to a single sub_category within the category.
     * Matches the fixed vocabulary in MediaCategory::subCategoryOptions().
     */
    public function subCategory(string $subCategory): static
    {
        $this->subCategoryFilter = $subCategory;

        return $this;
    }

    /**
     * Allow/disable inline file uploads. Default true — uploads are the primary
     * UX; the library picker is secondary. Pass false for library-only fields.
     */
    public function allowUpload(bool $allow = true): static
    {
        $this->allowUpload = $allow;

        return $this;
    }

    /**
     * Derive the caption for new MediaItems created via inline upload from the
     * attached record (e.g. speaker name). Not applied to library-picked items.
     */
    public function captionUsing(\Closure $fn): static
    {
        $this->captionUsing = $fn;

        return $this;
    }

    /**
     * Derive the alt_text for new MediaItems created via inline upload.
     */
    public function altTextUsing(\Closure $fn): static
    {
        $this->altTextUsing = $fn;

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
     * uploads via the inline dropzone. Lives alongside the main media_item_id
     * state path so the Livewire component can bind `wire:model` to it.
     */
    public function getUploadStatePath(bool $absolute = true): string
    {
        return $this->getStatePath($absolute).'_upload';
    }

    protected function setUp(): void
    {
        parent::setUp();

        $this->afterStateHydrated(function (MediaPickerInput $component, mixed $state): void {
            if ($state !== null) {
                return;
            }

            $record = $component->getRecord();

            if ($record && method_exists($record, 'mediaFor')) {
                $component->state($record->mediaFor($component->getRole())?->getKey());
            }
        });

        $this->dehydrated(false);

        $this->saveRelationshipsUsing(function (MediaPickerInput $component, mixed $state): void {
            $record = $component->getRecord();

            if (! $record || ! method_exists($record, 'setMediaFor')) {
                return;
            }

            $livewire = $component->getLivewire();
            $uploadKey = $component->getUploadStatePath(false);
            $data = $livewire->data ?? [];

            $uploaded = data_get($data, $uploadKey);
            $uploadedFile = is_array($uploaded) ? ($uploaded[0] ?? null) : $uploaded;

            if ($uploadedFile instanceof TemporaryUploadedFile) {
                $caption = $component->captionUsing
                    ? ($component->captionUsing)($record)
                    : null;
                $altText = $component->altTextUsing
                    ? ($component->altTextUsing)($record)
                    : null;

                $newItem = app(MediaItemCreator::class)->fromUpload(
                    source: $uploadedFile,
                    category: $component->getCategory(),
                    subCategory: $component->getSubCategoryFilter(),
                    caption: $caption,
                    altText: $altText,
                );
                $state = $newItem->getKey();

                // Clear the pending upload and push the new MediaItem's ID into
                // the live Livewire state so the re-render after save shows the
                // image without a full-page refresh.
                data_set($data, $uploadKey, null);
                data_set($data, $component->getStatePath(false), $state);
                $livewire->data = $data;
                $component->state($state);
            }

            $item = $state ? MediaItem::find($state) : null;
            $record->setMediaFor($component->getRole(), $item);
        });
    }
}
