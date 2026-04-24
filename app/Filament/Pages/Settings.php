<?php

namespace App\Filament\Pages;

use App\Models\AppSettings;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use UnitEnum;

class Settings extends Page
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedCog6Tooth;

    protected static string|UnitEnum|null $navigationGroup = 'Settings';

    protected static ?int $navigationSort = 1;

    protected static ?string $title = 'General settings';

    protected string $view = 'filament.pages.settings';

    /** @var array<string, mixed>|null */
    public ?array $data = [];

    public function mount(): void
    {
        $this->form->fill(AppSettings::current()->toArray());
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->record(AppSettings::current())
            ->statePath('data')
            ->components([
                Section::make('Integrations')
                    ->description('Platform-wide service credentials. Per-brand overrides (logo, sender email, AC tag) live on each Domain.')
                    ->columns(2)
                    ->components([
                        TextInput::make('activecampaign_list_id')
                            ->label('ActiveCampaign default list ID')
                            ->maxLength(100)
                            ->helperText('Contacts who opt in are added to this list unless a domain overrides it.')
                            ->columnSpanFull(),
                    ]),
            ]);
    }

    /**
     * @return array<string, Action>
     */
    protected function getFormActions(): array
    {
        return [
            Action::make('save')
                ->label('Save changes')
                ->submit('save'),
        ];
    }

    public function save(): void
    {
        $data = $this->form->getState();

        AppSettings::current()->update($data);

        Notification::make()
            ->title('Settings saved')
            ->success()
            ->send();
    }
}
