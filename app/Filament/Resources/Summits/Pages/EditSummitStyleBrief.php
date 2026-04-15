<?php

namespace App\Filament\Resources\Summits\Pages;

use App\Filament\Resources\Summits\SummitResource;
use App\Jobs\BuildStyleBriefJob;
use App\Models\Summit;
use App\Services\StyleBrief\DefaultStyleBrief;
use Filament\Actions\Action;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\Page;

class EditSummitStyleBrief extends Page
{
    protected static string $resource = SummitResource::class;

    protected string $view = 'filament.resources.summits.pages.edit-summit-style-brief';

    protected static ?string $title = 'Style Brief';

    public Summit $record;

    public array $brief = [];

    public array $locked = [];

    public function mount(Summit $record): void
    {
        $this->record = $record;
        $this->brief = $record->style_brief ?? DefaultStyleBrief::get();
        $this->locked = $this->brief['_locked_fields'] ?? [];
    }

    public function save(): void
    {
        $this->brief['_locked_fields'] = array_values(array_unique($this->locked));
        $this->record->update(['style_brief' => $this->brief]);

        Notification::make()->title('Brief saved.')->success()->send();
    }

    public function regenerateFromUrl(): void
    {
        if (! $this->record->style_reference_url) {
            Notification::make()
                ->title('No style reference URL set for this summit.')
                ->warning()
                ->send();
            return;
        }

        BuildStyleBriefJob::dispatch($this->record->id);

        Notification::make()
            ->title('Rebuilding from URL — refresh shortly.')
            ->success()
            ->send();
    }

    public function resetBrief(): void
    {
        $this->brief = $this->record->style_brief ?? DefaultStyleBrief::get();
        $this->locked = $this->brief['_locked_fields'] ?? [];
        Notification::make()->title('Reset to saved version.')->send();
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('save')
                ->label('Save')
                ->color('primary')
                ->action('save'),
            Action::make('regenerateFromUrl')
                ->label('Regenerate from URL')
                ->color('warning')
                ->requiresConfirmation()
                ->modalDescription('This will rebuild the brief from the summit\'s style reference URL. Locked fields will be preserved.')
                ->action('regenerateFromUrl'),
            Action::make('reset')
                ->label('Reset')
                ->color('gray')
                ->action('resetBrief'),
            Action::make('back')
                ->label('Back to Summit')
                ->color('gray')
                ->url(fn () => SummitResource::getUrl('edit', ['record' => $this->record])),
        ];
    }
}
