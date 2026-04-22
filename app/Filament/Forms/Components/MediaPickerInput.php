<?php

namespace App\Filament\Forms\Components;

use App\Models\MediaItem;
use Filament\Forms\Components\Field;

class MediaPickerInput extends Field
{
    protected string $view = 'filament.forms.components.media-picker-input';

    protected string $category = 'product';

    protected string $role = 'image';

    protected ?string $subCategoryFilter = null;

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

            $item = $state ? MediaItem::find($state) : null;
            $record->setMediaFor($component->getRole(), $item);
        });
    }
}
