<?php

namespace App\Filament\Resources\MediaItems\Pages;

use App\Enums\MediaCategory;
use App\Filament\Resources\MediaItems\MediaItemResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;
use Filament\Schemas\Components\EmbeddedTable;
use Filament\Schemas\Components\RenderHook;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Schemas\Schema;
use Filament\View\PanelsRenderHook;
use Illuminate\Database\Eloquent\Builder;

class ListMediaItems extends ListRecords
{
    protected static string $resource = MediaItemResource::class;

    public ?string $activeSubCategory = null;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
    }

    /**
     * Top-level tabs (one per MediaCategory + "All"). Each category tab also
     * filters by `$activeSubCategory` when the operator has drilled into a
     * sub-category via the secondary tab row.
     *
     * @return array<string, Tab>
     */
    public function getTabs(): array
    {
        $tabs = ['all' => Tab::make('All')];

        foreach (MediaCategory::cases() as $category) {
            $tabs[$category->value] = Tab::make($category->label())
                ->modifyQueryUsing(function (Builder $query) use ($category): Builder {
                    $query->where('category', $category->value);

                    if (filled($this->activeSubCategory) && $this->activeSubCategory !== 'all') {
                        $query->where('sub_category', $this->activeSubCategory);
                    }

                    return $query;
                });
        }

        return $tabs;
    }

    public function updatedActiveTab(): void
    {
        parent::updatedActiveTab();

        $this->activeSubCategory = null;
    }

    public function updatedActiveSubCategory(): void
    {
        $this->resetPage();
    }

    public function content(Schema $schema): Schema
    {
        $components = [$this->getTabsContentComponent()];

        if ($subCategoryTabs = $this->getSubCategoryTabsComponent()) {
            $components[] = $subCategoryTabs;
        }

        $components[] = RenderHook::make(PanelsRenderHook::RESOURCE_PAGES_LIST_RECORDS_TABLE_BEFORE);
        $components[] = EmbeddedTable::make();
        $components[] = RenderHook::make(PanelsRenderHook::RESOURCE_PAGES_LIST_RECORDS_TABLE_AFTER);

        return $schema->components($components);
    }

    /**
     * Secondary tab row: appears only when a category tab is active and exposes
     * its sub-category vocabulary (e.g. Product → Product / Bump / Upsell).
     */
    protected function getSubCategoryTabsComponent(): ?Tabs
    {
        if (blank($this->activeTab) || $this->activeTab === 'all') {
            return null;
        }

        $category = MediaCategory::tryFrom($this->activeTab);

        if (! $category) {
            return null;
        }

        $subTabs = ['all' => Tab::make('All')];

        foreach ($category->subCategoryOptions() as $key => $label) {
            $subTabs[$key] = Tab::make($label);
        }

        return Tabs::make()
            ->key('mediaItemSubCategoryTabs')
            ->livewireProperty('activeSubCategory')
            ->contained(false)
            ->tabs($subTabs);
    }
}
