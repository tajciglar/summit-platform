<?php

namespace App\Filament\Pages;

use App\Filament\Forms\Components\MediaPickerInput;
use App\Models\AppSettings;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Forms\Components\ColorPicker;
use Filament\Forms\Components\Select;
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
                Section::make('Brand')
                    ->description('Shown in email templates, customer-facing pages, and the admin panel header.')
                    ->columns(2)
                    ->components([
                        TextInput::make('company_name')
                            ->required()
                            ->maxLength(255),
                        ColorPicker::make('brand_color')
                            ->placeholder('#4F46E5'),
                        MediaPickerInput::make('logo_media_item_id')
                            ->category('brand')
                            ->subCategory('logo')
                            ->role('logo')
                            ->label('Logo')
                            ->captionUsing(fn (AppSettings $record): string => ($record->company_name ?: 'Platform').' — logo')
                            ->altTextUsing(fn (AppSettings $record): string => ($record->company_name ?: 'Platform').' logo')
                            ->columnSpanFull(),
                    ]),

                Section::make('Email')
                    ->columns(2)
                    ->components([
                        TextInput::make('sender_name')
                            ->placeholder('Summit Builder')
                            ->maxLength(255),
                        TextInput::make('sender_email')
                            ->email()
                            ->placeholder('hello@example.com')
                            ->maxLength(255),
                        TextInput::make('support_email')
                            ->email()
                            ->placeholder('support@example.com')
                            ->maxLength(255)
                            ->columnSpanFull(),
                    ]),

                Section::make('Commerce')
                    ->columns(2)
                    ->components([
                        Select::make('default_currency')
                            ->options([
                                'USD' => 'US Dollar',
                                'EUR' => 'Euro',
                                'GBP' => 'British Pound',
                                'CAD' => 'Canadian Dollar',
                                'AUD' => 'Australian Dollar',
                            ])
                            ->default('USD')
                            ->required()
                            ->native(false),
                        TextInput::make('stripe_publishable_key')
                            ->prefix('pk_')
                            ->maxLength(255)
                            ->helperText('Optional override. Leave blank to use env STRIPE_KEY.'),
                    ]),

                Section::make('Integrations')
                    ->columns(2)
                    ->collapsed()
                    ->components([
                        TextInput::make('activecampaign_list_id')
                            ->label('ActiveCampaign default list ID')
                            ->maxLength(100),
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
