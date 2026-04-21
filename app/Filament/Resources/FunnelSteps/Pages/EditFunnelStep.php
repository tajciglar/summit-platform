<?php

namespace App\Filament\Resources\FunnelSteps\Pages;

use App\Filament\Concerns\ManagesLandingPageDrafts;
use App\Filament\Resources\Funnels\FunnelResource;
use App\Filament\Resources\FunnelSteps\FunnelStepResource;
use App\Models\FunnelStep;
use App\Services\Templates\GoldenTemplates;
use App\Services\Templates\TemplateBlockFactory;
use Filament\Actions\DeleteAction;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\EditRecord;

class EditFunnelStep extends EditRecord
{
    use ManagesLandingPageDrafts;

    protected static string $resource = FunnelStepResource::class;

    protected string $view = 'filament.pages.focused-step-edit';

    protected static string $layout = 'filament.layouts.focused';

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }

    /**
     * Breadcrumb parent links to the step's funnel View page, so operators
     * can pop one level up from the block editor back to the funnel overview
     * (which shows all steps + landing-page drafts) rather than the global
     * FunnelStep list.
     *
     * @return array<string, string>
     */
    public function getBreadcrumbs(): array
    {
        /** @var FunnelStep $step */
        $step = $this->record;
        $funnel = $step->funnel;

        if (! $funnel) {
            return parent::getBreadcrumbs();
        }

        return [
            FunnelResource::getUrl('view', ['record' => $funnel]) => $funnel->name,
            $step->name,
            $this->getBreadcrumb(),
        ];
    }

    protected function getRedirectUrl(): ?string
    {
        // Stay on the edit page after save — the block editor is a working
        // surface, not a one-shot form. Returning null keeps Livewire on the
        // current page so fields stay editable and the user doesn't have to
        // click "Edit" again to continue.
        return null;
    }

    /**
     * Fires a browser event the Alpine wrapper listens for to reset the
     * "Saving…" button state and flash "Saved HH:MM".
     */
    protected function afterSave(): void
    {
        $this->dispatch('step-saved');
    }

    /**
     * page_content on disk is the canonical { template_key, content: {hero: {...}, ...} } map
     * (what Next.js reads). Filament Builder expects [{type, data}, ...] — convert on fill.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    protected function mutateFormDataBeforeFill(array $data): array
    {
        $data['page_content'] = app(TemplateBlockFactory::class)
            ->mapToBuilderList($data['page_content'] ?? null);

        return $data;
    }

    /**
     * Convert Builder list back to the canonical map before persisting,
     * preserving template_key / enabled_sections / audience / palette that
     * live outside the Builder-editable section bodies.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    protected function mutateFormDataBeforeSave(array $data): array
    {
        $original = $this->record->page_content;

        $data['page_content'] = app(TemplateBlockFactory::class)
            ->builderListToMap($data['page_content'] ?? [], is_array($original) ? $original : null);

        return $data;
    }

    /**
     * Seed page_content from a golden template (aps-parenting for optin,
     * aps-vip for sales). Called by the empty-state button so an operator
     * can go from blank step → fully editable section blocks in one click.
     */
    public function seedFromGoldenTemplate(): void
    {
        $stepType = (string) $this->record->step_type;
        $key = GoldenTemplates::keyForStepType($stepType);

        if ($key === null) {
            Notification::make()
                ->title('No golden template available')
                ->body("No template is mapped to step type '{$stepType}'.")
                ->warning()
                ->send();

            return;
        }

        $content = GoldenTemplates::contentFor($key, $this->record->funnel?->summit_id);

        $this->record->update(['page_content' => $content]);
        $this->record->refresh();

        $this->fillForm();

        Notification::make()
            ->title('Blocks generated')
            ->body('Starter content loaded — edit any section below.')
            ->success()
            ->send();
    }
}
