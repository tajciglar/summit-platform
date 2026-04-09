<?php

namespace App\Filament\Resources\Summits\RelationManagers;

use App\Models\SummitChecklistTemplate;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Notifications\Notification;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Grouping\Group;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;

class ChecklistItemsRelationManager extends RelationManager
{
    protected static string $relationship = 'checklistItems';

    protected static ?string $title = 'Checklist';

    public static function getBadge(Model $ownerRecord, string $pageClass): ?string
    {
        $total = $ownerRecord->checklistItems()->count();
        if ($total === 0) {
            return null;
        }
        $done = $ownerRecord->checklistItems()->where('status', 'done')->count();

        return "{$done}/{$total}";
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('category')
                    ->options([
                        'core_pages' => 'Core Pages',
                        'program_pages' => 'Program Pages',
                        'upgrade_pages' => 'Upgrade Pages',
                        'checkout_pages' => 'Checkout Pages',
                        'circle_links' => 'Circle Links',
                    ])
                    ->required(),
                TextInput::make('name')->required()->maxLength(500),
                Select::make('page_type')
                    ->options([
                        'optin' => 'Opt-in',
                        'upsell' => 'Upsell',
                        'checkout' => 'Checkout',
                        'bump' => 'Bump',
                        'thank_you' => 'Thank You',
                        'bonuses' => 'Bonuses',
                        'program' => 'Program Page',
                        'upgrade' => 'Upgrade',
                        'downsell' => 'Downsell',
                    ]),
                Select::make('status')
                    ->options([
                        'not_started' => 'Not Started',
                        'in_progress' => 'In Progress',
                        'done' => 'Done',
                        'not_applicable' => 'N/A',
                    ])
                    ->default('not_started')
                    ->required(),
                TextInput::make('link_url')->label('Link URL')->url(),
                TextInput::make('content_link')->label('Content Link')->url(),
                TextInput::make('tags_wp')->label('WP Tags')
                    ->helperText('Comma-separated'),
                TextInput::make('tags_ac')->label('AC Tags')
                    ->helperText('Comma-separated'),
                Toggle::make('circle_access'),
                Toggle::make('welcome_survey'),
                TextInput::make('price_tier_cents')
                    ->label('Price Tier (cents)')
                    ->numeric()
                    ->placeholder('e.g. 7700 for $77'),
                TextInput::make('sort_order')->numeric()->default(0),
                Select::make('assigned_to')
                    ->relationship('assignedUser', 'name')
                    ->searchable()
                    ->preload(),
                Textarea::make('comments')->rows(2),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->groups([
                Group::make('category')
                    ->label('Category')
                    ->getTitleFromRecordUsing(fn ($record): string => match ($record->category) {
                        'core_pages' => 'Core Pages',
                        'program_pages' => 'Program Pages',
                        'upgrade_pages' => 'Upgrade Pages',
                        'checkout_pages' => 'Checkout Pages',
                        'circle_links' => 'Circle Links',
                        default => $record->category,
                    }),
            ])
            ->defaultGroup('category')
            ->reorderable('sort_order')
            ->columns([
                TextColumn::make('name')->searchable()->wrap(),
                TextColumn::make('page_type')
                    ->badge()
                    ->placeholder('—'),
                TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'not_started' => 'gray',
                        'in_progress' => 'warning',
                        'done' => 'success',
                        'not_applicable' => 'gray',
                        default => 'gray',
                    })
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'not_started' => 'Not Started',
                        'in_progress' => 'In Progress',
                        'done' => 'Done',
                        'not_applicable' => 'N/A',
                        default => $state,
                    }),
                TextColumn::make('link_url')
                    ->label('Link')
                    ->limit(30)
                    ->url(fn ($record) => $record->link_url, shouldOpenInNewTab: true)
                    ->placeholder('—'),
                TextColumn::make('assignedUser.name')
                    ->label('Assigned')
                    ->placeholder('—')
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('comments')
                    ->limit(30)
                    ->placeholder('—')
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->options([
                        'not_started' => 'Not Started',
                        'in_progress' => 'In Progress',
                        'done' => 'Done',
                        'not_applicable' => 'N/A',
                    ]),
            ])
            ->headerActions([
                CreateAction::make(),
                Action::make('applyTemplate')
                    ->label('Apply Template')
                    ->icon('heroicon-o-document-duplicate')
                    ->form([
                        Select::make('template_id')
                            ->label('Template')
                            ->options(SummitChecklistTemplate::pluck('name', 'id'))
                            ->required(),
                    ])
                    ->action(function (array $data) {
                        $template = SummitChecklistTemplate::with('items')->findOrFail($data['template_id']);
                        $summit = $this->getOwnerRecord();
                        $created = 0;

                        foreach ($template->items as $item) {
                            $exists = $summit->checklistItems()
                                ->where('template_item_id', $item->id)
                                ->exists();

                            if (! $exists) {
                                $summit->checklistItems()->create([
                                    'template_item_id' => $item->id,
                                    'category' => $item->category,
                                    'name' => $item->name,
                                    'page_type' => $item->page_type,
                                    'sort_order' => $item->sort_order,
                                    'tags_wp' => $item->default_tags,
                                    'tags_ac' => [],
                                ]);
                                $created++;
                            }
                        }

                        Notification::make()
                            ->title("Applied template: {$created} items created")
                            ->success()
                            ->send();
                    }),
            ])
            ->recordActions([EditAction::make(), DeleteAction::make()])
            ->toolbarActions([
                BulkActionGroup::make([DeleteBulkAction::make()]),
            ]);
    }
}
