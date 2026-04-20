<?php

namespace App\Filament\Resources\Funnels\RelationManagers;

use App\Enums\LandingPageDraftStatus;
use App\Enums\SummitAudience;
use App\Filament\Concerns\ManagesLandingPageDrafts;
use App\Filament\Resources\Funnels\Pages\EditLandingPageDraftPage;
use App\Models\LandingPageDraft;
use App\Services\Templates\TemplateRegistry;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class LandingPageDraftsRelationManager extends RelationManager
{
    use ManagesLandingPageDrafts;

    protected static string $relationship = 'drafts';

    protected static ?string $title = 'Drafts';

    public function table(Table $table): Table
    {
        /** @var TemplateRegistry $registry */
        $registry = app(TemplateRegistry::class);

        return $table
            ->columns([
                TextColumn::make('template_key')
                    ->label('Template')
                    ->formatStateUsing(function (string $state, LandingPageDraft $record) use ($registry): string {
                        $label = $registry->exists($state) ? ($registry->get($state)['label'] ?? $state) : $state;
                        $palette = array_slice(array_values((array) ($record->palette ?? [])), 0, 5);
                        $swatches = collect($palette)
                            ->map(fn (string $hex): string => sprintf(
                                "<span style='display:inline-block;width:12px;height:12px;margin-right:2px;border-radius:3px;background:%s;border:1px solid rgba(0,0,0,.08)'></span>",
                                e($hex)
                            ))
                            ->implode('');

                        return "<div style='line-height:1.3'>
                            <div style='font-weight:600;color:#0f172a'>".e($label)."</div>
                            <div style='font-family:ui-monospace,Menlo,monospace;font-size:11px;color:#94a3b8'>".e($state)."</div>
                            <div style='margin-top:3px'>{$swatches}</div>
                        </div>";
                    })
                    ->html()
                    ->searchable(),

                TextColumn::make('version_number')
                    ->label('v')
                    ->formatStateUsing(fn (?int $state): string => $state !== null ? "v{$state}" : '—')
                    ->sortable(),

                TextColumn::make('audience')
                    ->label('Audience')
                    ->badge()
                    ->formatStateUsing(fn (?SummitAudience $state): string => $state?->label() ?? '—'),

                TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->color(fn (LandingPageDraftStatus $state): string => $state->badgeColor())
                    ->formatStateUsing(fn (LandingPageDraftStatus $state): string => $state->label()),

                TextColumn::make('created_at')
                    ->label('Created')
                    ->since()
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                SelectFilter::make('status')
                    ->options(
                        collect(LandingPageDraftStatus::cases())
                            ->mapWithKeys(fn (LandingPageDraftStatus $s): array => [$s->value => $s->label()])
                            ->all()
                    ),

                SelectFilter::make('audience')
                    ->options(
                        collect(SummitAudience::cases())
                            ->mapWithKeys(fn (SummitAudience $s): array => [$s->value => $s->label()])
                            ->all()
                    ),

                SelectFilter::make('template_key')
                    ->options(fn () => collect($registry->allKeys())
                        ->mapWithKeys(fn (string $key): array => [
                            $key => $registry->exists($key) ? ($registry->get($key)['label'] ?? $key) : $key,
                        ])
                        ->all()),
            ])
            ->headerActions([
                // Generate variants action will be added in Task 4.
            ])
            ->recordActions([
                Action::make('view')
                    ->label('View')
                    ->url(fn (LandingPageDraft $record): ?string => $record->preview_token
                        ? rtrim((string) config('next.url', 'http://localhost:3000'), '/')."/preview/{$record->preview_token}"
                        : null)
                    ->openUrlInNewTab()
                    ->visible(fn (LandingPageDraft $record): bool => ! empty($record->preview_token)),

                Action::make('edit')
                    ->label('Edit')
                    ->url(fn (LandingPageDraft $record): string => EditLandingPageDraftPage::getUrl([
                        'record' => $this->ownerRecord->getKey(),
                        'draft' => $record->id,
                    ])),

                Action::make('publish')
                    ->label('Publish')
                    ->color('primary')
                    ->requiresConfirmation()
                    ->modalHeading('Publish this variant as the live landing page?')
                    ->modalSubmitActionLabel('Publish')
                    ->visible(fn (LandingPageDraft $record): bool => $record->status->isPublishable())
                    ->action(function (LandingPageDraft $record): void {
                        $this->publishDraft($record->id);
                    }),

                DeleteAction::make()
                    ->label('×')
                    ->modalHeading('Delete draft?')
                    ->hidden(fn (LandingPageDraft $record): bool => ! $record->status->isDeletable())
                    ->action(function (LandingPageDraft $record): void {
                        $this->deleteDraft($record->id);
                    }),
            ])
            ->emptyStateHeading('No drafts yet')
            ->emptyStateDescription('Click Generate variants to kick off AI generation.');
    }
}
