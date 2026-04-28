<?php

namespace App\Filament\Resources\MediaItems\Pages;

use App\Enums\MediaCategory;
use App\Filament\Resources\MediaItems\MediaItemResource;
use App\Support\MediaTitle;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;
use Filament\Schemas\Components\EmbeddedTable;
use Filament\Schemas\Components\RenderHook;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Schemas\Schema;
use Filament\View\PanelsRenderHook;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\UploadedFile;

class ListMediaItems extends ListRecords
{
    protected static string $resource = MediaItemResource::class;

    public ?string $activeSubCategory = null;

    /**
     * Receives files dropped anywhere on the list page (window-level dropzone
     * rendered via the BODY_END render hook). Livewire stores them as
     * TemporaryUploadedFile instances; `updatedBulkDropFiles` then persists
     * them and redirects to the Create page with rows pre-populated.
     *
     * @var array<int, UploadedFile>
     */
    public array $bulkDropFiles = [];

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
    }

    /**
     * Persist dropped files to the local disk (matching CreateMediaItem's
     * FileUpload directory) and stash their metadata in the session so the
     * Create page can hydrate the form with one repeater row per file.
     */
    public function updatedBulkDropFiles(): void
    {
        $rows = [];

        foreach ($this->bulkDropFiles as $file) {
            if (! $file instanceof UploadedFile) {
                continue;
            }

            $original = $file->getClientOriginalName();
            $path = $file->store('media-uploads', 'local');

            if (! $path) {
                continue;
            }

            $rows[] = [
                'path' => $path,
                'name' => $original,
                'title' => MediaTitle::fromFilename($original),
            ];
        }

        $this->bulkDropFiles = [];

        if (empty($rows)) {
            return;
        }

        session()->put('media_bulk_drop', $rows);

        $this->redirect(MediaItemResource::getUrl('create'), navigate: false);
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
